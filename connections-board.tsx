"use client";

import { useMemo } from "react";
import type { ConnectionGraph } from "@/lib/connections";

const WIDTH = 640;
const HEIGHT = 520;

export function ConnectionsBoard({ graph }: { graph: ConnectionGraph }) {
  const positioned = useMemo(() => {
    const { nodes } = graph;
    if (nodes.length === 0) return [];
    const maxWeight = Math.max(...nodes.map((n) => n.weight));
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;

    return nodes.map((n, i) => {
      // Stronger nodes sit closer to the center — rings by weight.
      const ring = 1 - n.weight / (maxWeight + 1);
      const radius = 60 + ring * 210;
      const angle = (i / nodes.length) * Math.PI * 2 + (i % 2 === 0 ? 0 : 0.3);
      return {
        ...n,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [graph]);

  const posById = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    positioned.forEach((p) => map.set(p.id, { x: p.x, y: p.y }));
    return map;
  }, [positioned]);

  if (graph.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
        As you chat, entities and topics that come up will get pinned here, with lines drawn
        between the ones that show up together — like an investigation board.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-secondary/30">
      <svg width={WIDTH} height={HEIGHT} className="max-w-full h-auto">
        <defs>
          <filter id="paper-noise">
            <feTurbulence baseFrequency="0.9" numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
          </filter>
        </defs>

        {graph.edges.map((e, i) => {
          const a = posById.get(e.source);
          const b = posById.get(e.target);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeOpacity={Math.min(0.15 + e.weight * 0.12, 0.6)}
              strokeWidth={1}
              className="text-foreground"
            />
          );
        })}

        {positioned.map((n) => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <circle
              r={6 + Math.min(n.weight, 6) * 1.4}
              className="fill-foreground"
              opacity={0.9}
            />
            <text
              textAnchor="middle"
              y={-6 - Math.min(n.weight, 6) * 1.4}
              className="fill-foreground text-[10px] font-mono"
            >
              {n.label.length > 22 ? n.label.slice(0, 22) + "…" : n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
