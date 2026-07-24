"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, Square, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatSidebar } from "@/components/chat/sidebar";
import { RightPanel } from "@/components/chat/right-panel";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ThinkingSphere } from "@/components/chat/thinking-sphere";
import { ApiKeysDialog } from "@/components/chat/api-keys-dialog";
import { PluginsDialog } from "@/components/chat/plugins-dialog";
import { useChatStore, uid, type ChatMessage } from "@/lib/chat-store";
import { useSpeech } from "@/lib/use-speech";
import { useSkills, buildSkillsContext } from "@/lib/use-skills";

export default function ChatPage() {
  const { activeThread, activeThreadId, appendMessage, updateMessage, settings } = useChatStore();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"artifacts" | "connections" | "skills">("artifacts");
  const [focusArtifactId, setFocusArtifactId] = useState<string | null>(null);
  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const [pluginsOpen, setPluginsOpen] = useState(false);
  const [readingUrl, setReadingUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { speak, startListening, stopListening, listening, supported } = useSpeech();
  const { skills } = useSkills();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeThread?.messages.length, activeThread?.messages]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || !activeThreadId || busy) return;

    if (!settings.apiKey) {
      setError("Add your Anthropic API key first (API keys button in the sidebar).");
      setApiKeysOpen(true);
      return;
    }

    setError("");
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content, createdAt: Date.now() };
    appendMessage(activeThreadId, userMsg, { titleIfEmpty: content });

    const assistantId = uid();
    appendMessage(activeThreadId, {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    });

    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const history = [...(activeThread?.messages || []), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // If the message contains a link, read it server-side first (clearnet
      // only — same guardrails as the Plugins scrape utility) and fold the
      // page's text into what's actually sent to the model, without
      // touching the message bubble the user sees.
      const urlMatch = content.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        setReadingUrl(urlMatch[0]);
        try {
          const scrapeRes = await fetch("/api/scrape", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ url: urlMatch[0] }),
          });
          const scrapeData = await scrapeRes.json();
          if (scrapeRes.ok && scrapeData.text) {
            history[history.length - 1] = {
              role: "user",
              content: `Content fetched from ${scrapeData.url} ("${scrapeData.title}"):\n\n${scrapeData.text}\n\n---\n\n${content}`,
            };
          }
        } catch {
          // if the fetch fails, fall through and send the message as-is
        } finally {
          setReadingUrl(null);
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", "x-api-key": settings.apiKey },
        body: JSON.stringify({
          model: settings.model,
          system: settings.systemPrompt + buildSkillsContext(skills),
          messages: history,
          webSearch: settings.plugins.webSearch,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              full += evt.delta.text;
              updateMessage(activeThreadId, assistantId, { content: full, streaming: true }, { persist: false });
            } else if (evt.type === "error") {
              throw new Error(evt.error?.message || "Streaming error.");
            }
          } catch {
            // ignore malformed/partial lines
          }
        }
      }

      updateMessage(activeThreadId, assistantId, { content: full, streaming: false }, { persist: true });

      if (settings.plugins.codeArtifacts && /```/.test(full)) {
        setFocusArtifactId(`${assistantId}-0`);
        setPanelTab("artifacts");
        setPanelOpen(true);
      }

      if (settings.plugins.voiceOut && full) {
        const prose = full.replace(/```[\s\S]*?```/g, "").trim();
        if (prose) speak(prose.slice(0, 600));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      updateMessage(activeThreadId, assistantId, {
        content: message.startsWith("The user aborted") ? "(stopped)" : `⚠️ ${message}`,
        streaming: false,
      }, { persist: true });
      if (!message.startsWith("The user aborted")) setError(message);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const onMicClick = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening((finalText) => {
      setInput((prev) => (prev ? prev + " " + finalText : finalText));
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        onOpenArtifacts={() => {
          setPanelTab("artifacts");
          setPanelOpen(true);
        }}
        onOpenConnections={() => {
          setPanelTab("connections");
          setPanelOpen(true);
        }}
        onOpenPlugins={() => setPluginsOpen(true)}
        onOpenApiKeys={() => setApiKeysOpen(true)}
        onOpenSkills={() => {
          setPanelTab("skills");
          setPanelOpen(true);
        }}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
            {(!activeThread || activeThread.messages.length === 0) && (
              <div className="py-20 text-center">
                <h1 className="text-4xl font-display tracking-tight mb-3">
                  What should we build?
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask a question, or ask for a website, dashboard, document, or game — it'll
                  render live in the artifacts panel.
                </p>
                {!settings.apiKey && (
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full"
                    onClick={() => setApiKeysOpen(true)}
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Add your API key to get started
                  </Button>
                )}
              </div>
            )}

            {activeThread?.messages.map((m) =>
              m.streaming && !m.content ? (
                <ThinkingSphere key={m.id} label={readingUrl ? `Reading ${new URL(readingUrl).hostname}` : "Thinking"} />
              ) : (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onOpenArtifact={(artifactId) => {
                    setFocusArtifactId(artifactId);
                    setPanelTab("artifacts");
                    setPanelOpen(true);
                  }}
                  onSpeak={speak}
                />
              )
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto w-full px-6">
            <p className="text-sm text-destructive pb-2">{error}</p>
          </div>
        )}

        <div className="border-t border-foreground/10 bg-background">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-end gap-2 rounded-2xl border border-foreground/15 bg-secondary/40 p-2 focus-within:border-foreground/30 transition-colors">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Message Optimus…"
                className="min-h-[44px] max-h-40 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[15px]"
              />
              {settings.plugins.voiceIn && supported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onMicClick}
                  className={`rounded-full shrink-0 ${listening ? "bg-destructive/10 text-destructive" : ""}`}
                  aria-label="Dictate"
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              {busy ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={stop}
                  className="rounded-full shrink-0 bg-foreground text-background hover:bg-foreground/90"
                  aria-label="Stop"
                >
                  <Square className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  className="rounded-full shrink-0 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                  aria-label="Send"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center font-mono">
              {settings.plugins.webSearch ? "Web search on · " : ""}
              {settings.model}
            </p>
          </div>
        </div>
      </main>

      <RightPanel
        open={panelOpen}
        defaultTab={panelTab}
        thread={activeThread}
        focusArtifactId={focusArtifactId}
        onClose={() => setPanelOpen(false)}
        onUseSkill={(code, title) => {
          setInput((prev) => (prev ? prev + "\n\n" : "") + `Here's my saved "${title}" skill:\n\n\`\`\`\n${code}\n\`\`\`\n\n`);
          setPanelOpen(false);
        }}
      />

      <ApiKeysDialog open={apiKeysOpen} onOpenChange={setApiKeysOpen} />
      <PluginsDialog open={pluginsOpen} onOpenChange={setPluginsOpen} onInsertText={(t) => setInput((prev) => (prev ? prev + "\n\n" + t : t))} />
    </div>
  );
}
