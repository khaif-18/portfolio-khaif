import type { SideQuest, SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "SQL (T-SQL)"],
  },
  {
    label: "Frontend",
    items: [
      "React",
      "Next.js",
      "Vite",
      "Vue",
      "Nuxt",
      "Redux",
      "Zustand",
      "Pinia",
      "TanStack Query",
      "Tailwind CSS",
      "Material UI",
      "Chakra UI",
      "Mantine UI",
      "Ant Design",
      "Framer Motion",
    ],
  },
  {
    label: "Data viz & maps",
    items: [
      "Highcharts",
      "Apache ECharts",
      "Recharts",
      "React Flow",
      "Leaflet",
      "Google Maps API",
      "MapTiler",
    ],
  },
  { label: "Testing & quality", items: ["Vitest", "ESLint", "Prettier"] },
  {
    label: "Backend",
    items: ["Node.js", "Express", "Hono", "Bun", "FastAPI", "Flask", "PHP Lumen", "GraphQL"],
  },
  {
    label: "Database",
    items: ["SQL Server", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLAlchemy"],
  },
  { label: "DevOps & tools", items: ["Docker", "GitLab CI", "Git", "GitHub", "pm2", "Postman"] },
];

export const sideQuests: SideQuest[] = [
  {
    title: "B.Sc. Computer Science",
    place: "Sriwijaya University · Palembang",
    period: "2019 – 2023",
    detail: "GPA 3.56 / 4.00",
  },
  {
    title: "Programming Mentor",
    place: "Informatics Student Association",
    period: "Sep 2020",
    detail: "Taught programming fundamentals in Java to 20 students.",
  },
  {
    title: "Technical Jury",
    place: "Android App Development Competition",
    period: "Oct 2021",
    detail: "Evaluated participants' Android apps under lecturer supervision.",
  },
  {
    title: "Languages",
    place: "English · Indonesian",
    period: "",
    detail: "Professional working proficiency · Native",
  },
];
