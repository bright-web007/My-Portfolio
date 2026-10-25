"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Section } from "@/store/useGame";
import { useGame } from "@/store/useGame";

type NavigationSection = Section | "about" | "experience";

const ITEMS: { id: NavigationSection; label: string }[] = [
    { id: "home", label: "HOME" },
    { id: "about", label: "ABOUT" },
    { id: "skills", label: "SKILLS" },
    { id: "experience", label: "EXPERIENCE" },
    { id: "projects", label: "PROJECTS" },
    { id: "contact", label: "CONTACT" },
];

type PortfolioNavProps = {
    activeSection: Section;
    onNavigate?: (section: Section) => void;
};

export default function PortfolioNav({ activeSection, onNavigate }: PortfolioNavProps) {
    const setSection = useGame((state) => state.setSection);
    const reduce = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const dialog = useRef<HTMLDivElement>(null);

    const navigate = (section: NavigationSection) => {
        setMenuOpen(false);
        if (section === "about" || section === "experience") {
            if (onNavigate) onNavigate("home");
            else setSection("home");
            window.setTimeout(() => {
            document.getElementById(section)?.scrollIntoView({
                    behavior: reduce ? "auto" : "smooth",
                    block: "start",
                });
            }, 350);
            return;
        }
        if (onNavigate) onNavigate(section);
        else setSection(section);
    };

    useEffect(() => {
        if (!menuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButton.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                return;
            }
            if (event.key !== "Tab" || !dialog.current) return;

            const focusable = dialog.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
            menuButton.current?.focus();
        };
    }, [menuOpen]);

    return (
        <>
            <header className="pointer-events-auto absolute inset-x-0 top-0 z-30 px-5 py-5 md:px-10">
                <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("home")}
                        aria-label="Williams Uwana home"
                        className="grid size-10 shrink-0 place-items-center rounded-full border border-[#2EE6A6]/70 bg-[#05080D]/80 font-mono text-xs font-bold text-[#2EE6A6] shadow-[0_0_18px_#2EE6A622] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        WU
                    </button>

                    <nav
                        aria-label="Main navigation"
                        className="hidden items-center gap-1 rounded-full border border-white/15 bg-[#080d13]/85 p-1.5 font-mono text-[10px] text-stone-300 shadow-xl backdrop-blur-xl sm:flex"
                    >
                        {ITEMS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.id)}
                                aria-current={activeSection === item.id ? "page" : undefined}
                                className={`rounded-full px-4 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${activeSection === item.id ? "bg-[#FFB84A] font-bold text-[#05080D]" : "hover:bg-white/10 hover:text-white"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        ref={menuButton}
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen(true)}
                        className="grid size-10 place-items-center border border-white/20 bg-[#080d13]/85 text-white backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden"
                    >
                        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
                            <span className="h-px w-full bg-current" />
                            <span className="h-px w-3/4 bg-current" />
                            <span className="h-px w-full bg-current" />
                        </span>
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        ref={dialog}
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
                        className="fixed inset-0 z-50 flex items-start justify-center bg-[#05080D]/95 px-6 pb-10 pt-6 backdrop-blur-xl sm:hidden"
                    >
                        <div className="w-full max-w-md">
                            <div className="flex items-center justify-between border-b border-white/15 pb-5">
                                <p id="mobile-navigation-title" className="font-mono text-xs uppercase text-[#2EE6A6]">
                                    Navigation
                                </p>
                                <button
                                    ref={closeButton}
                                    type="button"
                                    aria-label="Close navigation menu"
                                    onClick={() => setMenuOpen(false)}
                                    className="grid size-10 place-items-center border border-white/20 text-xl text-white hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white"
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <nav aria-label="Mobile navigation" className="mt-5">
                                {ITEMS.map((item, index) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => navigate(item.id)}
                                        aria-current={activeSection === item.id ? "page" : undefined}
                                        className={`flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-2xl focus-visible:outline-2 focus-visible:outline-white ${activeSection === item.id ? "text-[#FFB84A]" : "text-white hover:text-[#2EE6A6]"}`}
                                    >
                                        {item.label}
                                        <span className="font-mono text-sm text-[#2EE6A6]">0{index + 1}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
