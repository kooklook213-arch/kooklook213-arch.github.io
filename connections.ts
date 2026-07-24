export type ConnectionNode = {
  id: string;
  label: string;
  weight: number; // how many times it was mentioned
};

export type ConnectionEdge = {
  source: string;
  target: string;
  weight: number; // how many messages mention both
};

export type ConnectionGraph = {
  nodes: ConnectionNode[];
  edges: ConnectionEdge[];
};

const STOPWORDS = new Set(
  `the a an and or but if then else for of to in on at by with from as is are was were be been being
   this that these those it its it's i you he she we they i'm you're he's she's we're they're
   what who whom which why how not no yes can could should would will just so than too very
   about into over under again further here there when where all any both each few more most other
   some such only own same do does did doing have has had having up down out off above below
   claude ai please help make build create write show tell give let get go want need like also`.split(
    /\s+/
  )
);

function titleCaseWords(text: string): string[] {
  // Multi-word capitalized phrases, e.g. "New York City", "Anthropic API"
  const phrases = text.match(/\b([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*){0,3})\b/g) || [];
  return phrases
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && !STOPWORDS.has(p.toLowerCase()));
}

function significantKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));
  return Array.from(new Set(words)).slice(0, 8);
}

/**
 * Builds a lightweight "investigation board" graph from a set of message texts.
 * Entities found in the same message are linked together, so threads of
 * conversation naturally form connected clusters — no external model call needed.
 */
export function buildConnectionGraph(texts: string[]): ConnectionGraph {
  const nodeWeights = new Map<string, number>();
  const edgeWeights = new Map<string, number>();

  for (const text of texts) {
    const proper = titleCaseWords(text);
    const keywords = significantKeywords(text);
    const entities = Array.from(new Set([...proper, ...keywords])).slice(0, 10);

    for (const e of entities) {
      nodeWeights.set(e, (nodeWeights.get(e) || 0) + 1);
    }
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const key = [entities[i], entities[j]].sort().join("::");
        edgeWeights.set(key, (edgeWeights.get(key) || 0) + 1);
      }
    }
  }

  // Keep the strongest nodes so the board stays readable.
  const topNodes = Array.from(nodeWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24);

  const nodeIdSet = new Set(topNodes.map(([label]) => label));

  const nodes: ConnectionNode[] = topNodes.map(([label, weight]) => ({
    id: label,
    label,
    weight,
  }));

  const edges: ConnectionEdge[] = Array.from(edgeWeights.entries())
    .map(([key, weight]) => {
      const [source, target] = key.split("::");
      return { source, target, weight };
    })
    .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

  return { nodes, edges };
}
