"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PROJECTS, type Project, type ProjectRarity } from "@/lib/Projects";
import { useGame } from "@/store/useGame";
import PortfolioNav from "./PortfolioNav";
import PortfolioFooter from "./PortfolioFooter";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const rarityColor: Record<ProjectRarity, string> = {
    Common: "#C4BFB8",
    Uncommon: "#2EE6A6",
    Rare: "#8FA8FF",
    Epic: "#FF5A36",
    Legendary: "#FFB84A",
};

type ProjectCardProps = {
    project: Project;
    layout: "carousel" | "list";
    onOpen: (project: Project) => void;
};

export function ProjectCard({ project, layout, onOpen }: ProjectCardProps) {
    const color = rarityColor[project.rarity];
    const isList = layout === "list";

    return (
        <button
            type="button"
            tabIndex={isList ? undefined : -1}
            onClick={() => onOpen(project)}
            aria-label={`Open project ${project.number}: ${project.name}`}
            data-cursor="INSPECT"
            className={`group relative flex w-full flex-col border bg-[#080d13]/90 p-5 text-left shadow-[0_20px_70px_#0008] backdrop-blur-xl transition-[border-color,background-color] hover:bg-[#0d151d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isList ? "min-h-64 border-white/15 sm:p-6" : "h-[306px] border-[#FFB84A]/50 sm:h-[326px]"}`}
        >
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFB84A]/60 to-transparent" />
            <div className="flex w-full items-start justify-between gap-3">
                <span className="font-serif text-6xl italic leading-none text-[#FFB84A] sm:text-7xl">
                    {project.number}
                </span>
                <span className="text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.08em] text-stone-300">
                    {project.category}
                </span>
            </div>
            <span
                className="mt-4 w-fit border px-2 py-1 font-mono text-[9px] uppercase"
                style={{ color, borderColor: `${color}88` }}
            >
                {project.rarity}
            </span>
            <h3 className={`${display.className} mt-4 text-xl font-bold text-white sm:text-2xl`}>
                {project.name}
            </h3>
            {isList && (
                <p className="mt-2 line-clamp-1 font-sans text-sm leading-relaxed text-stone-300">
                    {project.description}
                </p>
            )}
            <div className="mt-auto flex w-full flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
                <span className="font-mono text-xs font-bold text-[#2EE6A6]">
                    {project.metric}
                </span>
                {isList ? (
                    <span className="font-mono text-[9px] leading-relaxed text-stone-300">
                        {project.technologies.join(" / ")}
                    </span>
                ) : (
                    <span className="font-mono text-[9px] uppercase text-stone-300">
                        {project.category}
                    </span>
                )}
            </div>
        </button>
    );
}

type ProjectCarouselProps = {
    index: number;
    onIndexChange: (index: number) => void;
    onOpen: (project: Project) => void;
};

