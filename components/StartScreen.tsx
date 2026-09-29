"use client";
import { motion } from "framer-motion";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { useGame } from "@/store/useGame";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function StartScreen() {
  const start = useGame((s) => s.start);
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 bg-[#05080d]/60 p-6 text-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className={`${mono.className} text-xs text-[#2EE6A6]`}>
        A PORTFOLIO YOU CAN PLAY
      </p>
      <h1
        className={`${display.className} text-7xl font-bold leading-[0.9] tracking-tight text-white md:text-9xl`}
      >
        RAFFIA
        <br />
        <span className="text-transparent [-webkit-text-stroke:2px_#FFB84A]">
          CITY
        </span>
      </h1>
      <button
        onClick={start}
        className={`${mono.className} bg-[#FFB84A] px-10 py-4 text-sm font-bold text-[#05080d] transition hover:bg-[#ffd07f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
      >
        PRESS START
      </button>
      <p className={`${mono.className} text-xs text-stone-500`}>
        IKOT EKPENE · AKWA IBOM
      </p>
    </motion.div>
  );
}