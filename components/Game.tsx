"use client";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import Landing from "./Landing";
import SkillsView from "./SkillsView";
import ProjectsPage from "./ProjectsPage";
import ContactPage from "./ContactPage";
import PageTransition from "./PageTransition";
import Cursor from "./Cursor";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Game() {
  const section = useGame((s) => s.section);
  const sceneActive = section === "home" || section === "skills";
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Scene active={sceneActive} />
      <Cursor />
      <AnimatePresence mode="wait">
        {section === "home" && <Landing key="home" />}
        {section === "skills" && <SkillsView key="skills" />}
        {section === "projects" && <ProjectsPage key="projects" />}
        {section === "contact" && <ContactPage key="contact" />}
      </AnimatePresence>
      <PageTransition pageKey={section} />
    </main>
  );
}