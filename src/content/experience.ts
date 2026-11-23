import type { Metric, Mission } from "./types";

export const metrics: Metric[] = [
  { value: "−35%", label: "JS bundle", detail: "3.97 MB → 2.58 MB gzip after CRA → Vite" },
  { value: "−70%", label: "Largest chunk", detail: "1.5 MB vendor chunk split into page chunks" },
  { value: "87→19", label: "Lint warnings", detail: "During the React 16 → 18 upgrade" },
  { value: "100+", label: "Pages", detail: "Network KPI dashboard, 4G/5G to core" },
];

export const missions: Mission[] = [
  {
    id: "huawei",
    role: "Full Stack Developer · Database Engineer",
    company: "Huawei Tech Investment",
    location: "South Jakarta · On site",
    period: "Feb 2024 – Present",
    current: true,
    intro:
      "Two consecutive phases within the same client environment: first on Huawei's internal OWS platform, then modernizing the client's network performance dashboard.",
    phases: [
      {
        title: "Phase 2 · External stack development",
        period: "Jan 2025 – Present",
        points: [
          "Maintain and modernize a network performance dashboard for a national mobile operator (100+ pages, React) covering 4G/5G, FWA, FTTH, transport, and core network KPIs.",
          "Migrated the build from Create React App to Vite and cut total JavaScript by 35% (3.97 MB → 2.58 MB gzip).",
          "Split a 1.5 MB gzip vendor chunk (FusionCharts, Lottie, html2canvas) into page-level chunks; the largest remaining chunk dropped 70% to 464 KB and loads only on the topology page.",
          "Upgraded React 16 → 18 and key dependencies incrementally on a legacy MUI v4 codebase with no downtime, 0 npm audit vulnerabilities, and lint warnings cut from 87 to 19.",
          "Replaced FusionCharts with Highcharts using reusable chart components on a light/dark token system, plus topology diagrams (React Flow, ELK) and maps (Leaflet).",
          "Consolidated the API layer into one HMAC-signed client with JWT auth and axios interceptors.",
        ],
      },
      {
        title: "Phase 1 · Full stack on Huawei OWS",
        period: "Feb 2024 – Jan 2025",
        intro:
          "OWS is Huawei's cloud-based, microservices-driven O&M platform for network monitoring, ticketing, and alarm management.",
        points: [
          "Built web features and workflow scripting for ticketing, alarm processing, and network monitoring.",
          "Kept data-heavy pages responsive with partial loading and pagination for large datasets.",
          "Customized Material UI components and built dynamic forms and data grids.",
        ],
      },
    ],
  },
  {
    id: "bpkp",
    role: "Full Stack Developer",
    company: "Badan Pemeriksa Keuangan dan Pembangunan (BPKP)",
    location: "On site",
    period: "Mar 2023 – Jan 2024",
    current: false,
    points: [
      "Built the frontend with Next.js, Material UI, and Framer Motion, including reusable UI components and page animations.",
      "Developed the backend API with PHP Lumen and handled frontend–backend integration end to end.",
    ],
  },
  {
    id: "studycle",
    role: "Software Developer / PM Intern",
    company: "PT Studycle Education & Technology",
    location: "Remote",
    period: "Aug 2021 – Jan 2022",
    current: false,
    points: [
      "Coordinated a cross-functional team as PM intern, managing timelines to ship web features on schedule.",
      "Developed theme components with React, Tailwind CSS, and PostCSS with a focus on responsive design.",
      "Worked in Docker-based environments and collaborated through Bitbucket.",
    ],
  },
];