export function ProjectCarousel({ index, onIndexChange, onOpen }: ProjectCarouselProps) {
    const pointerStart = useRef<number | null>(null);
    const suppressClick = useRef(false);
    const current = PROJECTS[index];
    const move = (delta: number) =>
        onIndexChange((index + delta + PROJECTS.length) % PROJECTS.length);

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        pointerStart.current = event.clientX;
    };

    const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) < 36) return;

        suppressClick.current = true;
        move(distance < 0 ? 1 : -1);
        window.setTimeout(() => {
            suppressClick.current = false;
        }, 80);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
        } else if (event.key === "Enter" && event.target === event.currentTarget) {
            event.preventDefault();
            onOpen(current);
        }
    };

    return (
        <div className="relative mx-auto mt-8 w-full max-w-[1040px]">
            <div
                role="group"
                aria-roledescription="carousel"
                aria-label={`Project inventory. Item ${current.number} of ${PROJECTS.length}: ${current.name}`}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                    pointerStart.current = null;
                }}
                className="relative h-[306px] overflow-hidden touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-[326px]"
            >
                {PROJECTS.map((project, projectIndex) => {
                    const rawOffset = projectIndex - index;
                    const offset =
                        rawOffset > PROJECTS.length / 2
                            ? rawOffset - PROJECTS.length
                            : rawOffset < -PROJECTS.length / 2
                                ? rawOffset + PROJECTS.length
                                : rawOffset;
                    const visible = Math.abs(offset) <= 2;

                    if (!visible) return null;
                    return (
                        <motion.div
                            key={project.id}
                            aria-hidden={offset !== 0}
                            className="absolute left-1/2 top-0 w-[min(82vw,320px)] -translate-x-1/2"
                            initial={false}
                            animate={{
                                x: `${offset * 72}%`,
                                rotateY: offset * -28,
                                scale: offset === 0 ? 1 : Math.max(0.72, 0.86 - Math.abs(offset) * 0.06),
                                opacity: offset === 0 ? 1 : Math.max(0.22, 0.68 - Math.abs(offset) * 0.2),
                            }}
                            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                            style={{ zIndex: 10 - Math.abs(offset), transformStyle: "preserve-3d" }}
                            onClickCapture={(event) => {
                                if (suppressClick.current) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    suppressClick.current = false;
                                }
                            }}
                        >
                            <ProjectCard project={project} layout="carousel" onOpen={onOpen} />
                        </motion.div>
                    );
                })}
            </div>
            <button
                type="button"
                aria-label="Previous project"
                onClick={() => move(-1)}
                className="absolute left-0 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center border border-white/25 bg-[#05080D]/90 text-lg text-white transition hover:border-[#FFB84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-left-3"
            >
                <span aria-hidden="true">←</span>
            </button>
            <button
                type="button"
                aria-label="Next project"
                onClick={() => move(1)}
                className="absolute right-0 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center border border-white/25 bg-[#05080D]/90 text-lg text-white transition hover:border-[#FFB84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-3"
            >
                <span aria-hidden="true">→</span>
            </button>
        </div>
    );
}

export function ProjectList({ onOpen }: { onOpen: (project: Project) => void }) {
    return (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} layout="list" onOpen={onOpen} />
            ))}
        </div>
    );
}

function ProjectLinks({ project }: { project: Project }) {
    const links = [
        ["LIVE PROJECT", project.liveUrl],
        ["SOURCE CODE", project.githubUrl],
    ] as const;

    return (
        <div className="flex flex-wrap gap-3">
            {links.map(([label, url]) => {
                const active = url !== null && /^https?:\/\//.test(url);
                const className = "border border-white/20 px-4 py-3 font-mono text-[10px] text-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
                return active ? (
                    <a key={label} href={url} target="_blank" rel="noreferrer" className={className}>
                        {label} ↗
                    </a>
                ) : (
                    <span key={label} aria-disabled="true" className={`${className} text-stone-400`}>
                        {label}: {url ?? "NOT DEPLOYED"}
                    </span>
                );
            })}
        </div>
    );
}

