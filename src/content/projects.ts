import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "e-bengkel",
    arcana: {
      card: "chariot",
      label: "VII · The Chariot",
      meaning: "Control and direction: a wizard that drives a diagnosis to its conclusion.",
    },
    name: "E-Bengkel",
    tagline: "Automotive expert system",
    status: "live",
    stack: ["Next.js 14", "TypeScript", "Tailwind", "Zustand", "Framer Motion", "Recharts"],
    liveUrl: "https://ebengkel.vercel.app/",
    overview:
      "An academic expert system rebuilt from scratch. It diagnoses vehicle problems with the Certainty Factor method across 13 IF-THEN rules.",
    features: [
      "4-step consultation wizard",
      "Certainty Factor gauge chart",
      "Knowledge base viewer",
      "Consultation history with export",
    ],
  },
  {
    slug: "kaether",
    arcana: {
      card: "sun",
      label: "XIX · The Sun",
      meaning: "Clarity and warmth: the forecast, plain and bright, even offline.",
    },
    name: "Kaether",
    tagline: "Weather dashboard",
    status: "live",
    stack: [
      "Nuxt 4",
      "Bun",
      "TypeScript",
      "Tailwind",
      "Pinia",
      "TanStack Query",
      "Leaflet",
      "ECharts",
      "PWA",
    ],
    liveUrl: "https://kaether.vercel.app/",
    overview:
      "A full-featured weather dashboard structured with Atomic Design and the composables pattern, deployed as a static site.",
    features: [
      "Hourly and 7-day forecast",
      "Interactive map",
      "Air quality index (AQI)",
      "Animated backdrops",
      "Offline support as a PWA",
    ],
  },
  {
    slug: "linkdung",
    arcana: {
      card: "magician",
      label: "I · The Magician",
      meaning: "Turning a handful of links into a page that feels like yours.",
    },
    name: "Linkdung",
    tagline: "Link-in-bio platform",
    status: "in-development",
    stack: [
      "Nuxt 4",
      "TypeScript",
      "Tailwind",
      "Pinia",
      "TanStack Query",
      "Apollo GraphQL",
      "ECharts",
    ],
    liveUrl: "https://linkdung-app-seven.vercel.app/",
    overview:
      "A Linktree alternative with a cartoon/comic design aesthetic. I'm building the full frontend and the SSR layer.",
    features: [
      "OAuth sign-in",
      "Drag & drop link management",
      "Analytics dashboard",
      "Live theme customization",
    ],
  },
];

export function getProject(slug: string | undefined) {
  return projects.find((p) => p.slug === slug);
}
