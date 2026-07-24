"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Copy, Download, Check, Code2, Eye, FolderDown, BookmarkPlus, Trash2, Library, MessageSquarePlus } from "lucide-react";
import JSZip from "jszip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Thread } from "@/lib/chat-store";
import { extractArtifacts, buildPreviewDoc, type Artifact } from "@/lib/extract-artifacts";
import { buildConnectionGraph } from "@/lib/connections";
import { ConnectionsBoard } from "@/components/chat/connections-board";
import { useSkills } from "@/lib/use-skills";

const EXTENSIONS: Record<string, string> = {
  html: "html",
  htm: "html",
  jsx: "jsx",
  tsx: "tsx",
  threejs: "js",
  three: "js",
  js: "js",
  javascript: "js",
  ts: "ts",
  typescript: "ts",
  py: "py",
  python: "py",
  css: "css",
  json: "json",
  md: "md",
  markdown: "md",
  sql: "sql",
};

type Tab = "artifacts" | "connections" | "skills";

export function RightPanel({
  open,
  defaultTab,
  thread,
  focusArtifactId,
  onClose,
  onUseSkill,
}: {
  open: boolean;
  defaultTab: Tab;
  thread: Thread | null;
  focusArtifactId: string | null;
  onClose: () => void;
  onUseSkill?: (code: string, title: string) => void;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDesc, setSaveDesc] = useState("");

  const { skills, saveSkill, deleteSkill } = useSkills();

  useEffect(() => setTab(defaultTab), [defaultTab]);

  const artifacts: Artifact[] = useMemo(() => {
    if (!thread) return [];
    return thread.messages
      .filter((m) => m.role === "assistant" && !m.streaming)
      .flatMap((m) => extractArtifacts(m.content, m.id));
  }, [thread]);

  useEffect(() => {
    if (focusArtifactId) {
      setSelectedId(focusArtifactId);
      setTab("artifacts");
    }
  }, [focusArtifactId]);

  useEffect(() => {
    if (!selectedId && artifacts.length > 0) {
      setSelectedId(artifacts[artifacts.length - 1].id);
    }
  }, [artifacts, selectedId]);

  const active = artifacts.find((a) => a.id === selectedId) || artifacts[artifacts.length - 1];

  const graph = useMemo(() => {
    if (!thread) return { nodes: [], edges: [] };
    return buildConnectionGraph(thread.messages.map((m) => m.content));
  }, [thread]);

  if (!open) return null;

  const copy = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!active) return;
    const ext = EXTENSIONS[active.language] || "txt";
    const blob = new Blob([active.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artifact.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (artifacts.length === 0) return;
    const zip = new JSZip();
    const usedNames = new Set<string>();
    artifacts.forEach((a, i) => {
      const ext = EXTENSIONS[a.language] || "txt";
      let base = (a.title || `${a.language}-${i + 1}`).replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      let name = `${base}.${ext}`;
      let n = 1;
      while (usedNames.has(name)) name = `${base}-${++n}.${ext}`;
      usedNames.add(name);
      zip.file(name, a.code);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "artifacts.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openSaveDialog = () => {
    if (!active) return;
    setSaveTitle(active.title || active.language);
    setSaveDesc("");
    setSaveOpen(true);
  };

  const confirmSave = async () => {
    if (!active || !saveTitle.trim()) return;
    await saveSkill({
      title: saveTitle.trim(),
      description: saveDesc.trim(),
      language: active.language,
      code: active.code,
    });
    setSaveOpen(false);
  };

  return (
    <aside className="w-[520px] shrink-0 h-screen border-l border-foreground/10 flex flex-col bg-background">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <TabsList>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <TabsContent value="artifacts" className="flex-1 min-h-0 flex flex-col mt-0">
          {artifacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
              Ask the assistant to build something — a website, dashboard, doc, or game — and it
              will show up here with a live preview.
            </div>
          ) : (
            <>
              {artifacts.length > 1 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                  {artifacts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-full border ${
                        a.id === active?.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/15 hover:bg-accent"
                      }`}
                    >
                      {a.title || a.language}
                    </button>
                  ))}
                  <button
                    onClick={downloadAll}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border border-foreground/15 hover:bg-accent"
                  >
                    <FolderDown className="w-3 h-3" />
                    Download all
                  </button>
                </div>
              )}

              <div className="px-4 pb-2 flex items-center justify-between gap-2">
                <div className="flex gap-1 bg-secondary rounded-full p-1">
                  <button
                    onClick={() => setViewMode("preview")}
                    disabled={!active?.previewable}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full disabled:opacity-40 ${
                      viewMode === "preview" && active?.previewable
                        ? "bg-background shadow-sm"
                        : ""
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => setViewMode("code")}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                      viewMode === "code" || !active?.previewable ? "bg-background shadow-sm" : ""
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" /> Code
                  </button>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openSaveDialog} title="Save to Skills">
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copy}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={download}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {saveOpen && (
                <div className="mx-4 mb-3 rounded-lg border border-foreground/10 bg-secondary/60 p-3 space-y-2">
                  <p className="text-xs font-medium">Save this artifact to your Skills library</p>
                  <Input
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Name"
                    className="h-9 rounded-md text-sm"
                  />
                  <Input
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    placeholder="What does it do? (optional)"
                    className="h-9 rounded-md text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setSaveOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-foreground text-background hover:bg-foreground/90"
                      onClick={confirmSave}
                      disabled={!saveTitle.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 mx-4 mb-4 rounded-xl border border-foreground/10 overflow-hidden">
                {viewMode === "preview" && active?.previewable ? (
                  <iframe
                    title="artifact-preview"
                    srcDoc={buildPreviewDoc(active)}
                    sandbox="allow-scripts allow-forms allow-modals allow-popups"
                    className="w-full h-full bg-white"
                  />
                ) : (
                  <ScrollArea className="h-full">
                    <pre className="text-xs font-mono p-4 leading-relaxed whitespace-pre-wrap break-words">
                      {active?.code}
                    </pre>
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="connections" className="flex-1 min-h-0 mt-0">
          <ConnectionsBoard graph={graph} />
        </TabsContent>

        <TabsContent value="skills" className="flex-1 min-h-0 mt-0">
          {skills.length === 0 ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-sm text-muted-foreground p-8 text-center gap-2">
              <Library className="w-5 h-5 opacity-50" />
              Save a useful artifact here (the bookmark icon on any artifact) to build a
              reusable library of scripts and snippets.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 flex flex-col gap-2">
                {skills.map((s) => (
                  <div key={s.id} className="rounded-lg border border-foreground/10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{s.description}</p>
                        )}
                        <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">{s.language}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {onUseSkill && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onUseSkill(s.code, s.title)}
                            title="Use in chat"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigator.clipboard.writeText(s.code)}
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteSkill(s.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
