"use client";

import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { FaLinkedin } from "react-icons/fa6";
import { SiGithub, SiWhatsapp } from "react-icons/si";
import { PORTFOLIO_CONTACT, PORTFOLIO_LOCATION } from "@/lib/Projects";
import type { Section } from "@/store/useGame";
import { useGame } from "@/store/useGame";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const socialLinks = [
    {
        label: "GitHub",
        icon: SiGithub,
        href: PORTFOLIO_CONTACT.github,
    },
    {
        label: "LinkedIn",
        icon: FaLinkedin,
        href: PORTFOLIO_CONTACT.linkedIn,
    },
    {
        label: "WhatsApp",
        icon: SiWhatsapp,
        href: `https://wa.me/${PORTFOLIO_CONTACT.whatsapp.replace(/\D/g, "")}`,
    },
];

type FooterDestination = Section | "about" | "experience";

const footerLinks: { id: FooterDestination; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
];

export default function PortfolioFooter({ compact = false }: { compact?: boolean }) {
    const setSection = useGame((state) => state.setSection);
    const navigate = (destination: FooterDestination) => {
        if (destination === "about" || destination === "experience") {
            setSection("home");
            window.setTimeout(() => {
                document.getElementById(destination)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 350);
            return;
        }

        if (destination === "home") {
            setSection("home");
            window.setTimeout(() => {
                document.getElementById("home")?.scrollTo({ top: 0, behavior: "smooth" });
            }, 350);
            return;
        }

        setSection(destination);
    };

    const navigation = (
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {footerLinks.map((link) => (
                <button
                    key={link.id}
                    type="button"
                    onClick={() => navigate(link.id)}
                    className="font-mono text-[8px] uppercase text-stone-400 transition-colors hover:text-[#FFB84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    {link.label}
                </button>
            ))}
        </nav>
    );

    if (compact) {
        return (
            <footer className={`${mono.className} pointer-events-auto absolute inset-x-5 bottom-2 z-20 border-t border-white/15 bg-[#05080D]/90 px-2 py-2 backdrop-blur md:inset-x-10`}>
                <div className="flex flex-col gap-2 text-[8px] uppercase text-stone-400 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span>© 2026 Williams Uwana Udeme</span>
                        <span className="text-[#FFB84A]">Raffia City · {PORTFOLIO_LOCATION}</span>
                    </div>
                    {navigation}
                </div>
            </footer>
        );
    }

    return (
        <footer className="relative z-10 border-t border-white/10 bg-[#05080D]">
            <div className="mx-auto grid w-full max-w-[1520px] grid-cols-[36px_minmax(0,1fr)] gap-x-5 gap-y-9 px-5 py-12 sm:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-8 sm:px-8 lg:grid-cols-[56px_minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-x-12 lg:px-0 lg:py-16">
                <nav aria-label="Social shortcuts" className={`${mono.className} row-span-3 flex flex-col items-center gap-5 border-r border-white/10 pr-4 sm:gap-6`}>
                    {socialLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={link.label}
                            title={link.label}
                            className="grid size-8 place-items-center text-xs font-bold text-stone-300 transition-colors hover:text-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <link.icon aria-hidden="true" size={19} />
                        </a>
                    ))}
                </nav>

                <section aria-labelledby="footer-contact-title" className="min-w-0">
                    <h2 id="footer-contact-title" className={`${display.className} text-3xl font-bold uppercase text-white sm:text-4xl`}>
                        Contact
                    </h2>
                    <div className="mt-5 space-y-5">
                        <div>
                            <p className={`${mono.className} text-[9px] uppercase text-stone-500`}>Email</p>
                            <a href={`mailto:${PORTFOLIO_CONTACT.email}`} className="mt-1 inline-block break-all font-sans text-sm text-stone-200 underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#FFB84A] focus-visible:outline-2 focus-visible:outline-white sm:text-base">
                                {PORTFOLIO_CONTACT.email}
                            </a>
                        </div>
                        <div>
                            <p className={`${mono.className} text-[9px] uppercase text-stone-500`}>Phone</p>
                            <a href={`tel:${PORTFOLIO_CONTACT.phone.replace(/\s/g, "")}`} className="mt-1 inline-block font-sans text-sm text-stone-200 transition-colors hover:text-[#FFB84A] focus-visible:outline-2 focus-visible:outline-white sm:text-base">
                                {PORTFOLIO_CONTACT.phone}
                            </a>
                        </div>
                    </div>
                </section>

                <section aria-label="Social and site navigation" className="min-w-0 sm:col-start-3 sm:row-start-1 lg:col-start-3 lg:row-start-1">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="min-w-0">
                            <h2 id="footer-social-title" className={`${mono.className} text-[10px] uppercase text-stone-500`}>
                                Social
                            </h2>
                            <div className="mt-3 flex flex-col">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between gap-1 border-b border-white/20 py-1.5 font-sans text-sm text-stone-200 transition-colors hover:text-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white sm:text-base"
                                    >
                                        <span className="inline-flex min-w-0 items-center gap-1.5">
                                            <link.icon aria-hidden="true" size={16} />
                                            {link.label}
                                        </span>
                                        <span aria-hidden="true" className="text-[#FFB84A]">↗</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                        <nav aria-label="Footer navigation" className="min-w-0 border-l border-white/10 pl-3 sm:pl-5">
                            <h2 className={`${mono.className} text-[10px] uppercase text-stone-500`}>
                                Explore
                            </h2>
                            <div className="mt-3 flex flex-col">
                                {footerLinks.map((link) => (
                                    <button
                                        key={link.id}
                                        type="button"
                                        onClick={() => navigate(link.id)}
                                        className="flex items-center justify-between gap-1 border-b border-white/20 py-1.5 text-left font-sans text-sm text-stone-200 transition-colors hover:text-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-white sm:text-base"
                                    >
                                        {link.label}
                                        <span aria-hidden="true" className="text-[#FFB84A]">→</span>
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>
                </section>

                <section aria-label="Credits" className="min-w-0 sm:col-span-2 sm:col-start-2 sm:row-start-2 lg:col-span-1 lg:col-start-4 lg:row-start-1">
                    <p className="font-sans text-sm text-stone-300">Designed and developed by</p>
                    <p className={`${display.className} mt-1 text-lg font-bold text-[#2EE6A6]`}>
                        Williams Uwana Udeme
                    </p>
                    <p className={`${mono.className} mt-5 text-sm text-stone-500`}>
                        © 2026 <span className="px-1 text-[#FFB84A]">/</span> {PORTFOLIO_LOCATION}
                    </p>
                </section>

                <div className={`${mono.className} col-start-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[9px] uppercase text-stone-500 sm:col-span-2 sm:col-start-2 sm:row-start-3 lg:col-span-3 lg:col-start-2 lg:row-start-2`}>
                    <span>Raffia City · Front-end developer</span>
                    <a
                        href="/Williams_Uwana_Udeme_CV.pdf"
                        download="Williams_Uwana_Udeme_CV.pdf"
                        className="inline-flex items-center gap-2 text-stone-300 transition-colors hover:text-[#FFB84A] focus-visible:outline-2 focus-visible:outline-white"
                    >
                        Resume <span aria-hidden="true" className="text-[#FFB84A]">↓</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}