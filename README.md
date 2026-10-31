# Williams Uwana Udeme | Portfolio

A personal portfolio for Williams Uwana Udeme, a Front-End Engineer who builds fast, accessible and polished web experiences with React, Next.js and TypeScript.

**Live site:** [my-portfolio-seven-beta-39.vercel.app](https://my-portfolio-seven-beta-39.vercel.app)

<!-- Add a screenshot or GIF of the site here, for example:
![Portfolio preview](public/preview.png)
-->

## What's inside

- **Home:** an introduction with a link to download my resume.
- **About:** who I am and how I like to build.
- **Skills:** the tools and technologies I work with.
- **Experience:** my work as a Front-End Engineer at Wazobia Technologies.
- **Projects:** 9 selected projects with screenshots, tech stacks and links to the live sites.
- **Contact:** email, phone and social links.
- Smooth animation and interactive 3D visuals.
- Responsive layout for phones, tablets and desktops.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, drei, postprocessing |
| Animation | GSAP, Framer Motion |
| State | Zustand |
| Icons | react-icons |
| Hosting | Vercel |

## Project structure

```
app/         Routes, layout and global styles
components/  UI sections and the 3D scene
lib/         Shared data and helpers
public/      Static assets (images, resume)
store/       Zustand state
```

## Getting started

You need [Node.js](https://nodejs.org) 20 or later.

```bash
# 1. Clone the repository
git clone https://github.com/bright-web007/My-Portfolio.git

# 2. Move into the project
cd My-Portfolio

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run start` | Runs the production build |
| `npm run lint` | Checks the code with ESLint |

### Testing on your phone

If you open the dev server on another device on your network, Next.js blocks the request by default. Add your computer's address to `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["YOUR-LOCAL-IP"], // for example "192.168.1.23"
};

export default nextConfig;
```

Restart the server, then open `http://YOUR-LOCAL-IP:3000` on your phone.

## Deployment

The site is deployed on [Vercel](https://vercel.com). Every push to the `main` branch triggers a new deployment.

## Contact

- **Email:** brightwilliams22222@gmail.com
- **GitHub:** [bright-web007](https://github.com/bright-web007)
- **LinkedIn:** [bright-williams](https://www.linkedin.com/in/bright-williams-16407238a/)

If you like the project, a star on the repository is always appreciated. ⭐