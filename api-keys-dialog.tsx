"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useChatStore, MODEL_OPTIONS } from "@/lib/chat-store";

export function ApiKeysDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { settings, updateSettings } = useChatStore();
  const [reveal, setReveal] = useState(false);
  const [draft, setDraft] = useState(settings.apiKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">API keys</DialogTitle>
          <DialogDescription>
            Bring your own Anthropic API key to power the assistant. It's stored only in this
            browser's local storage and sent directly to our server route on each request — never
            to any third party.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="apikey">Anthropic API key</Label>
            <div className="relative">
              <Input
                id="apikey"
                type={reveal ? "text" : "password"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="sk-ant-..."
                className="h-11 rounded-lg pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle visibility"
              >
                {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get a key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                console.anthropic.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={settings.model} onValueChange={(v) => updateSettings({ model: v })}>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-3">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This app has no database — your key lives only in this browser. Clearing site data
              or using another device/browser will require re-entering it.
            </span>
          </div>

          <Button
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            onClick={() => {
              updateSettings({ apiKey: draft.trim() });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
