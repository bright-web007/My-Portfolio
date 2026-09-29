import { create } from "zustand";

type Phase = "title" | "loading" | "playing";
type Toast = { id: string; title: string; text: string; xp: number };

type GameState = {
  phase: Phase;
  xp: number;
  achievements: string[];
  toast: Toast | null;
  start: () => void;
  finishLoading: () => void;
  addXp: (n: number) => void;
  unlock: (id: string, title: string, text: string, xp?: number) => void;
  clearToast: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  phase: "title",
  xp: 0,
  achievements: [],
  toast: null,
  start: () => set({ phase: "loading" }),
  finishLoading: () => set({ phase: "playing" }),
  addXp: (n) => set((s) => ({ xp: s.xp + n })),
  unlock: (id, title, text, xp = 50) => {
    if (get().achievements.includes(id)) return;
    set((s) => ({
      achievements: [...s.achievements, id],
      xp: s.xp + xp,
      toast: { id, title, text, xp },
    }));
  },
  clearToast: () => set({ toast: null }),
}));