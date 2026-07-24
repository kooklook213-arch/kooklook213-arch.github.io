import { AnimatedSphere } from "@/components/landing/animated-sphere";

export function ThinkingSphere({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 shrink-0">
        <AnimatedSphere />
      </div>
      <span className="text-sm text-muted-foreground font-mono animate-pulse">{label}…</span>
    </div>
  );
}
