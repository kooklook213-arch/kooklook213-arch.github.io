"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  /** true while an assistant message is still streaming in (local-only, never persisted) */
  streaming?: boolean;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type PluginSettings = {
  webSearch: boolean; // Anthropic's built-in web_search tool
  voiceOut: boolean; // speak replies aloud (Web Speech API)
  voiceIn: boolean; // mic dictation (Web Speech API)
  codeArtifacts: boolean; // auto-open fenced code as artifacts
};

export type AppSettings = {
  apiKey: string;
  model: string;
  systemPrompt: string;
  plugins: PluginSettings;
};

const SETTINGS_KEY = "optimus.settings";

export const MODEL_OPTIONS = [
  { value: "claude-sonnet-5", label: "Claude Sonnet 5 — balanced" },
  { value: "claude-opus-4-8", label: "Claude Opus 4.8 — most capable" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — fastest" },
];

const BUILD_QUALITY_GUIDANCE = `
Artifact contract — follow this exactly so what you build actually renders live:

- For an interactive app, dashboard, or anything with real state, prefer a "jsx" block that
  defines a single top-level component named exactly \`App\` (e.g. \`function App() { ... }\`).
  Do NOT use import or export statements — React is provided globally, so destructure hooks
  as \`const { useState, useEffect, useRef, useMemo } = React;\` at the top of the block. Tailwind
  utility classes are available on every element with no setup. Do not use lucide-react or any
  other npm package — use inline SVG or plain text/emoji for icons instead.
- For a 3D scene or 3D game, use a "threejs" block. Three.js r128 is provided globally as
  \`THREE\` and a full-viewport \`<canvas id="scene">\` already exists in the page — grab it with
  \`document.getElementById("scene")\` and pass it to your \`THREE.WebGLRenderer({ canvas })\`. Do
  NOT use import/export or \`THREE.OrbitControls\` (unavailable in r128) or
  \`THREE.CapsuleGeometry\` (r142+ only) — build controls from raw pointer/keyboard events and
  use \`CylinderGeometry\`/\`SphereGeometry\`/custom geometry instead. Drive the render loop with
  \`requestAnimationFrame\`, and handle \`window.addEventListener("resize", ...)\` to keep the
  camera/renderer sized to the viewport.
- For a static page, landing page, or document, use a single self-contained "html" block with
  inline <style> and <script> — no external requests except the Tailwind/React/Three.js CDNs
  already available.
- The preview runs in a sandboxed iframe with no persistent storage — never use localStorage
  or sessionStorage in generated code; keep all state in memory (React state or plain JS
  variables), since storage calls will throw and break the app.
- Build the real thing, not a placeholder: working interactivity (state updates, form
  validation, filtering, calculations — whatever the request implies), sensible layout and
  spacing, and no "TODO" stubs where working logic was asked for. Prefer one clean, complete
  component/page over several fragments.`;

export const DEFAULT_SYSTEM_PROMPT = `You are a general-purpose build assistant embedded in a product called Optimus.
You can hold a normal conversation, and you can also build things on request: websites,
landing pages, documents, dashboards, small games, scripts, and diagrams.

When the user asks you to build or generate something visual or runnable, respond with a
short sentence of context and then a single fenced code block with an accurate language tag
(html, jsx, tsx, javascript, python, css, json, or markdown). Keep prose around the code block
brief — the code block itself is the deliverable.
${BUILD_QUALITY_GUIDANCE}

When asked to research, connect facts, or investigate a topic, work like an analyst: state
each fact plainly, then explicitly connect it to the next one ("A leads to B because...", "B
is linked to C via..."), building a short chain of reasoning the user can follow step by step,
the way an investigator pins facts to a board and draws threads between them.

Be direct, precise, and undramatic. Ask a clarifying question only when the request is
genuinely ambiguous; otherwise make a reasonable assumption, state it in one line, and proceed.`;

export const TERMINAL_SYSTEM_PROMPT = `You are an AI pair-programmer running inside a terminal-style interface, in the
spirit of Claude Code. You read requests, write and edit code, explain your plan briefly,
then show the code. Default to concise, engineer-to-engineer tone — plain sentences, no
fluff, no excessive enthusiasm. When you produce code, use a single fenced code block with
an accurate language tag. Prefer complete, runnable snippets over fragments. If a task is
ambiguous, state the assumption you're making in one line and proceed rather than stalling
on questions.
${BUILD_QUALITY_GUIDANCE}`;

export const JOB_SEARCH_SYSTEM_PROMPT = `You are a job search assistant with live web search. Given a role, location, and any
other criteria, search the web for current, real, publicly posted job openings that match.
Respond with ONLY a single fenced \`\`\`json code block containing an array of up to 8 objects,
each shaped exactly like:
{"title": string, "company": string, "location": string, "url": string, "summary": string}
"summary" should be one plain sentence on what the role involves and why it matches. Only
include listings you found via search with a real URL — never invent a listing. No prose
outside the code block.`;
export const AGENT_PLAN_SYSTEM_PROMPT = `You break a goal down into a short, concrete execution plan.
Respond with ONLY a numbered list of 3 to 6 steps (no preamble, no closing remarks). Each step
should be a single concise sentence describing one concrete piece of work (research, a piece of
copy, a code artifact, etc). Number them "1.", "2.", and so on.`;

export const AGENT_STEP_SYSTEM_PROMPT = `You are an autonomous build agent working through a plan one step at a
time, in the spirit of an investigator connecting one fact to the next. You will be told the overall
goal, the full plan, and which single step to execute now. Do only that step. If it calls for code,
a document, a webpage, or a script, produce it as a single fenced code block with an accurate
language tag. Keep prose brief — state what you're doing in a line or two, then deliver it. Do not
repeat earlier steps' output, and do not restate the whole plan.
${BUILD_QUALITY_GUIDANCE}`;

const defaultSettings: AppSettings = {
  apiKey: "",
  model: MODEL_OPTIONS[0].value,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  plugins: {
    webSearch: false,
    voiceOut: false,
    voiceIn: false,
    codeArtifacts: true,
  },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type ChatContextValue = {
  threads: Thread[];
  activeThreadId: string | null;
  activeThread: Thread | null;
  settings: AppSettings;
  loading: boolean;
  setActiveThreadId: (id: string) => void;
  createThread: () => Promise<string>;
  deleteThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  appendMessage: (threadId: string, message: ChatMessage, opts?: { titleIfEmpty?: string }) => void;
  updateMessage: (
    threadId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
    opts?: { persist?: boolean }
  ) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updatePlugins: (patch: Partial<PluginSettings>) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  children,
  kind = "chat",
}: {
  children: ReactNode;
  kind?: "chat" | "terminal" | "agent" | "jobs";
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Load settings (local only — API keys never touch our database). Shared
  // across chat and terminal so you only enter your key once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  // Load threads from the real database.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/threads?kind=${kind}`);
        const data = await res.json();
        if (cancelled) return;
        let list: Thread[] = data.threads || [];
        if (list.length === 0) {
          const created = await fetch("/api/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ kind }),
          }).then((r) => r.json());
          list = [created.thread];
        }
        setThreads(list);
        setActiveThreadId(list[0]?.id ?? null);
      } catch {
        // not signed in yet, or request failed — leave empty, page-level guard handles auth
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const createThread = useCallback(async () => {
    const created = await fetch("/api/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
    }).then((r) => r.json());
    setThreads((prev) => [created.thread, ...prev]);
    setActiveThreadId(created.thread.id);
    return created.thread.id as string;
  }, [kind]);

  const deleteThread = useCallback(
    (id: string) => {
      fetch(`/api/threads/${id}`, { method: "DELETE" }).catch(() => {});
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          // create a replacement thread
          fetch("/api/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ kind }),
          })
            .then((r) => r.json())
            .then((data) => {
              setThreads([data.thread]);
              setActiveThreadId(data.thread.id);
            });
          return prev;
        }
        setActiveThreadId((current) => (current === id ? next[0].id : current));
        return next;
      });
    },
    [kind]
  );

  const renameThread = useCallback((id: string, title: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
    fetch(`/api/threads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  }, []);

  const appendMessage = useCallback(
    (threadId: string, message: ChatMessage, opts?: { titleIfEmpty?: string }) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          const isFirstUserMessage = t.messages.length === 0 && message.role === "user";
          return {
            ...t,
            title: isFirstUserMessage ? message.content.slice(0, 48) || "New chat" : t.title,
            messages: [...t.messages, message],
          };
        })
      );
      fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: message.id,
          role: message.role,
          content: message.content,
          titleIfEmpty: opts?.titleIfEmpty,
        }),
      }).catch(() => {});
    },
    []
  );

  const updateMessage = useCallback(
    (
      threadId: string,
      messageId: string,
      patch: Partial<ChatMessage>,
      opts?: { persist?: boolean }
    ) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            messages: t.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
          };
        })
      );
      // Only hit the database on meaningful checkpoints (e.g. stream finished),
      // not on every token, to avoid hammering the API while text is streaming in.
      if (opts?.persist && typeof patch.content === "string") {
        fetch(`/api/threads/${threadId}/messages`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: messageId, content: patch.content }),
        }).catch(() => {});
      }
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updatePlugins = useCallback((patch: Partial<PluginSettings>) => {
    setSettings((prev) => ({ ...prev, plugins: { ...prev.plugins, ...patch } }));
  }, []);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  return (
    <ChatContext.Provider
      value={{
        threads,
        activeThreadId,
        activeThread,
        settings,
        loading,
        setActiveThreadId,
        createThread,
        deleteThread,
        renameThread,
        appendMessage,
        updateMessage,
        updateSettings,
        updatePlugins,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used within ChatProvider");
  return ctx;
}

export { uid };
