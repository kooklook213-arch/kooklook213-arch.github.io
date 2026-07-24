"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Blocks,
  Puzzle,
  KeyRound,
  Network,
  Trash2,
  LogOut,
  TerminalSquare,
  MessagesSquare,
  Bot,
  Library,
  Search,
  Gamepad2,
  ExternalLink,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { useChatStore } from "@/lib/chat-store";

export function ChatSidebar({
  onOpenArtifacts,
  onOpenPlugins,
  onOpenApiKeys,
  onOpenConnections,
  onOpenSkills,
}: {
  onOpenArtifacts: () => void;
  onOpenPlugins: () => void;
  onOpenApiKeys: () => void;
  onOpenConnections: () => void;
  onOpenSkills: () => void;
}) {
  const { threads, activeThreadId, setActiveThreadId, createThread, deleteThread } =
    useChatStore();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger — sidebar is an overlay drawer below md */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-background border border-foreground/15 flex items-center justify-center shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 z-40"
        />
      )}

      <aside
        className={`w-[280px] shrink-0 h-screen border-r border-foreground/10 flex flex-col bg-secondary/40 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
      <div className="px-4 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2 w-fit mb-4" onClick={() => setMobileOpen(false)}>
          <span className="font-display text-xl tracking-tight">Optimus</span>
          <span className="text-muted-foreground font-mono text-[10px] mt-0.5">TM</span>
        </Link>
        <Button
          onClick={() => {
            createThread();
            setMobileOpen(false);
          }}
          className="w-full justify-start gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg h-10"
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-1 bg-background/60 border border-foreground/10 rounded-lg p-1">
          <Link
            href="/chat"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
              pathname?.startsWith("/chat") ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            Chat
          </Link>
          <Link
            href="/terminal"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
              pathname?.startsWith("/terminal") ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            <TerminalSquare className="w-3.5 h-3.5" />
            Terminal
          </Link>
          <Link
            href="/agent"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
              pathname?.startsWith("/agent") ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Agent
          </Link>
          <Link
            href="/jobs"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
              pathname?.startsWith("/jobs") ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Jobs
          </Link>
        </div>
      </div>

      {/* Tools */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <SidebarToolButton icon={Blocks} label="Artifacts" onClick={() => { onOpenArtifacts(); setMobileOpen(false); }} />
        <SidebarToolButton icon={Network} label="Connections" onClick={() => { onOpenConnections(); setMobileOpen(false); }} />
        <SidebarToolButton icon={Library} label="Skills" onClick={() => { onOpenSkills(); setMobileOpen(false); }} />
        <SidebarToolButton icon={Puzzle} label="Plugins" onClick={() => { onOpenPlugins(); setMobileOpen(false); }} />
        <SidebarToolButton icon={KeyRound} label="API keys" onClick={() => { onOpenApiKeys(); setMobileOpen(false); }} />
        <a
          href="https://tesana.ai/en"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-start gap-2 rounded-lg border border-foreground/10 bg-background/60 hover:bg-accent transition-colors px-3 py-2.5 text-left"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="text-xs font-medium flex items-center gap-1">
            Tesana
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
        </a>
      </div>

      <div className="px-4 pb-2 pt-2 text-xs font-mono text-muted-foreground uppercase tracking-wide">
        History
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 pb-4">
          {threads.map((t) => (
            <div
              key={t.id}
              onMouseEnter={() => setHoverId(t.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => {
                setActiveThreadId(t.id);
                setMobileOpen(false);
              }}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                t.id === activeThreadId
                  ? "bg-foreground text-background"
                  : "hover:bg-accent text-foreground/80"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate flex-1">{t.title || "New chat"}</span>
              {(hoverId === t.id || t.id === activeThreadId) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="opacity-60 hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="px-4 py-4 border-t border-foreground/10 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      </aside>
    </>
  );
}

function SidebarToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-lg border border-foreground/10 bg-background/60 hover:bg-accent transition-colors px-3 py-2.5 text-left"
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
