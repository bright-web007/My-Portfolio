"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimate, useReducedMotion } from "framer-motion";

type PageTransitionProps = { pageKey: string };

export default function PageTransition({ pageKey }: PageTransitionProps) {
    const [scope, animate] = useAnimate();
    const reduce = useReducedMotion();
    const previousPage = useRef(pageKey);

    useEffect(() => {
        if (previousPage.current === pageKey) return;
        previousPage.current = pageKey;

        const element = scope.current;
        if (!element) return;

        let cancelled = false;
        let holdTimer: number | undefined;
        const run = async () => {
            if (reduce) {
                await animate(element, { x: "0%", opacity: 0.88 }, { duration: 0.12 });
                if (!cancelled) {
                    await animate(element, { opacity: 0 }, { duration: 0.2 });
                    await animate(element, { x: "-100%", opacity: 1 }, { duration: 0 });
                }
                return;
            }

            await animate(element, { x: "0%" }, { duration: 0.25, ease: "easeInOut" });
            await new Promise<void>((resolve) => {
                holdTimer = window.setTimeout(resolve, 300);
            });
            if (cancelled) return;
            await animate(element, { x: "100%" }, { duration: 0.3, ease: "easeInOut" });
            if (!cancelled) {
                await animate(element, { x: "-100%" }, { duration: 0 });
            }
        };

        void run();
        return () => {
            cancelled = true;
            if (holdTimer !== undefined) window.clearTimeout(holdTimer);
        };
    }, [animate, pageKey, reduce, scope]);

    return (
        <motion.div
            ref={scope}
            aria-hidden="true"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-[#FFB84A]"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 48 48"
                className="size-12 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
            >
                <path d="M13 13 35 35M35 13 13 35" />
                <path d="M20 24h8M24 20v8" strokeWidth="1.5" />
            </svg>
        </motion.div>
    );
}
