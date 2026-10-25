"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import PhoneInput from "react-phone-number-input";
import { motion, useReducedMotion } from "framer-motion";
import { Space_Grotesk } from "next/font/google";
import { PORTFOLIO_CONTACT } from "@/lib/Projects";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export default function ContactForm() {
    const [phone, setPhone] = useState<string | undefined>();
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState("");
    const reduce = useReducedMotion();

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const values = new FormData(form);
        setSending(true);
        setStatus("");

        try {
            const response = await fetch(
                `https://formsubmit.co/ajax/${encodeURIComponent(PORTFOLIO_CONTACT.email)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: String(values.get("name") ?? "").trim(),
                        email: String(values.get("email") ?? "").trim(),
                        phone: phone ?? "Not provided",
                        message: String(values.get("message") ?? "").trim(),
                        _subject: "Portfolio message",
                        _template: "table",
                    }),
                }
            );
            const result = await response.json() as { success?: boolean | string; message?: string };
            if (!response.ok || result.success === false || result.success === "false") {
                throw new Error("Email relay rejected the message");
            }

            setStatus(result.message ?? "Your message has been sent.");
            form.reset();
            setPhone(undefined);
        } catch {
            setStatus("Message could not be sent. Please use the email address on this page.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative border border-white/15 bg-[#080d13]/90 p-5 shadow-[0_20px_70px_#0008] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <h2 className={`${display.className} text-2xl font-bold text-white`}>Send a note</h2>
                <span className="font-mono text-[9px] uppercase text-[#2EE6A6]">New message</span>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-5">
                <label className="block font-mono text-[10px] uppercase text-stone-300">
                    Name
                    <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        className="mt-2 block min-h-12 w-full border border-white/20 bg-[#05080D]/80 px-3 font-sans text-sm normal-case text-white outline-none placeholder:text-stone-500 focus:border-[#2EE6A6] focus-visible:ring-2 focus-visible:ring-[#2EE6A6] disabled:cursor-not-allowed"
                        placeholder="Your name"
                    />
                </label>
                <label className="block font-mono text-[10px] uppercase text-stone-300">
                    Email
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        className="mt-2 block min-h-12 w-full border border-white/20 bg-[#05080D]/80 px-3 font-sans text-sm normal-case text-white outline-none placeholder:text-stone-500 focus:border-[#2EE6A6] focus-visible:ring-2 focus-visible:ring-[#2EE6A6] disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                    />
                </label>
                <label className="block font-mono text-[10px] uppercase text-stone-300">
                    Contact number <span className="text-stone-500">(optional)</span>
                    <PhoneInput
                        international
                        defaultCountry="NG"
                        value={phone}
                        onChange={setPhone}
                        className="phone-input mt-2 font-sans text-sm normal-case"
                        aria-label="Contact number with country code"
                    />
                </label>
                <label className="block font-mono text-[10px] uppercase text-stone-300">
                    Message
                    <textarea
                        name="message"
                        rows={5}
                        required
                        className="mt-2 block w-full resize-y border border-white/20 bg-[#05080D]/80 p-3 font-sans text-sm normal-case leading-relaxed text-white outline-none placeholder:text-stone-500 focus:border-[#2EE6A6] focus-visible:ring-2 focus-visible:ring-[#2EE6A6] disabled:cursor-not-allowed"
                        placeholder="What would you like to talk about?"
                    />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex min-h-12 items-center gap-3 bg-[#FFB84A] px-5 font-mono text-[13px] font-bold uppercase text-[#05080D] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
                    >
                        {sending ? "Sending..." : "Submit"}
                    </button>
                    <div className="relative h-10 w-12" aria-hidden="true">
                        {sending && (
                            <motion.svg
                                viewBox="0 0 48 40"
                                className="absolute left-0 top-1 size-9 text-[#FFB84A]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                initial={{ opacity: 0, x: 0, y: 8 }}
                                animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0], x: [0, 55], y: [0, -34] }}
                                transition={{ duration: reduce ? 0 : 0.75, ease: "easeOut" }}
                            >
                                <path d="m3 18 41-15-15 34-6-14L3 18Z" />
                                <path d="m23 23 21-20" />
                            </motion.svg>
                        )}
                    </div>
                </div>
                <p role="status" aria-live="polite" className="min-h-4 font-mono text-[9px] text-[#2EE6A6]">
                    {status}
                </p>
                <p className="border-t border-white/10 pt-4 font-sans text-xs leading-relaxed text-stone-300">
                    Your message is emailed through FormSubmit. This portfolio does not store your submission.
                </p>
            </form>
        </div>
    );
}