export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
    const reduce = useReducedMotion();
    const backButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        backButton.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onBack();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onBack]);

    return (
        <motion.article
            aria-labelledby="project-detail-title"
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="mx-auto w-full max-w-[1160px] pb-14"
        >
            <button
                ref={backButton}
                type="button"
                onClick={onBack}
                className="border border-white/25 px-4 py-3 font-mono text-[10px] text-white transition hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
                ← BACK TO INVENTORY
            </button>

            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase text-stone-300">
                <span>{project.number} / {String(PROJECTS.length).padStart(2, "0")}</span>
                <span aria-hidden="true" className="text-[#FFB84A]">/</span>
                <span>{project.category}</span>
                <span className="border px-2 py-1" style={{ color: rarityColor[project.rarity], borderColor: `${rarityColor[project.rarity]}88` }}>
                    {project.rarity}
                </span>
            </div>
            <h1 id="project-detail-title" className={`${display.className} mt-4 text-4xl font-bold text-white sm:text-6xl`}>
                {project.name}
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-stone-300">
                {project.description}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
                {project.screenshots.map((screenshot, index) => (
                    <figure key={screenshot.label} className="min-w-0">
                        {screenshot.src ? (
                            <img
                                src={screenshot.src}
                                alt={`${project.name}, screen ${index + 1}`}
                                loading="lazy"
                                className="aspect-[16/10] w-full border border-white/15 object-cover"
                            />
                        ) : (
                            <div
                                role="img"
                                aria-label={`${screenshot.label} placeholder for ${project.name}`}
                                className="grid aspect-[16/10] place-items-center border border-white/15 bg-[#080d13]/90 p-4 text-center font-mono text-[10px] text-stone-400"
                            >
                                <span>{screenshot.label}</span>
                            </div>
                        )}
                        <figcaption className="mt-2 font-mono text-[9px] uppercase text-stone-400">
                            Screen {String(index + 1).padStart(2, "0")}
                        </figcaption>
                    </figure>
                ))}
            </div>

            <div className="mt-10 grid gap-x-12 gap-y-8 border-t border-white/15 pt-7 md:grid-cols-2">
                <DetailBlock label="THE PROBLEM" value={project.problem} />
                <DetailBlock label="WHAT I BUILT" value={project.built} />
                <DetailBlock label="MY ROLE" value={project.role} />
                <div>
                    <p className="font-mono text-[10px] text-[#2EE6A6]">THE STACK</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                            <span key={technology} className="border border-white/20 px-3 py-2 font-mono text-[10px] text-stone-200">
                                {technology}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <ProjectLinks project={project} />
            </div>
        </motion.article>
    );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-mono text-[10px] text-[#2EE6A6]">{label}</p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-stone-200">{value}</p>
        </div>
    );
}

