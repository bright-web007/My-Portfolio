"use client";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import StartScreen from "./StartScreen";
import Loader from "./Loader";
import Landing from "./Landing";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Game() {
  const phase = useGame((s) => s.phase);
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Scene />
      <AnimatePresence mode="wait">
        {phase === "title" && <StartScreen key="title" />}
        {phase === "loading" && <Loader key="loading" />}
      </AnimatePresence>
      {phase === "playing" && <Landing />}
    </main>
  );
}