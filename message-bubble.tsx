"use client";

import { Volume2 } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-store";
import { extractArtifacts, stripCodeForDisplay } from "@/lib/extract-artifacts";
import { Button } from "@/components/ui/button";

export function MessageBubble({
  message,
  onOpenArtifact,
  onSpeak,
}: {
  message: ChatMessage;
  onOpenArtifact: (artifactId: string) => void;
  onSpeak?: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const artifacts = isUser ? [] : extractArtifacts(message.content, message.id);
  const prose = isUser ? message.content : stripCodeForDisplay(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75ch] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-foreground text-background rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          }`}
        >
          {prose || (message.streaming ? "" : "…")}
          {message.streaming && (
            <span className="inline-block w-1.5 h-4 bg-current opacity-60 ml-0.5 align-middle animate-pulse" />
          )}
        </div>

        {artifacts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artifacts.map((a) => (
              <button
                key={a.id}
                onClick={() => onOpenArtifact(a.id)}
                className="text-xs font-mono px-3 py-2 rounded-lg border border-foreground/15 bg-background hover:bg-accent transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                {a.title || a.language} — open artifact
              </button>
            ))}
          </div>
        )}

        {!isUser && !message.streaming && prose && onSpeak && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => onSpeak(prose)}
          >
            <Volume2 className="w-3.5 h-3.5 mr-1" />
            Listen
          </Button>
        )}
      </div>
    </div>
  );
}
