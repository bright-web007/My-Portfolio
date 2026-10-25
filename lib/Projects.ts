export type ProjectRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type ProjectScreenshot = { src: string | null; label: string };

export type Project = {
    id: string;
    number: string;
    name: string;
    category: string;
    description: string;
    metric: string;
    technologies: string[];
    rarity: ProjectRarity;
    problem: string;
    built: string;
    role: string;
    screenshots: [ProjectScreenshot, ProjectScreenshot, ProjectScreenshot];
    liveUrl: string | null;
    githubUrl: string;
};

const projectRarities: ProjectRarity[] = [
    "Epic",
    "Rare",
    "Epic",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
    "Rare",
    "Uncommon",
];

const projectDetails = [
    {
        id: "wazobia-technologies",
        name: "Wazobia Technologies",
        category: "Software Agency",
        description: "A lead-generation website for a software agency building products, MVPs, and dedicated engineering teams.",
        metric: "MVP TO SCALE",
        liveUrl: "https://wazobia.tech/",
        githubUrl: "https://github.com/bright-web007/wazobia-tech",
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Apollo GraphQL"],
        problem: "Startups and businesses need a clear way to understand the agency's software services and get in touch.",
        built: "A company landing page with service positioning, agency story, blog and case study sections, and conversion-focused contact paths.",
    },
    {
        id: "double-4",
        name: "Double 4",
        category: "Restaurant & Cafe",
        description: "A warm, premium digital storefront for a cafe serving coffee, brunch, homemade meals, and drinks.",
        metric: "MENU + GALLERY",
        liveUrl: "https://double-4.vercel.app/",
        githubUrl: "https://github.com/bright-web007/double-4",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Apollo GraphQL"],
        problem: "Guests need an inviting place to discover the cafe's menus, atmosphere, and ways to get in touch.",
        built: "A branded website with breakfast, brunch, and drinks pages, a food and lifestyle gallery, contact information, and a modal mobile menu.",
    },
    {
        id: "drip-london",
        name: "Drip London",
        category: "Dining & Nightlife",
        description: "A luxury-leaning restaurant and lounge website for dining, reservations, and private events.",
        metric: "DINING + EVENTS",
        liveUrl: "https://drip-london.vercel.app/",
        githubUrl: "https://github.com/bright-web007/drip-london",
        technologies: ["Next.js 15", "TypeScript", "Tailwind CSS", "Apollo Client", "Framer Motion", "Playwright"],
        problem: "Guests need to explore the venue's food and drinks and find clear paths to book a table or event.",
        built: "A promotional and booking experience with menu sections, reservations, event booking, reviews, FAQs, and structured SEO content.",
    },
    {
        id: "headline-bulletin",
        name: "Headline Bulletin",
        category: "News & Editorial",
        description: "A digital publication for browsing breaking headlines, topic sections, and individual stories.",
        metric: "SEARCH + STORIES",
        liveUrl: "https://headline-bulletin.vercel.app/",
        githubUrl: "https://github.com/bright-web007/Headline-Bulletin",
        technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"],
        problem: "Readers need to move between news topics, search for coverage, and read stories in an organized editorial layout.",
        built: "A news frontend with category and subcategory pages, article pages, search, trending stories, and policy pages.",
    },
    {
        id: "my-portfolio",
        name: "My Portfolio",
        category: "Developer Portfolio",
        description: "A game-inspired portfolio for exploring my projects, skills, and contact information.",
        metric: "INTERACTIVE PORTFOLIO",
        liveUrl: "https://my-portfolio-seven-beta-39.vercel.app/",
        githubUrl: "https://github.com/bright-web007/My-Portfolio",
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand"],
        problem: "Visitors need a memorable way to explore my work, skills, and contact information.",
        built: "A game-inspired portfolio with an interactive project inventory, skill progression, achievement feedback, page transitions, and a contact form.",
    },
    {
        id: "snap-my-fine",
        name: "Snap My Fine",
        category: "Mobility & Fintech",
        description: "A ticket-management app that helps London drivers understand, pay, or challenge parking fines.",
        metric: "PHOTO TO DECISION",
        liveUrl: null,
        githubUrl: "https://github.com/bright-web007/snap-my-fine",
        technologies: ["Next.js 15", "React", "TypeScript", "Tailwind CSS", "Zustand", "Redis"],
        problem: "Drivers need a simpler way to capture parking notice details, understand deadlines, and choose what to do next.",
        built: "A product experience for ticket capture, detail extraction, payment or challenge flows, saved tickets, and transaction tracking.",
    },
    {
        id: "nexus",
        name: "Nexus",
        category: "Developer Platform",
        description: "A platform for teams to organize reusable services and monitor project health in one place.",
        metric: "SERVICE HEALTH",
        liveUrl: null,
        githubUrl: "https://github.com/bright-web007/nexus",
        technologies: ["Next.js 15", "React", "TypeScript", "Tailwind CSS", "Apollo GraphQL", "Redis"],
        problem: "Teams need a shared place to manage projects, attach reusable services, and monitor their health and usage.",
        built: "A developer platform covering account flows, project and service management, health dashboards, API keys, and documentation.",
    },
    {
        id: "hovenier-frl",
        name: "Hovenier",
        category: "Local Services",
        description: "A bilingual directory helping people in Friesland find gardening services and request quotes.",
        metric: "DUTCH + ENGLISH",
        liveUrl: null,
        githubUrl: "https://github.com/bright-web007/hovenier",
        technologies: ["Next.js 16", "TypeScript", "next-intl", "Muse CMS", "Sentry", "Turnstile"],
        problem: "People need to find trusted gardeners by municipality and request a quote, in Dutch or English.",
        built: "A local directory and lead-generation website with service listings, regional SEO pages, multilingual content, and protected quote forms.",
    },
    {
        id: "sofa-cleaner",
        name: "Sofa Cleaner",
        category: "Local Services",
        description: "A UK sofa-cleaning service site focused on local discovery and quick customer contact.",
        metric: "LOCAL LEADS",
        liveUrl: null,
        githubUrl: "https://github.com/bright-web007/sofa-cleaners",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        problem: "Customers need to find local upholstery cleaners, compare services, and contact providers without a lengthy booking process.",
        built: "A service marketplace with city and service pages, pricing, how-it-works content, reviews, FAQs, and WhatsApp-first contact paths.",
    },
] satisfies Omit<Project, "number" | "rarity" | "screenshots" | "role">[];

