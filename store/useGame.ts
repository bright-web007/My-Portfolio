// import { create } from "zustand";
// import { SKILLS } from "@/lib/Skills";

// type Phase = "title" | "loading" | "playing";
// type Section = "home" | "skills";
// type Toast = { id: string; title: string; text: string; xp: number };

// type GameState = {
//   phase: Phase;
//   section: Section;
//   selected: string | null;
//   xp: number;
//   achievements: string[];
//   toast: Toast | null;
//   start: () => void;
//   finishLoading: () => void;
//   setSection: (s: Section) => void;
//   select: (id: string | null) => void;
//   addXp: (n: number) => void;
//   unlock: (id: string, title: string, text: string, xp?: number) => void;
//   clearToast: () => void;
// };

// export const useGame = create<GameState>((set, get) => ({
//   phase: "title",
//   section: "home",
//   selected: null,
//   xp: 0,
//   achievements: [],
//   toast: null,
//   start: () => set({ phase: "loading" }),
//   finishLoading: () => set({ phase: "playing" }),
//   setSection: (s) => set({ section: s, selected: null }),
//   select: (id) => {
//     set({ selected: id });
//     if (!id) return;
//     const skill = SKILLS.find((s) => s.id === id);
//     if (!skill) return;
//     get().unlock(`skill-${id}`, "Knot Tied", `${skill.name} discovered.`, 20);
//     const tied = get().achievements.filter((a) => a.startsWith("skill-")).length;
//     if (tied === SKILLS.length) {
//       setTimeout(
//         () => get().unlock("master-weaver", "Master Weaver", "Every knot tied.", 100),
//         1800
//       );
//     }
//   },
//   addXp: (n) => set((s) => ({ xp: s.xp + n })),
//   unlock: (id, title, text, xp = 50) => {
//     if (get().achievements.includes(id)) return;
//     set((s) => ({
//       achievements: [...s.achievements, id],
//       xp: s.xp + xp,
//       toast: { id, title, text, xp },
//     }));
//   },
//   clearToast: () => set({ toast: null }),
// }));




import { create } from "zustand";
import { CATEGORIES, ALL_SKILLS } from "@/lib/Skills";

type Phase = "title" | "loading" | "playing";
type Section = "home" | "skills";
type Toast = { id: string; title: string; text: string; xp: number };

type GameState = {
  phase: Phase;
  section: Section;
  category: string | null;
  selected: string | null;
  hoverLabel: string | null;
  xp: number;
  achievements: string[];
  toast: Toast | null;
  start: () => void;
  finishLoading: () => void;
  setSection: (s: Section) => void;
  openCategory: (id: string | null) => void;
  select: (id: string | null) => void;
  back: () => void;
  setHoverLabel: (l: string | null) => void;
  addXp: (n: number) => void;
  unlock: (id: string, title: string, text: string, xp?: number) => void;
  clearToast: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  phase: "title",
  section: "home",
  category: null,
  selected: null,
  hoverLabel: null,
  xp: 0,
  achievements: [],
  toast: null,
  start: () => set({ phase: "loading" }),
  finishLoading: () => set({ phase: "playing" }),
  setSection: (s) =>
    set({ section: s, category: null, selected: null, hoverLabel: null }),
  openCategory: (id) => set({ category: id, selected: null }),
  select: (id) => {
    set({ selected: id });
    if (!id) return;
    const cat = CATEGORIES.find((c) => c.skills.some((s) => s.id === id));
    const skill = ALL_SKILLS.find((s) => s.id === id);
    if (!cat || !skill) return;

    get().unlock(`skill-${id}`, "Knot Tied", `${skill.name} discovered.`, 20);

    const has = (sid: string) => get().achievements.includes(`skill-${sid}`);
    const catDone = cat.skills.every((s) => has(s.id));
    const allDone = ALL_SKILLS.every((s) => has(s.id));
    if (catDone) {
      setTimeout(
        () =>
          get().unlock(
            `thread-${cat.id}`,
            `${cat.name} Thread Complete`,
            "Every knot in this area is tied.",
            60
          ),
        1800
      );
    }
    if (allDone) {
      setTimeout(
        () => get().unlock("master-weaver", "Master Weaver", "Every knot tied.", 100),
        catDone ? 5800 : 1800
      );
    }
  },
  back: () => {
    const { selected, category } = get();
    if (selected) set({ selected: null });
    else if (category) set({ category: null });
    else set({ section: "home" });
  },
  setHoverLabel: (l) => set({ hoverLabel: l }),
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