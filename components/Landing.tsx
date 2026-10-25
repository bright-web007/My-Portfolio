"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { useGame } from "@/store/useGame";
import type { Section } from "@/store/useGame";
import { PROJECTS, PORTFOLIO_LOCATION } from "@/lib/Projects";
import PortfolioFooter from "./PortfolioFooter";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const XP_PER_LEVEL = 120;
const TOTAL_ACHIEVEMENTS = 29;
const RANKS = ["Apprentice", "Weaver", "Master Weaver", "Grand Weaver"];
// Placeholders: we'll swap in your real numbers later
const STATS = [
    { value: "1+", label: "YEARS CODING" },
    { value: "9", label: "PROJECTS SHIPPED" },
];
const EXPERIENCE_RESPONSIBILITIES = [
    "Built and maintained React.js and Next.js single-page apps, improving page load speed and UX.",
    "Integrated front-end components with REST APIs, resolving data-flow issues and improving reliability.",
    "Worked with UI/UX designers to turn designs into responsive interfaces across devices and browsers.",
    "Built reusable components that cut development time and kept the codebase maintainable.",
    "Delivered features in an Agile, cross-functional team within sprint timelines.",
    "Debugged and optimized the front end for stability and performance.",
];
const EXPERIENCE_FOCUS = ["React.js", "Next.js", "REST APIs", "Responsive UI", "Performance"];
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
    return <span>{PORTFOLIO_LOCATION} · {time} WAT</span>;
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

