// export type Group = "Frontend" | "Backend" | "Tools";

// export type Skill = {
//   id: string;
//   name: string;
//   group: Group;
//   level: number; // 0-100, placeholder
//   blurb: string;
//   x: number; // position on the weave
//   y: number;
// };

// export const GROUP_COLOR: Record<Group, string> = {
//   Frontend: "#FFB84A",
//   Backend: "#2EE6A6",
//   Tools: "#FF5A36",
// };

// // Placeholders: replace names, levels and blurbs with your real ones
// export const SKILLS: Skill[] = [
//   { id: "html", name: "HTML", group: "Frontend", level: 90, blurb: "Semantic, accessible markup that search engines and screen readers understand.", x: -4.5, y: 2.5 },
//   { id: "css", name: "CSS", group: "Frontend", level: 85, blurb: "Responsive layouts, animation and design systems that hold up on any screen.", x: -2.5, y: 4 },
//   { id: "javascript", name: "JavaScript", group: "Frontend", level: 80, blurb: "The language behind every interactive thing I build.", x: 0, y: 1.5 },
//   { id: "typescript", name: "TypeScript", group: "Frontend", level: 70, blurb: "Typed code that catches bugs before users do.", x: 2.5, y: 3.5 },
//   { id: "react", name: "React", group: "Frontend", level: 80, blurb: "Component-based interfaces that stay easy to change.", x: 4, y: 0.5 },
//   { id: "nextjs", name: "Next.js", group: "Frontend", level: 75, blurb: "Fast, SEO-friendly apps with routing and server rendering built in.", x: 1.5, y: -1.5 },
//   { id: "tailwind", name: "Tailwind", group: "Frontend", level: 85, blurb: "Quick, consistent styling without fighting CSS files.", x: -3.5, y: -0.5 },
//   { id: "node", name: "Node.js", group: "Backend", level: 65, blurb: "APIs and server logic in the same language as the frontend.", x: -1, y: -3.5 },
//   { id: "git", name: "Git", group: "Tools", level: 75, blurb: "Clean history, branches and teamwork that doesn't break things.", x: 3.5, y: -3.5 },
// ];




export type Skill = {
    id: string;
    name: string;
    level: number; // 0-100, placeholder
    blurb: string;
};

export type Category = {
    id: string;
    name: string;
    color: string;
    blurb: string;
    orbit: number; // distance from the sun
    speed: number; // radians per second
    phase: number; // starting angle
    skills: Skill[];
};

// Placeholders: replace names, levels and blurbs with your real ones
export const CATEGORIES: Category[] = [
    {
        id: "frontend",
        name: "Frontend",
        color: "#FFB84A",
        blurb: "Everything a visitor sees and touches.",
        orbit: 2.2,
        speed: 0.22,
        phase: 0.6,
        skills: [
            { id: "html", name: "HTML", level: 90, blurb: "Semantic, accessible markup that search engines and screen readers understand." },
            { id: "css", name: "CSS", level: 85, blurb: "Responsive layouts, animation and design systems that hold up on any screen." },
            { id: "javascript", name: "JavaScript", level: 80, blurb: "The language behind every interactive thing I build." },
            { id: "typescript", name: "TypeScript", level: 70, blurb: "Typed code that catches bugs before users do." },
            { id: "react", name: "React", level: 80, blurb: "Component-based interfaces that stay easy to change." },
            { id: "nextjs", name: "Next.js", level: 75, blurb: "Fast, SEO-friendly apps with routing and server rendering built in." },
            { id: "tailwind", name: "Tailwind", level: 85, blurb: "Quick, consistent styling without fighting CSS files." },
        ],
    },
    {
        id: "backend",
        name: "Backend",
        color: "#2EE6A6",
        blurb: "The logic and data behind the screen.",
        orbit: 3.2,
        speed: 0.16,
        phase: 2.2,
        skills: [
            { id: "node", name: "Node.js", level: 65, blurb: "Server logic in the same language as the frontend." },
            { id: "api", name: "REST APIs", level: 65, blurb: "Clean endpoints that frontends can rely on." },
            { id: "database", name: "Databases", level: 60, blurb: "Storing and querying data without losing it." },
        ],
    },
    {
        id: "tools",
        name: "Tools",
        color: "#FF5A36",
        blurb: "How I ship work without breaking things.",
        orbit: 4.1,
        speed: 0.12,
        phase: 3.9,
        skills: [
            { id: "git", name: "Git", level: 75, blurb: "Clean history, branches and teamwork that doesn't break things." },
            { id: "github", name: "GitHub", level: 75, blurb: "Pull requests, reviews and project tracking." },
            { id: "deploy", name: "Deployment", level: 65, blurb: "Getting projects live on Vercel and keeping them fast." },
        ],
    },
    {
        id: "design",
        name: "Design",
        color: "#8FA8FF",
        blurb: "Making it look right and work for everyone.",
        orbit: 5.0,
        speed: 0.09,
        phase: 5.3,
        skills: [
            { id: "figma", name: "Figma", level: 60, blurb: "Turning ideas into layouts before writing code." },
            { id: "responsive", name: "Responsive", level: 85, blurb: "One site that feels right on phones, tablets and desktops." },
            { id: "a11y", name: "Accessibility", level: 70, blurb: "Sites everyone can use, including keyboard and screen reader users." },
        ],
    },
];

export const ALL_SKILLS = CATEGORIES.flatMap((c) => c.skills);

// 16 skills + 4 thread-complete + master weaver + 2 landing achievements
export const TOTAL_ACHIEVEMENTS = 23;