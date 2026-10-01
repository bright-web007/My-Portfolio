"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { useGame } from "@/store/useGame";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const XP_PER_LEVEL = 120;
const TOTAL_ACHIEVEMENTS = 23;
const RANKS = ["Apprentice", "Weaver", "Master Weaver", "Grand Weaver"];
const SECTIONS = ["Home", "Skills", "Quests", "Loot", "Contact"];
// Placeholders: we'll swap in your real numbers later
const STATS = [
    { value: "2+", label: "YEARS CODING" },
    { value: "12", label: "PROJECTS SHIPPED" },
    { value: "9", label: "SKILLS UNLOCKED" },
];

const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
});
const now = () => fmt.format(new Date());

function Clock() {
    const [time, setTime] = useState(now);
    useEffect(() => {
        const id = setInterval(() => setTime(now()), 30000);
        return () => clearInterval(id);
    }, []);
    return <span>IKOT EKPENE · {time} WAT</span>;
}

function Letters({ text, delay = 0 }: { text: string; delay?: number }) {
    const reduce = useReducedMotion();
    return (
        <>
            {text.split("").map((ch, i) => {
                const d = delay + i * 0.09;
                return (
                    <motion.span
                        key={i}
                        aria-hidden="true"
                        className="inline-block"
                        initial={
                            reduce
                                ? false
                                : { opacity: 0, y: -70, scale: 2.4, filter: "blur(12px)" }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        transition={{
                            delay: d,
                            type: "spring",
                            stiffness: 380,
                            damping: 18,
                            opacity: { delay: d, duration: 0.15 },
                            filter: { delay: d, duration: 0.35 },
                        }}
                    >
                        {ch}
                    </motion.span>
                );
            })}
        </>
    );
}

function Reveal({
    delay,
    className = "",
    children,
}: {
    delay: number;
    className?: string;
    children: ReactNode;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}

export default function Landing() {
    const reduce = useReducedMotion();
    const { xp, achievements, toast, unlock, clearToast, setSection } = useGame();
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    const rank = RANKS[Math.min(level - 1, RANKS.length - 1)];

    useEffect(() => {
        const t = setTimeout(
            () =>
                unlock("player-one", "Player One", "Pressed start. The adventure begins.", 25),
            2400
        );
        return () => clearTimeout(t);
    }, [unlock]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(clearToast, 4000);
        return () => clearTimeout(t);
    }, [toast, clearToast]);

    return (
        <motion.div
            className={`${mono.className} pointer-events-none absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-r from-[#05080d]/90 via-[#05080d]/40 to-transparent p-5 md:p-10`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Impact flash when the name lands */}
            {!reduce && (
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[#FFB84A]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.22, 0] }}
                    transition={{ delay: 1.7, duration: 0.6, times: [0, 0.15, 1] }}
                />
            )}

            {/* HUD */}
            <header className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="border border-[#FFB84A] px-2 py-1 text-sm font-bold text-[#FFB84A]">
                        WU
                    </div>
                    <div className="w-44 text-[10px]">
                        <div className="flex justify-between text-[#2EE6A6]">
                            <span>
                                LVL {level} · {rank.toUpperCase()}
                            </span>
                            <span>
                                {into}/{XP_PER_LEVEL} XP
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-[#2EE6A6] to-[#FFB84A] transition-all duration-700"
                                style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="pointer-events-auto flex items-center gap-2 text-xs text-stone-300">
                    <span className="border border-white/15 px-3 py-1.5">
                        🏆 {achievements.length}/{TOTAL_ACHIEVEMENTS}
                    </span>
                    <button
                        aria-label="Open terminal"
                        className="border border-white/15 px-3 py-1.5 hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
                    >
                        &gt;_
                    </button>
                    <button
                        aria-label="Toggle sound"
                        className="border border-white/15 px-3 py-1.5 hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
                    >
                        ♪
                    </button>
                </div>
            </header>

            {/* Section dots */}
            <nav
                aria-label="Sections"
                className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-4 md:flex"
            >
                {SECTIONS.map((s, i) => (
                    <span
                        key={s}
                        title={s}
                        className={`block h-2.5 w-2.5 rotate-45 border ${i === 0 ? "border-[#FFB84A] bg-[#FFB84A]" : "border-white/30"
                            }`}
                    />
                ))}
            </nav>

            {/* Hero */}
            <section className="max-w-2xl">
                <Reveal delay={0.1}>
                    <p className="text-xs text-[#2EE6A6]">■ PLAYER ONE · READY</p>
                </Reveal>

                <h1
                    aria-label="Williams Udeme"
                    className={`${display.className} mt-4 text-6xl font-bold leading-[0.88] tracking-tight text-white md:text-9xl`}
                >
                    <Letters text="WILLIAMS" delay={0.4} />
                    <br />
                    <span className="text-transparent [-webkit-text-stroke:2px_#FFB84A]">
                        <Letters text="UWANA" delay={1.15} />
                    </span>
                    <motion.span
                        aria-hidden="true"
                        className="inline-block text-[#FF5A36]"
                        initial={reduce ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.75, type: "spring", stiffness: 500, damping: 12 }}
                    >
                        .
                    </motion.span>
                </h1>

                <motion.div
                    className="mt-5 h-px w-40 origin-left bg-gradient-to-r from-[#FFB84A] to-transparent"
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.9, duration: 0.5 }}
                />

                <Reveal delay={2.0}>
                    <p className="mt-4 text-sm text-stone-400">
                        class: <span className="text-[#2EE6A6]">Web Developer</span>
                    </p>
                    <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-stone-300">
                        I build fast, polished websites and web apps. Explore my city like a
                        game: earn XP, unlock achievements, find the secrets.
                    </p>
                </Reveal>

                <Reveal delay={2.2} className="pointer-events-auto mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            unlock("curious", "Curious Mind", "You pressed a button. Bold move.", 25);
                            setSection("skills");
                        }}
                        className="bg-[#FFB84A] px-6 py-3 text-xs font-bold text-[#05080d] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        ▶ START EXPLORING
                    </button>
                    <a
                        href="#"
                        className="border border-white/25 px-6 py-3 text-xs font-bold text-stone-200 transition hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        ↓ DOWNLOAD CV
                    </a>
                </Reveal>
            </section>

            {/* Footer row */}
            <footer className="flex items-end justify-between">
                <Reveal delay={2.5}>
                    <div className="flex gap-8">
                        {STATS.map((s) => (
                            <div key={s.label}>
                                <p className={`${display.className} text-2xl font-bold text-white`}>
                                    {s.value}
                                </p>
                                <p className="text-[9px] text-stone-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] text-stone-500">
                        <Clock />
                    </p>
                </Reveal>

                <AnimatePresence>
                    {toast && (
                        <motion.div
                            key={toast.id}
                            initial={{ x: 80, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 80, opacity: 0 }}
                            className="w-64 border-l-2 border-[#FFB84A] bg-[#0b1119]/90 p-3"
                            role="status"
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
            </footer>
        </motion.div>
    );
}