function SectionReveal({
    children,
    root,
    className,
    x = 0,
    y = 0,
    duration,
    delay = 0,
}: {
    children: ReactNode;
    root: RefObject<Element | null>;
    className?: string;
    x?: number;
    y?: number;
    duration: number;
    delay?: number;
}) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={reduce ? false : { opacity: 0, x, y }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ root, amount: "some" }}
            transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default function Landing() {
    const reduce = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState("home");
    const menuButton = useRef<HTMLButtonElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const scrollRootRef = useRef<HTMLDivElement>(null);
    const { xp, achievements, toast, unlock, clearToast, setSection } = useGame();
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    const rank = RANKS[Math.min(level - 1, RANKS.length - 1)];
    const scrollTo = (id: string) => {
        const target = document.getElementById(id);
        if (!target) return;

        const behavior = reduce ? "auto" : "smooth";
        if (id === "home") {
            target.scrollTo({ top: 0, behavior });
            return;
        }

        target.scrollIntoView({ behavior, block: "start" });
    };
    const navigateTo = (id: Section | "about" | "experience") => {
        setActiveNav(id);
        if (id === "about" || id === "experience") {
            if (menuOpen) {
                setMenuOpen(false);
                window.setTimeout(() => scrollTo(id), 0);
                return;
            }
            scrollTo(id);
            return;
        }

        setMenuOpen(false);
        setSection(id);
        if (id !== "home") {
            return;
        }
        scrollTo(id);
    };

    useEffect(() => {
        const root = scrollRootRef.current;
        if (!root) return;

        const sections = [
            ["about", "about"],
            ["experience", "experience"],
            ["selected-projects", "projects"],
        ] as const;

        const updateActiveSection = () => {
            const activationLine = root.getBoundingClientRect().top + 120;
            let nextActive = "home";

            for (const [sectionId, navId] of sections) {
                const section = document.getElementById(sectionId);
                if (section && section.getBoundingClientRect().top <= activationLine) {
                    nextActive = navId;
                }
            }

            setActiveNav((current) => current === nextActive ? current : nextActive);
        };

        updateActiveSection();
        root.addEventListener("scroll", updateActiveSection, { passive: true });
        window.addEventListener("resize", updateActiveSection);
        return () => {
            root.removeEventListener("scroll", updateActiveSection);
            window.removeEventListener("resize", updateActiveSection);
        };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(clearToast, 4000);
        return () => clearTimeout(t);
    }, [toast, clearToast]);

    useEffect(() => {
        if (!menuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButton.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
            menuButton.current?.focus();
        };
    }, [menuOpen]);

    return (
        <motion.div
            ref={scrollRootRef}
            className={`${mono.className} pointer-events-auto absolute inset-0 z-10 overflow-y-auto bg-gradient-to-r from-[#05080d]/90 via-[#05080d]/40 to-transparent`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            id="home"
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

            {/* Navigation */}
            <header className="sticky top-0 z-20 border-b border-white/5 bg-[#05080d]/65 px-5 py-4 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-x-3 gap-y-4">
                    <button
                        onClick={() => navigateTo("home")}
                        className="flex w-fit items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-white"
                        aria-label="Williams Uwana home"
                    >
                        <span className="grid size-9 place-items-center rounded-full border border-[#2EE6A6] text-xs font-bold text-[#2EE6A6] shadow-[0_0_14px_#2EE6A655]">
                            WU
                        </span>
                        <span className="hidden text-sm font-bold text-white sm:block">
                            Williams <span className="text-[#2EE6A6]">Uwana</span>
                        </span>
                    </button>

                    <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#05080d]/75 p-1 text-[10px] text-stone-400 backdrop-blur-xl sm:flex">
                        <button
                            onClick={() => navigateTo("home")}
                            aria-current={activeNav === "home" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "home" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            HOME
                        </button>
                        <button
                            onClick={() => navigateTo("about")}
                            aria-current={activeNav === "about" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "about" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            ABOUT
                        </button>
                        <button
                            onClick={() => navigateTo("skills")}
                            aria-current={activeNav === "skills" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "skills" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            SKILLS
                        </button>
                        <button
                            onClick={() => navigateTo("experience")}
                            aria-current={activeNav === "experience" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "experience" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            EXPERIENCE
                        </button>
                        <button
                            onClick={() => navigateTo("projects")}
                            aria-current={activeNav === "projects" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "projects" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            PROJECTS
                        </button>
                        <button
                            onClick={() => navigateTo("contact")}
                            aria-current={activeNav === "contact" ? "page" : undefined}
                            className={`rounded-full px-3 py-2 transition focus-visible:outline-2 focus-visible:outline-white ${activeNav === "contact" ? "bg-[#FFB84A] text-[#05080d]" : "hover:bg-white/5 hover:text-white"}`}
                        >
                            CONTACT
                        </button>
                    </nav>

                    <div className="flex items-center justify-self-end gap-2 text-[10px] text-stone-300 sm:hidden">
                        <button
                            ref={menuButton}
                            type="button"
                            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            onClick={() => setMenuOpen(true)}
                            className="grid size-10 place-items-center border border-white/15 text-white transition hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white sm:hidden"
                        >
                            <span className="flex w-4 flex-col gap-1" aria-hidden="true">
                                <span className="h-px w-full bg-current" />
                                <span className="h-px w-3/4 bg-current" />
                                <span className="h-px w-full bg-current" />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        id="mobile-navigation"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-navigation-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.2 }}
                        onClick={(event) => {
                            if (event.target === event.currentTarget) setMenuOpen(false);
                        }}
                        className="fixed inset-0 z-50 flex items-start justify-center bg-[#05080d]/95 px-6 pb-10 pt-6 backdrop-blur-xl sm:hidden"
                    >
                        <div className="w-full max-w-md">
                            <div className="flex items-center justify-between border-b border-white/15 pb-5">
                                <p id="mobile-navigation-title" className="text-xs uppercase tracking-[0.12em] text-[#2EE6A6]">
                                    Navigation
                                </p>
                                <button
                                    ref={closeButton}
                                    type="button"
                                    aria-label="Close navigation menu"
                                    onClick={() => setMenuOpen(false)}
                                    className="grid size-10 place-items-center border border-white/15 text-xl text-white hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <nav aria-label="Mobile navigation" className="mt-5">
                                {[
                                    ["home", "Home", "00"],
                                    ["about", "About", "01"],
                                    ["skills", "Skills", "02"],
                                    ["experience", "Experience", "03"],
                                    ["projects", "Projects", "04"],
                                    ["contact", "Contact", "05"],
                                ].map(([id, label, number]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => navigateTo(id as Section | "about" | "experience")}
                                        aria-current={activeNav === id ? "page" : undefined}
                                        className={`flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-2xl transition ${activeNav === id ? "text-[#FFB84A]" : "text-white hover:text-[#2EE6A6]"}`}
                                    >
                                        {label}
                                        <span className="text-sm text-[#2EE6A6]">{number}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-[1520px] flex-col justify-between px-5 pb-6 pt-4 md:min-h-[calc(100dvh-10rem)] md:pb-0 md:px-10 md:pt-5 2xl:px-0">
                {/* Hero */}
                <section className="flex max-w-2xl flex-1 flex-col justify-center py-12">
                    <Reveal delay={0.1}>
                        <p className="text-sm uppercase tracking-[0.12em] text-[#2EE6A6]">Hello, I'm</p>
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
                        <p className="mt-4 text-md text-stone-400">
                            class: <span className="text-[#2EE6A6]">FRONT END DEVELOPER</span>
                        </p>
                        <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-stone-300">
                            I turn thoughtful design into fast, accessible web experiences, with
                            every detail crafted to feel clear, polished, and effortless to use.
                        </p>
                    </Reveal>

                    <Reveal delay={2.2} className="pointer-events-auto mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                unlock("curious", "Curious Mind", "You pressed a button. Bold move.", 25);
                                setSection("skills");
                            }}
                            className="bg-[#FFB84A] px-6 py-3 justify-center items-center text-xs font-bold text-[#05080d] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            ▶ Discover Skills
                        </button>
                        <a
                            href="/Williams_Uwana_Udeme_CV.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="border border-white/25 px-6 py-3 text-xs font-bold text-stone-200 transition hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            ↗ View Resume
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
            </div>

            <section
                id="about"
                aria-labelledby="about-title"
                className="mx-auto flex w-full max-w-[1520px] scroll-mt-20 items-center px-5 py-20 md:px-10 2xl:px-0"
            >
                <div className="w-full">
                    <div className="grid gap-10 border-t border-white/15 pt-6 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:pt-8">
                        <SectionReveal root={scrollRootRef} x={-56} duration={0.9}>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#2EE6A6]">
                                About
                            </p>
                            <h2
                                id="about-title"
                                className={`${display.className} mt-6 max-w-xl text-4xl font-bold leading-[1.02] text-white md:text-6xl`}
                            >
                                Thoughtful by design.
                                <span className="text-[#FFB84A]"> Precise in every detail.</span>
                            </h2>
                        </SectionReveal>

                        <SectionReveal root={scrollRootRef} y={48} duration={1.05} delay={0.12} className="max-w-2xl">
                            <p className="font-sans text-lg leading-relaxed text-white md:text-2xl">
                                I&apos;m Williams Uwana Udeme, a Front-End Engineer who turns ideas
                                into websites people genuinely enjoy using.
                            </p>
                            <p className="mt-5 font-sans text-sm leading-7 text-stone-300 md:text-base">
                                I build fast, responsive, search-friendly web apps with React,
                                Next.js, and TypeScript, from agency sites and booking platforms
                                to developer tools.
                            </p>
                            <p className="mt-4 font-sans text-sm leading-7 text-stone-400 md:text-base">
                                Clean code. Smooth interactions. Interfaces that feel as good to
                                use as they look. Every project is a chance to learn, refine, and
                                build something better.
                            </p>

                            <div className="mt-8 grid grid-cols-3 border-y border-white/15 py-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.08em] text-stone-500">01</p>
                                    <p className="mt-1 text-[10px] text-[#2EE6A6] sm:text-xs">Clean code</p>
                                </div>
                                <div className="border-l border-white/10 pl-3 sm:pl-5">
                                    <p className="text-[9px] uppercase tracking-[0.08em] text-stone-500">02</p>
                                    <p className="mt-1 text-[10px] text-[#2EE6A6] sm:text-xs">Fluid interactions</p>
                                </div>
                                <div className="border-l border-white/10 pl-3 sm:pl-5">
                                    <p className="text-[9px] uppercase tracking-[0.08em] text-stone-500">03</p>
                                    <p className="mt-1 text-[10px] text-[#2EE6A6] sm:text-xs">People first</p>
                                </div>
                            </div>

                            <p className="mt-5 text-[9px] uppercase tracking-[0.1em] text-stone-500">
                                React <span className="px-2 text-[#FFB84A]">/</span> Next.js
                                <span className="px-2 text-[#FFB84A]">/</span> TypeScript
                            </p>
                        </SectionReveal>
                    </div>
                </div>
            </section>
            <section
                id="experience"
                aria-labelledby="experience-title"
                className="mx-auto w-full max-w-[1520px] scroll-mt-20 px-5 py-16 md:px-10 2xl:px-0"
            >
                <div className="grid gap-8 border-t border-white/15 pt-6 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:pt-8">
                    <SectionReveal root={scrollRootRef} x={-56} duration={0.9}>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#2EE6A6]">
                            Experience
                        </p>
                        <h2
                            id="experience-title"
                            className={`${display.className} mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl`}
                        >
                            Front-End Engineer
                        </h2>
                        <p className="mt-3 font-sans text-lg font-semibold text-[#2EE6A6]">
                            Wazobia Technologies
                        </p>
                        <p className="mt-2 font-sans text-sm text-stone-300">
                            Remote, United Kingdom
                        </p>
                        <p className="mt-5 font-mono text-xs text-stone-400">
                            September 2024 <span className="px-2 text-[#FFB84A]">/</span> February 2026
                        </p>
                    </SectionReveal>

                    <SectionReveal
                        root={scrollRootRef}
                        className="border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0"
                        y={48}
                        duration={1.05}
                        delay={0.12}
                    >
                        <h3 className="font-mono text-[10px] uppercase text-stone-400">
                            Work record
                        </h3>
                        <ol className="mt-3">
                            {EXPERIENCE_RESPONSIBILITIES.map((responsibility, index) => (
                                <li
                                    key={responsibility}
                                    className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-white/10 py-4 sm:grid-cols-[40px_minmax(0,1fr)]"
                                >
                                    <span className="font-mono text-xs text-[#FFB84A]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <p className="font-sans text-sm leading-relaxed text-stone-200">
                                        {responsibility}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </SectionReveal>
                </div>

                <div aria-label="Experience focus areas" className="mt-7 flex flex-wrap items-center gap-2">
                    <span className="mr-2 font-mono text-[9px] uppercase text-stone-500">
                        Focus
                    </span>
                    {EXPERIENCE_FOCUS.map((area) => (
                        <span key={area} className="border border-white/15 px-3 py-2 font-mono text-[10px] text-stone-300">
                            {area}
                        </span>
                    ))}
                </div>
            </section>
            <section
                id="selected-projects"
                aria-labelledby="selected-projects-title"
                className="mx-auto w-full max-w-[1520px] scroll-mt-20 px-5 py-16 md:px-10 2xl:px-0"
            >
                <div className="flex flex-wrap items-end justify-between gap-5 border-t border-white/15 pt-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#2EE6A6]">
                            Selected work
                        </p>
                        <h2
                            id="selected-projects-title"
                            className={`${display.className} mt-4 text-4xl font-bold text-white sm:text-5xl`}
                        >
                            Projects<span className="text-[#FFB84A]">.</span>
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSection("projects")}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#FFB84A] px-5 font-mono text-xs font-bold uppercase text-[#05080D] shadow-[0_0_20px_#FFB84A33] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                    >
                        View all projects <span aria-hidden="true">↗</span>
                    </button>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {PROJECTS.slice(0, 3).map((project) => {
                        const screenshot = project.screenshots[0];
                        return (
                            <article
                                key={project.id}
                                className="min-w-0 border border-white/15 bg-[#080d13]/85 transition-colors hover:border-[#FFB84A]/50"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-[#0c1218]">
                                    {screenshot.src ? (
                                        <Image
                                            src={screenshot.src}
                                            alt={`${project.name} ${screenshot.label.toLowerCase()} screenshot`}
                                            fill
                                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-stone-500">
                                            Screenshot coming soon
                                        </div>
                                    )}
                                    <span className="absolute left-3 top-3 border border-white/20 bg-[#05080D]/85 px-2 py-1 font-mono text-[9px] text-[#FFB84A]">
                                        {project.number} / 09
                                    </span>
                                </div>
                                <div className="p-5 sm:p-6">
                                    <p className="font-mono text-[9px] uppercase text-[#2EE6A6]">
                                        {project.category}
                                    </p>
                                    <h3 className={`${display.className} mt-2 text-2xl font-bold text-white`}>
                                        {project.name}
                                    </h3>
                                    <p className="mt-3 min-h-12 font-sans text-sm leading-relaxed text-stone-300">
                                        {project.description}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {project.technologies.slice(0, 4).map((technology) => (
                                            <span key={technology} className="border border-white/15 px-2 py-1 font-mono text-[9px] text-stone-400">
                                                {technology}
                                            </span>
                                        ))}
                                    </div>
                                    <a
                                        href={project.liveUrl ?? project.githubUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-[#FFB84A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                    >
                                        {project.liveUrl ? "Visit live site" : "View source"}
                                        <span aria-hidden="true">↗</span>
                                    </a>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
            <PortfolioFooter />
        </motion.div>
    );
}