const projectScreenshots: Partial<Record<string, Project["screenshots"]>> = {
    "wazobia-technologies": [
        { src: "/project-shots/wazobia-technologies.png", label: "Homepage" },
        { src: "/project-shots/wazobia-technologies-services.png", label: "Services" },
        { src: "/project-shots/wazobia-technologies-case-studies.png", label: "Case Studies" },
    ],
    "double-4": [
        { src: "/project-shots/double-4.png", label: "Homepage" },
        { src: "/project-shots/double-4-about.png", label: "About the cafe" },
        { src: "/project-shots/double-4-menu.png", label: "Menu" },
    ],
    "drip-london": [
        { src: "/project-shots/drip-london-world.png", label: "World of Flavors" },
        { src: "/project-shots/drip-london-private.png", label: "Private Dining" },
        { src: "/project-shots/drip-london-brunch.png", label: "Bottomless Brunch" },
    ],
    "headline-bulletin": [
        { src: "/project-shots/headline-bulletin-home.png", label: "Breaking News" },
        { src: "/project-shots/headline-bulletin-trending.png", label: "Trending News" },
        { src: "/project-shots/headline-bulletin-article.png", label: "Article Detail" },
    ],
    "my-portfolio": [
        { src: "/project-shots/my-portfolio.png", label: "Start screen" },
        { src: null, label: "[SCREENSHOT 02]" },
        { src: null, label: "[SCREENSHOT 03]" },
    ],
};

export const PROJECTS: Project[] = projectDetails.map((project, index) => {
    const number = String(index + 1).padStart(2, "0");
    const screenshots = projectScreenshots[project.id] ?? [
        { src: null, label: "[SCREENSHOT 01]" },
        { src: null, label: "[SCREENSHOT 02]" },
        { src: null, label: "[SCREENSHOT 03]" },
    ];

    return {
        ...project,
        number,
        rarity: projectRarities[index],
        role: "Built by Williams Uwana Udeme",
        screenshots,
    };
});

export const PORTFOLIO_LOCATION = "Lagos, Nigeria";

export const PORTFOLIO_CONTACT = {
    email: "brightwilliams22222@gmail.com",
    github: "https://github.com/bright-web007",
    linkedIn: "https://www.linkedin.com/in/bright-williams-16407238a/",
    whatsapp: "+234 9024553901",
    phone: "+234 8078364128",
} as const;
