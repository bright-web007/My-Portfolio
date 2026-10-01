"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/store/useGame";

type Stitch = { id: number; x: number; y: number };
const DIRS = [0, 90, 180, 270];
const GOLD = "#FFB84A";
const GREEN = "#2EE6A6";

export default function Cursor() {
    const ring = useRef<HTMLDivElement>(null);
    const dot = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [hover, setHover] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [label, setLabel] = useState("");
    const [stitches, setStitches] = useState<Stitch[]>([]);
    const canvasLabel = useGame((s) => s.hoverLabel);

    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const root = document.documentElement;
        root.classList.add("has-cursor");

        let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0;
        let first = true;
        let overText = false;

        const tick = () => {
            const k = reduce ? 1 : 0.18;
            rx += (tx - rx) * k;
            ry += (ty - ry) * k;
            if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
            if (dot.current) dot.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
            raf = requestAnimationFrame(tick);
        };

        const onMove = (e: PointerEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            if (first) {
                rx = tx;
                ry = ty;
                first = false;
            }
            if (!overText) setVisible(true);
        };

        const onOver = (e: PointerEvent) => {
            const t = e.target as Element | null;
            if (!t || !t.closest) return;
            overText = !!t.closest("input, textarea");
            if (overText) {
                setVisible(false);
                return;
            }
            const el = t.closest<HTMLElement>("a, button, [data-cursor]");
            setHover(!!el);
            setLabel(el?.dataset.cursor ?? "");
        };

        const onDown = (e: PointerEvent) => {
            setPressed(true);
            if (reduce) return;
            const id = Date.now() + Math.random();
            setStitches((s) => [...s, { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => setStitches((s) => s.filter((i) => i.id !== id)), 700);
        };
        const onUp = () => setPressed(false);
        const onLeave = () => setVisible(false);

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerover", onOver);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        root.addEventListener("pointerleave", onLeave);
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerover", onOver);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            root.removeEventListener("pointerleave", onLeave);
            root.classList.remove("has-cursor");
        };
    }, []);

    const isHover = hover || canvasLabel !== null;
    const shownLabel = canvasLabel ?? label;
    const color = isHover ? GREEN : GOLD;
    const dist = pressed ? 8 : isHover ? 11 : 17;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50"
            style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}
        >
            {/* Chevron reticle (follows with a slight lag) */}
            <div ref={ring} className="absolute left-0 top-0 will-change-transform">
                <div
                    style={{
                        transform: `rotate(${isHover ? 45 : 0}deg)`,
                        transition: "transform .25s ease",
                        color,
                        filter: `drop-shadow(0 0 5px ${color})`,
                    }}
                >
                    {DIRS.map((deg) => (
                        <svg
                            key={deg}
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            className="absolute"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="square"
                            style={{
                                left: -5,
                                top: -5,
                                transform: `rotate(${deg}deg) translateY(-${dist}px)`,
                                transition: "transform .2s ease",
                            }}
                        >
                            <path d="M1 7 L5 3 L9 7" />
                        </svg>
                    ))}
                </div>
                {shownLabel && (
                    <span
                        className="absolute left-5 top-5 whitespace-nowrap border px-2 py-0.5 font-mono text-[10px]"
                        style={{
                            color: GREEN,
                            borderColor: GREEN,
                            background: "rgba(5,8,13,.85)",
                        }}
                    >
                        {shownLabel}
                    </span>
                )}
            </div>

            {/* Center dot (exact position) */}
            <div ref={dot} className="absolute left-0 top-0 will-change-transform">
                <div
                    className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
            </div>

            {/* Cross-stitch marks on click */}
            {stitches.map((s) => (
                <svg
                    key={s.id}
                    className="stitch absolute"
                    style={{ left: s.x, top: s.y }}
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <path d="M3 3 L15 15 M15 3 L3 15" />
                </svg>
            ))}
        </div>
    );
}