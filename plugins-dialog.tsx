"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Mic, Volume2, Blocks, Loader2, AlertCircle } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { useSpeech } from "@/lib/use-speech";

export function PluginsDialog({
  open,
  onOpenChange,
  onInsertText,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onInsertText: (text: string) => void;
}) {
  const { settings, updatePlugins } = useChatStore();
  const { supported } = useSpeech();

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [scrapeResult, setScrapeResult] = useState<{ title: string; text: string; url: string } | null>(
    null
  );

  const runScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    setScrapeError("");
    setScrapeResult(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScrapeError(data.error || "Failed to scrape that page.");
      } else {
        setScrapeResult(data);
      }
    } catch {
      setScrapeError("Network error while scraping.");
    } finally {
      setScraping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Plugins</DialogTitle>
          <DialogDescription>
            Extend what the assistant can do in this chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <PluginRow
            icon={Globe}
            title="Web search"
            description="Lets the model search the live web for current information (uses Anthropic's built-in search tool)."
            checked={settings.plugins.webSearch}
            onCheckedChange={(v) => updatePlugins({ webSearch: v })}
          />
          <PluginRow
            icon={Volume2}
            title="Speak replies aloud"
            description={supported ? "Reads assistant replies out loud using your browser's voice." : "Not supported in this browser."}
            checked={settings.plugins.voiceOut}
            disabled={!supported}
            onCheckedChange={(v) => updatePlugins({ voiceOut: v })}
          />
          <PluginRow
            icon={Mic}
            title="Voice input"
            description={supported ? "Adds a mic button to dictate your messages." : "Not supported in this browser."}
            checked={settings.plugins.voiceIn}
            disabled={!supported}
            onCheckedChange={(v) => updatePlugins({ voiceIn: v })}
          />
          <PluginRow
            icon={Blocks}
            title="Auto-open artifacts"
            description="Automatically opens the artifact panel when the assistant generates code, a page, or a document."
            checked={settings.plugins.codeArtifacts}
            onCheckedChange={(v) => updatePlugins({ codeArtifacts: v })}
          />

          {/* Web scrape utility — clearnet only */}
          <div className="rounded-xl border border-foreground/10 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <p className="text-sm font-medium">Scrape a web page</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fetches a regular http(s) page server-side and pulls out the readable text, which
              you can drop straight into the conversation as context. Dark-web (.onion) and local
              network addresses are blocked.
            </p>
            <div className="flex gap-2">
              <Input
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="h-10 rounded-lg text-sm"
                onKeyDown={(e) => e.key === "Enter" && runScrape()}
              />
              <Button
                onClick={runScrape}
                disabled={scraping || !scrapeUrl.trim()}
                className="h-10 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90 shrink-0"
              >
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
              </Button>
            </div>

            {scrapeError && (
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {scrapeError}
              </div>
            )}

            {scrapeResult && (
              <div className="rounded-lg bg-secondary p-3 space-y-2">
                <p className="text-sm font-medium truncate">{scrapeResult.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-4">{scrapeResult.text}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs h-8"
                  onClick={() => {
                    onInsertText(
                      `Here's content scraped from ${scrapeResult.url} ("${scrapeResult.title}"):\n\n${scrapeResult.text}`
                    );
                    onOpenChange(false);
                  }}
                >
                  Insert into chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PluginRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-foreground/10 p-4">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
