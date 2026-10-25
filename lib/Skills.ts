export type Skill = {
    id: string;
    name: string;
    note?: string; // extra detail from the CV, shown small
    plain: string; // what it is, in everyday words
    benefit: string; // why it matters to the visitor
};

export type Category = {
    id: string;
    name: string; // plain-English name
    cv: string; // the group name as it appears on the CV
    color: string;
    blurb: string;
    orbit: number; // distance from the sun
    speed: number; // radians per second
    phase: number; // starting angle
    skills: Skill[];
};

export const CATEGORIES: Category[] = [
    {
        id: "core",
        name: "Core Skills",
        cv: "Core",
        color: "#FFB84A",
        blurb: "The tools I use to build everything you see and click on a website.",
        orbit: 2.2,
        speed: 0.22,
        phase: 0.6,
        skills: [
            { id: "javascript", name: "JavaScript", note: "ES6+", plain: "The language that makes a website react when you click, type or scroll.", benefit: "Your site feels alive instead of like a flat page." },
            { id: "typescript", name: "TypeScript", plain: "JavaScript with a built-in spell checker for code.", benefit: "Fewer bugs reach your visitors." },
            { id: "react", name: "React", note: "React.js", plain: "A way of building a page out of reusable pieces, like Lego bricks.", benefit: "Updates are quicker and the site stays consistent." },
            { id: "nextjs", name: "Next.js", note: "App Router", plain: "A toolkit that makes React sites load fast and show up in search.", benefit: "Pages open quickly and Google can read them." },
            { id: "html", name: "HTML5", plain: "The skeleton of every web page: headings, text, images and buttons.", benefit: "A solid structure that works everywhere and helps screen readers." },
            { id: "css", name: "CSS3", plain: "The styling: colors, fonts, spacing and layout.", benefit: "Your site looks polished and on-brand." },
            { id: "tailwind", name: "Tailwind CSS", plain: "A fast way to style pages using ready-made building blocks.", benefit: "Designs get built quickly and look consistent." },
        ],
    },
    {
        id: "data",
        name: "Data Handling",
        cv: "State & Data",
        color: "#2EE6A6",
        blurb: "How a site remembers things and talks to other systems.",
        orbit: 3.2,
        speed: 0.16,
        phase: 2.2,
        skills: [
            { id: "context", name: "React Context", plain: "A shared notice board that every part of the page can read.", benefit: "Things like who is logged in are available everywhere, without mess." },
            { id: "zustand", name: "Zustand", plain: "A small, simple memory for an app, like a notepad it checks as you use it.", benefit: "Things like a shopping cart or your progress stay in sync." },
            { id: "rest", name: "REST APIs", plain: "A standard way for a website to ask a server for information.", benefit: "Your site can show live data such as products or messages." },
            { id: "graphql", name: "GraphQL", note: "Apollo Client", plain: "A way to ask a server for exactly the information you need, nothing extra.", benefit: "Pages load faster and use less data." },
        ],
    },
    {
        id: "quality",
        name: "Quality & Testing",
        cv: "Testing & Tools",
        color: "#FF5A36",
        blurb: "How I keep work reliable and work well with other people.",
        orbit: 4.1,
        speed: 0.12,
        phase: 3.9,
        skills: [
            { id: "playwright", name: "Playwright", plain: "A robot that clicks through the site like a real visitor to check everything works.", benefit: "Problems get caught before you ever see them." },
            { id: "vitest", name: "Vitest", plain: "Automatic checks on small parts of the code.", benefit: "New changes don't quietly break things that already worked." },
            { id: "git", name: "Git & GitHub", plain: "A save history for code, so every change is tracked and a team can work together.", benefit: "Nothing gets lost, and mistakes are easy to undo." },
            { id: "responsive", name: "Responsive Design", plain: "Making one site look right on phones, tablets and computers.", benefit: "Every visitor gets a good experience on their own device." },
            { id: "agile", name: "Agile", plain: "Working in short steps with regular check-ins, not one big reveal at the end.", benefit: "You see progress early and can change direction." },
            { id: "review", name: "Code Review", plain: "Having another developer read the work before it goes live.", benefit: "A second pair of eyes catches mistakes." },
        ],
    },
    {
        id: "reach",
        name: "Web",
        cv: "Web",
        color: "#8FA8FF",
        blurb: "Helping the right people find a site, use it in their language, and enjoy it.",
        orbit: 5.0,
        speed: 0.09,
        phase: 5.3,
        skills: [
            { id: "seo", name: "SEO", plain: "Making a site easy for Google to understand and show.", benefit: "More people find you when they search." },
            { id: "i18n", name: "Internationalisation", note: "next-intl", plain: "Setting a site up to work in several languages.", benefit: "You can reach customers in their own language." },
            { id: "framer", name: "Framer Motion", plain: "A tool for smooth animations and movement.", benefit: "The site feels polished and guides the eye." },
            { id: "sentry", name: "Sentry", plain: "An alarm that reports when something breaks for a real visitor.", benefit: "Problems get fixed quickly, often before anyone complains." },
            { id: "ga4", name: "Google Analytics", note: "GA4", plain: "A tool that shows how many people visit and what they do.", benefit: "You can see what works and make smarter decisions." },
        ],
    },
];

export const ALL_SKILLS = CATEGORIES.flatMap((c) => c.skills);

// 22 skills + 4 category completions + master explorer + 2 landing achievements
export const TOTAL_ACHIEVEMENTS = 29;