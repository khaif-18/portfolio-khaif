import type { Profile } from "./types";

export const profile: Profile = {
  name: "Muhammad Khalifah Erian",
  shortName: "Khalifah",
  role: "Frontend Developer",
  location: "South Jakarta, Indonesia",
  email: "khalifaherian@gmail.com",
  summary: [
    "Frontend Developer with 3+ years of experience building React applications for telecom and enterprise clients.",
    "I currently maintain a 100+ page network performance dashboard for a national mobile operator, where I drove the migration from Create React App to Vite and the upgrade to React 18.",
    "Strong with data-heavy interfaces, charting, and geospatial maps, backed by hands-on backend experience in Node.js, FastAPI, and SQL Server that makes working with API teams straightforward.",
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/khalifah-erian" },
    { label: "GitHub", href: "https://github.com/khaif-18" },
  ],
  cvUrl: "/cv.pdf",
  facts: [
    { label: "Based in", value: "South Jakarta" },
    { label: "Now at", value: "Huawei Tech Investment" },
    { label: "Focus", value: "React · TypeScript · Data viz" },
    { label: "Degree", value: "B.Sc. Computer Science, GPA 3.56" },
  ],
};
