"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { useGame } from "@/store/useGame";
import { CATEGORIES, ALL_SKILLS, TOTAL_ACHIEVEMENTS } from "@/lib/Skills";
import PortfolioNav from "./PortfolioNav";
import PortfolioFooter from "./PortfolioFooter";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function SkillsView() {
  const { xp, achievements, toast, category, selected, clearToast, back } =
    useGame();
  const cat = CATEGORIES.find((c) => c.id === category) ?? null;
  const skill = cat?.skills.find((s) => s.id === selected) ?? null;
  const color = cat?.color ?? "#FFB84A";
  const has = (id: string) => achievements.includes(`skill-${id}`);
  const totalTied = ALL_SKILLS.filter((s) => has(s.id)).length;
  const catTied = cat ? cat.skills.filter((s) => has(s.id)).length : 0;
  const level = Math.floor(xp / 120) + 1;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 4000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <motion.div
      className={`${mono.className} pointer-events-none absolute inset-y-0 left-1/2 z-10 flex w-full max-w-[1520px] -translate-x-1/2 flex-col p-5 md:p-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <PortfolioNav activeSection="skills" />
      <header className="pointer-events-auto absolute inset-x-5 top-24 z-20 flex items-start justify-between gap-3 md:inset-x-10 max-w-[1520px] mx-auto">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={back}
            data-cursor="BACK"
            className="pointer-events-auto border border-white/15 px-3 py-1.5 text-xs text-stone-300 hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
          >
            ← BACK
          </button>
          <p className="text-[10px] text-stone-500">
            SKILLS
            {cat && <span style={{ color }}> › {cat.name.toUpperCase()}</span>}
            {skill && (
              <span className="text-stone-300"> › {skill.name.toUpperCase()}</span>
            )}
          </p>
        </div>
      </header>

      {/* Title block */}
      <div className={`mt-auto ${skill ? "hidden md:block" : ""}`}>
        {cat ? (
          <>
            <p className="text-xs" style={{ color }}>
              ON MY CV: {cat.cv.toUpperCase()}
            </p>
            <h2
              className={`${display.className} mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl`}
            >
              {cat.name}
            </h2>
            <p className="mt-2 max-w-sm font-sans text-sm text-stone-400">
              {cat.blurb} Click a dot to see what it means.
            </p>
            <p className="mt-3 text-xs text-[#FFB84A]">
              EXPLORED {catTied} OF {cat.skills.length}
            </p>
            <p className="mt-1 text-[10px] text-stone-500">
              Click empty space to go back.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-[#2EE6A6]">WHAT I DO</p>
            <h2
              className={`${display.className} mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl`}
            >
              Pick a glowing ball.
            </h2>
            <p className="mt-2 max-w-sm font-sans text-sm text-stone-400">
              Each ball is an area of my work. Click one to see the skills
              inside, explained in plain English.
            </p>
            <p className="mt-3 text-xs text-[#FFB84A]">
              EXPLORED {totalTied} OF {ALL_SKILLS.length}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-stone-400">
              {CATEGORIES.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name.toUpperCase()}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Skill detail panel */}
      <AnimatePresence>
        {skill && (
          <motion.aside
            key={skill.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="pointer-events-auto absolute inset-x-5 bottom-16 border-l-2 bg-[#0b1119]/95 p-5 md:inset-x-auto md:right-10 md:top-1/2 md:bottom-auto md:w-80 md:-translate-y-1/2"
            style={{ borderColor: color }}
          >
            <p className="text-[10px]" style={{ color }}>
              {cat?.name.toUpperCase()}
            </p>
            <h3
              className={`${display.className} mt-1 text-3xl font-bold text-white`}
            >
              {skill.name}
            </h3>
            {skill.note && (
              <p className="mt-1 text-[10px] text-stone-500">{skill.note}</p>
            )}
            <p className="mt-4 text-[10px]" style={{ color }}>
              WHAT IT IS
            </p>
            <p className="mt-1 font-sans text-sm leading-relaxed text-stone-300">
              {skill.plain}
            </p>
            <p className="mt-4 text-[10px]" style={{ color }}>
              WHY IT MATTERS TO YOU
            </p>
            <p className="mt-1 font-sans text-sm leading-relaxed text-stone-300">
              {skill.benefit}
            </p>
            <button
              onClick={back}
              data-cursor="CLOSE"
              className="mt-5 border border-white/20 px-3 py-1.5 text-xs text-stone-300 hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
            >
              ✕ CLOSE
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Achievement toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            role="status"
            className="absolute right-5 top-20 w-64 border-l-2 border-[white] bg-[#0b1119]/90 p-3 md:bottom-10 md:right-10 md:top-auto"
          >
            <p className="text-[9px] text-[#FFB84A]">ACHIEVEMENT UNLOCKED</p>
            <div className="mt-1 flex justify-between text-sm text-white">
              <span>{toast.title}</span>
              <span className="text-[#2EE6A6]">+{toast.xp}</span>
            </div>
            <p className="mt-1 font-sans text-xs text-stone-400">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}