
// @ts-nocheck
// ── FILE 3 / 10 : src/config/projects.js ─────────────────────────

export const PROJECTS = [
  {
    id: "p1",
    status: "COMPLETED",
    title: "Responsive 3D Portfolio",
    category: "Creative Dev · 3D Web",
    description:
      "Multi-state physics-driven portfolio with Gravity Well, Fluid Motion, and Deconstruct modes — each with unique interaction physics and visual language.",
    tech: ["React", "Three.js", "Framer Motion", "R3F", "Cannon"],
    color: "#ff6b35",
    mass: 1.62,
    link: "https://portfolio--abhayraj-ar.replit.app/",
    layers: {
      code:   "React · Three.js · Framer Motion · @react-three/cannon · Zustand",
      design: "Multi-state spatial UI · physics camera transitions · glassmorphic cards",
      logic:  "Multi-state physics engine integrating spatial navigation with performance optimization.",
      result: "COMPLETED · Live at portfolio--abhayraj-ar.replit.app",
    },
  },
  {
    id: "p2",
    status: "COMPLETED",
    title: "Dynamic Weather Dashboard",
    category: "Frontend · API Integration",
    description:
      "Real-time weather dashboard with async data fetching, condition-reactive visuals, and smooth DOM-driven transitions per weather state.",
    tech: ["JavaScript", "OpenWeather API", "CSS3", "Async/Await"],
    color: "#00d4ff",
    mass: 1.26,
    link: null,
    layers: {
      code:   "Vanilla JS · OpenWeather REST API · CSS3 animations · async/await fetch",
      design: "Weather-reactive icons · condition-based gradients · responsive grid layout",
      logic:  "Asynchronous data fetching with real-time DOM manipulation and conditional rendering.",
      result: "COMPLETED · Link coming soon",
    },
  },
  {
    id: "p3",
    status: "COMPLETED",
    title: "Password Strength Analyzer",
    category: "Security · Python CLI",
    description:
      "Python CLI tool analysing password entropy via heuristic regex, calculating brute-force resistance and returning colour-coded strength tiers.",
    tech: ["Python", "Regex", "hashlib", "Entropy Calc"],
    color: "#a8ff78",
    mass: 1.08,
    link: null,
    layers: {
      code:   "Python 3 · re (Regex) · hashlib · math.log2 entropy · argparse CLI",
      design: "Terminal-first UX · progressive strength feedback · colour-coded tiers",
      logic:  "Heuristic analysis of string patterns to calculate entropy and brute-force resistance.",
      result: "COMPLETED · Link coming soon",
    },
  },
  {
    id: "p4",
    status: "IN_PROGRESS",
    title: "Combat-Capable Fitness Tracker",
    category: "Mobile · Health Tech",
    description:
      "React Native app tracking generalist-athlete benchmarks — strength, agility, combat endurance — backed by Firebase and a custom Node.js scoring algorithm.",
    tech: ["React Native", "Firebase", "Node.js", "Expo"],
    color: "#ff4da6",
    mass: 1.44,
    link: null,
    layers: {
      code:   "React Native · Expo · Firebase Realtime DB · Node.js scoring API",
      design: "Mobile-first athlete dashboard · generalist benchmark arcs · progress rings",
      logic:  "Algorithm to track generalist fitness benchmarks beyond simple hypertrophy.",
      result: "IN PROGRESS · Under active development",
    },
  },
  {
    id: "p5",
    status: "FUTURE",
    title: "Next-Gen E-Commerce Engine",
    category: "Full-Stack · Commerce",
    description:
      "Scalable MERN-stack e-commerce platform with Stripe payments, Redux state, and high-concurrency microservices architecture for real-world load.",
    tech: ["MongoDB", "Express", "React", "Node.js", "Stripe", "Redux"],
    color: "#ffe066",
    mass: 1.8,
    link: null,
    layers: {
      code:   "MERN Stack · Stripe API · Redux Toolkit · Docker · REST microservices",
      design: "High-concurrency storefront · real-time inventory UI · frictionless checkout",
      logic:  "Scalable microservices architecture for high-concurrency transaction handling.",
      result: "PLANNED · Architecture in design phase",
    },
  },
];
