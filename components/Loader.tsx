"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { useGame } from "@/store/useGame";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

// Edit these lines to make the boot sequence yours
const LINES = [
  "> RAFFIA-OS v1.0.26 // IKOT EKPENE, AKWA IBOM",
  "> Checking memory ............ OK",
  "> Loading skills: HTML CSS JS React Next.js ... OK",
  "> Weaving raffia threads ...... OK",
  "> Syncing player: WILLIAMS UWANA UDEME ... OK",
  "> Ready. Welcome, Player 1.",
];

export default function Loader() {
  const finish = useGame((s) => s.finishLoading);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < LINES.length) {
      const t = setTimeout(() => setCount((c) => c + 1), 520);
      return () => clearTimeout(t);
    }
    const t = setTimeout(finish, 800);
    return () => clearTimeout(t);
  }, [count, finish]);

  const progress = Math.round((count / LINES.length) * 100);

  return (
    <motion.div
      className={`${mono.className} absolute inset-0 z-20 flex flex-col justify-between bg-[#05080d] p-6 text-sm text-[#2EE6A6] md:p-12`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={finish}
        className="self-end text-xs text-stone-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        SKIP
      </button>

      <div className="space-y-2" aria-live="polite">
        {LINES.slice(0, count).map((line, i) => (
          <p key={i} className={i === LINES.length - 1 ? "text-[#FFB84A]" : ""}>
            {line}
          </p>
        ))}
        <span className="inline-block h-4 w-2 animate-pulse bg-[#2EE6A6]" />
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-[#FFB84A]">
          <span>LOADING WORLD</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full border border-[#FFB84A]/60">
          <div
            className="h-full bg-[#FFB84A] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}