"use client";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import StartScreen from "./StartScreen";
import Loader from "./Loader";
import Landing from "./Landing";
import SkillsView from "./SkillsView";
import Cursor from "./Cursor";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Game() {
  const phase = useGame((s) => s.phase);
  const section = useGame((s) => s.section);
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Scene />
      <Cursor />
      <AnimatePresence mode="wait">
        {phase === "title" && <StartScreen key="title" />}
        {phase === "loading" && <Loader key="loading" />}
      </AnimatePresence>
      {phase === "playing" &&
        (section === "home" ? <Landing /> : <SkillsView />)}
    </main>
  );
}