"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PORTFOLIO_CONTACT } from "@/lib/Projects";
import ContactForm from "./ContactForm";
import PortfolioNav from "./PortfolioNav";
import PortfolioFooter from "./PortfolioFooter";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

function SocialPill({ label, url }: { label: string; url: string }) {
    const external = /^https?:\/\//.test(url);
    const configured = external || /^tel:/.test(url);
    const className = "inline-flex min-h-11 items-center gap-3 border border-white/20 bg-[#080d13]/75 px-4 font-mono text-[10px] uppercase text-stone-200 transition hover:border-[#2EE6A6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

    return configured ? (
        <a href={url} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className={className}>
            {label} <span aria-hidden="true" className="text-[#2EE6A6]">{external ? "↗" : "→"}</span>
        </a>
    ) : (
        <span aria-disabled="true" title="Add a profile URL in lib/Projects.ts" className={`${className} text-stone-400`}>
            {label} <span className="text-[8px] text-stone-400">[URL NOT SET]</span>
        </span>
    );
}

export default function ContactPage() {
    const emailConfigured = !PORTFOLIO_CONTACT.email.startsWith("[");

    return (
        <main className={`${mono.className} project-atmosphere absolute inset-0 z-10 overflow-y-auto bg-[#05080D] text-white`}>
            <PortfolioNav activeSection="contact" />
            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1520px] flex-col px-5 pb-8 pt-32 sm:px-8 sm:pt-36 lg:px-12">
                <div className="grid flex-1 items-center gap-12 py-8 md:grid-cols-[1fr_0.9fr] md:gap-16 lg:gap-24">
                    <section aria-labelledby="contact-title" className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 border border-[#2EE6A6]/50 bg-[#2EE6A6]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#2EE6A6]">
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2EE6A6]" />
                            INBOX OPEN
                        </p>
                        <h1 id="contact-title" className={`${display.className} mt-7 text-6xl font-bold leading-[0.95] text-white sm:text-7xl lg:text-8xl`}>
                            Let&apos;s talk<span className="text-[#FFB84A]">.</span>
                        </h1>
                        <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-stone-200 sm:text-lg">
                            Have a thoughtful project in mind? Send a note and we can start there.
                        </p>
                        <div className="mt-8">
                            <p className="font-mono text-[9px] uppercase text-stone-300">Email</p>
                            {emailConfigured ? (
                                <a href={`mailto:${PORTFOLIO_CONTACT.email}`} className="mt-2 inline-block break-all font-mono text-lg text-[#FFB84A] underline decoration-[#FFB84A]/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-white sm:text-xl">
                                    {PORTFOLIO_CONTACT.email}
                                </a>
                            ) : (
                                <p className="mt-2 break-all font-mono text-lg text-[#FFB84A] sm:text-xl">
                                    {PORTFOLIO_CONTACT.email}
                                </p>
                            )}
                        </div>
                        <div className="mt-7 flex flex-wrap gap-3" aria-label="Social profiles">
                            <SocialPill label="GitHub" url={PORTFOLIO_CONTACT.github} />
                            <SocialPill label="LinkedIn" url={PORTFOLIO_CONTACT.linkedIn} />
                            <SocialPill
                                label={`WhatsApp ${PORTFOLIO_CONTACT.whatsapp}`}
                                url={`https://wa.me/${PORTFOLIO_CONTACT.whatsapp.replace(/\D/g, "")}`}
                            />
                            <SocialPill
                                label={`Call ${PORTFOLIO_CONTACT.phone}`}
                                url={`tel:${PORTFOLIO_CONTACT.phone.replace(/\s/g, "")}`}
                            />
                        </div>
                    </section>

                    <ContactForm />
                </div>

            </div>
            <PortfolioFooter />
        </main>
    );
}
