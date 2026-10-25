import { create } from "zustand";
import { CATEGORIES, ALL_SKILLS } from "@/lib/Skills";
import { PROJECTS } from "@/lib/Projects";

export type Section = "home" | "skills" | "projects" | "contact";
type Toast = { id: string; title: string; text: string; xp: number };

type GameState = {
  section: Section;
  category: string | null;
  selected: string | null;
  hoverLabel: string | null;
  xp: number;
  achievements: string[];
  inspectedProjects: string[];
  toast: Toast | null;
  setSection: (s: Section) => void;
  inspectProject: (id: string) => void;
  openCategory: (id: string | null) => void;
  select: (id: string | null) => void;
  back: () => void;
  setHoverLabel: (l: string | null) => void;
  addXp: (n: number) => void;
  unlock: (id: string, title: string, text: string, xp?: number) => void;
  clearToast: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  section: "home",
  category: null,
  selected: null,
  hoverLabel: null,
  xp: 0,
  achievements: [],
  inspectedProjects: [],
  toast: null,
  setSection: (s) =>
    set({ section: s, category: null, selected: null, hoverLabel: null }),
  inspectProject: (id) => {
    const { inspectedProjects } = get();
    if (inspectedProjects.includes(id)) return;

    const inspected = [...inspectedProjects, id];
    set({ inspectedProjects: inspected });
    get().unlock(
      `project-${id}`,
      "Item Inspected",
      "A new inventory item has been inspected.",
      30
    );

    if (PROJECTS.every((project) => inspected.includes(project.id))) {
      setTimeout(
        () =>
          get().unlock(
            "project-collector",
            "Collector",
            "Every project item has been inspected.",
            0
          ),
        1400
      );
    }
  },
  openCategory: (id) => set({ category: id, selected: null }),
  select: (id) => {
    set({ selected: id });
    if (!id) return;
    const cat = CATEGORIES.find((c) => c.skills.some((s) => s.id === id));
    const skill = ALL_SKILLS.find((s) => s.id === id);
    if (!cat || !skill) return;

    get().unlock(
      `skill-${id}`,
      "Skill Explored",
      `You learned about ${skill.name}.`,
      20
    );

    const has = (sid: string) => get().achievements.includes(`skill-${sid}`);
    const catDone = cat.skills.every((s) => has(s.id));
    const allDone = ALL_SKILLS.every((s) => has(s.id));
    if (catDone) {
      setTimeout(
        () =>
          get().unlock(
            `thread-${cat.id}`,
            `${cat.name} Complete`,
            "You explored every skill in this area.",
            60
          ),
        1800
      );
    }
    if (allDone) {
      setTimeout(
        () =>
          get().unlock(
            "master-weaver",
            "Master Explorer",
            "You explored every skill.",
            100
          ),
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