function InventoryDetail({ project, index, onOpen, onChange }: {
    project: Project;
    index: number;
    onOpen: (project: Project) => void;
    onChange: (index: number) => void;
}) {
    const previous = () => onChange((index + PROJECTS.length - 1) % PROJECTS.length);
    const next = () => onChange((index + 1) % PROJECTS.length);

    return (
        <section aria-labelledby="active-project-title" aria-live="polite" className="mx-auto mt-6 w-full max-w-[900px] border border-white/15 bg-[#080d13]/90 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-stone-300">
                <span>{project.number} / {String(PROJECTS.length).padStart(2, "0")}</span>
                <span aria-hidden="true" className="text-[#FFB84A]">/</span>
                <span>{project.category}</span>
                <span className="ml-auto border px-2 py-1" style={{ color: rarityColor[project.rarity], borderColor: `${rarityColor[project.rarity]}88` }}>
                    {project.rarity}
                </span>
            </div>
            <h2 id="active-project-title" className={`${display.className} mt-4 text-2xl font-bold text-white sm:text-3xl`}>
                {project.name}
            </h2>
            <p className="mt-2 line-clamp-2 max-w-2xl font-sans text-sm leading-relaxed text-stone-300">
                {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((technology) => (
                    <span key={technology} className="border border-white/20 px-2.5 py-1.5 font-mono text-[9px] text-stone-200">
                        {technology}
                    </span>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <button type="button" aria-label="Previous project" onClick={previous} className="grid size-10 place-items-center border border-white/20 text-white hover:border-[#FFB84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">←</button>
                    <button type="button" aria-label="Next project" onClick={next} className="grid size-10 place-items-center border border-white/20 text-white hover:border-[#FFB84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">→</button>
                </div>
                <button type="button" onClick={() => onOpen(project)} className="bg-[#FFB84A] px-5 py-3 font-mono text-[10px] font-bold uppercase text-[#05080D] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Open project <span aria-hidden="true">↗</span>
                </button>
            </div>
        </section>
    );
}

function Toast({ toast }: { toast: { title: string; text: string; xp: number } | null }) {
    if (!toast) return null;
    return (
        <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-5 right-5 z-40 w-[min(20rem,calc(100vw-2.5rem))] border-l-2 border-[#FFB84A] bg-[#080d13]/95 p-4 shadow-xl"
        >
            <p className="font-mono text-[9px] text-[#FFB84A]">ACHIEVEMENT UNLOCKED</p>
            <div className="mt-2 flex items-center justify-between gap-4 text-sm text-white">
                <span>{toast.title}</span>
                <span className="font-mono text-[#2EE6A6]">+{toast.xp} XP</span>
            </div>
            <p className="mt-2 font-sans text-xs leading-relaxed text-stone-300">{toast.text}</p>
        </motion.div>
    );
}

export default function ProjectsPage() {
    const [view, setView] = useState<"3d" | "list">("3d");
    const [index, setIndex] = useState(0);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const inventory = useRef<HTMLElement>(null);
    const { inspectProject, toast, clearToast } = useGame();
    const reduce = useReducedMotion();
    const current = PROJECTS[index];

    useEffect(() => {
        setView(window.matchMedia("(max-width: 639px)").matches ? "list" : "3d");
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(clearToast, 4000);
        return () => window.clearTimeout(timer);
    }, [toast, clearToast]);

    const openProject = (project: Project) => {
        inspectProject(project.id);
        setSelectedProject(project);
        inventory.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };

    const returnToInventory = () => setSelectedProject(null);

    return (
        <main
            ref={inventory}
            className={`${mono.className} project-atmosphere absolute inset-0 z-10 overflow-y-auto bg-[#05080D] text-white`}
        >
            <PortfolioNav activeSection="projects" />
            <div className="relative z-10 mx-auto min-h-full w-full max-w-[1520px] px-5 pb-12 pt-28 sm:px-8 sm:pt-32 lg:px-12">
                <AnimatePresence mode="wait" initial={false}>
                    {selectedProject ? (
                        <ProjectDetail key={selectedProject.id} project={selectedProject} onBack={returnToInventory} />
                    ) : (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                            transition={{ duration: reduce ? 0 : 0.2 }}
                            className="mx-auto w-full max-w-[1160px] pb-12"
                        >
                            <div className="flex flex-wrap items-end justify-between gap-5">
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2EE6A6]">
                                        Raffia City <span className="px-2 text-[#FFB84A]">/</span> Inventory
                                    </p>
                                    <h1 className={`${display.className} mt-3 text-4xl font-bold text-white sm:text-6xl`}>
                                        Projects<span className="text-[#FFB84A]">.</span>
                                    </h1>
                                </div>
                                <div className="flex items-center gap-1 border border-white/15 bg-[#080d13]/75 p-1 font-mono text-[9px] backdrop-blur-xl" role="group" aria-label="Project view">
                                    <button type="button" aria-pressed={view === "3d"} onClick={() => setView("3d")} className={`px-3 py-2.5 transition focus-visible:outline-2 focus-visible:outline-white ${view === "3d" ? "bg-[#FFB84A] font-bold text-[#05080D]" : "text-stone-300 hover:text-white"}`}>
                                        3D VIEW
                                    </button>
                                    <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={`px-3 py-2.5 transition focus-visible:outline-2 focus-visible:outline-white ${view === "list" ? "bg-[#FFB84A] font-bold text-[#05080D]" : "text-stone-300 hover:text-white"}`}>
                                        LIST VIEW
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/10 py-3 font-mono text-[9px] uppercase tracking-[0.04em] text-stone-300 sm:text-[10px]">
                                <span className="text-[#FFB84A]" aria-hidden="true">✣</span>
                                <p>Drag, swipe or use the arrow keys. Press Enter to open one.</p>
                            </div>

                            {view === "3d" ? (
                                <>
                                    <ProjectCarousel index={index} onIndexChange={setIndex} onOpen={openProject} />
                                    <InventoryDetail project={current} index={index} onOpen={openProject} onChange={setIndex} />
                                </>
                            ) : (
                                <ProjectList onOpen={openProject} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <PortfolioFooter />
            <Toast toast={toast} />
        </main>
    );
}
