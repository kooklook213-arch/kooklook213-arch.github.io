"use client";

import { useCallback, useEffect, useState } from "react";

export type Skill = {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  createdAt: number;
};

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch {
      // ignore — likely not signed in yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSkill = useCallback(
    async (skill: { title: string; description: string; language: string; code: string }) => {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(skill),
      });
      const data = await res.json();
      if (data.skill) setSkills((prev) => [data.skill, ...prev]);
      return data.skill as Skill | undefined;
    },
    []
  );

  const deleteSkill = useCallback(async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/skills/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  return { skills, loading, refresh, saveSkill, deleteSkill };
}

/**
 * Compact, token-cheap summary of a skills library for the system prompt —
 * titles and descriptions only, never full code, so the model can recognize
 * and offer to reuse past work without every request paying for the full
 * library's source.
 */
export function buildSkillsContext(skills: Skill[]): string {
  if (skills.length === 0) return "";
  const list = skills
    .slice(0, 20)
    .map((s) => `- "${s.title}" (${s.language})${s.description ? `: ${s.description}` : ""}`)
    .join("\n");
  return `\n\nThe user has a personal skills library saved from past sessions — code they found useful before:\n${list}\nIf one of these is clearly relevant to the current request, mention it by name and offer to reuse or extend it rather than starting from scratch. You don't have the full code unless the user pastes it in — ask them to paste it in via the Skills panel if you need the actual contents.`;
}
