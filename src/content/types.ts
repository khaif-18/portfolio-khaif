export interface Link {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  location: string;
  email: string;
  summary: string[];
  links: Link[];
  cvUrl: string;
  facts: { label: string; value: string }[];
}

export interface Phase {
  title: string;
  period: string;
  intro?: string;
  points: string[];
}

export interface Mission {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  intro?: string;
  phases?: Phase[];
  points?: string[];
}

export interface Metric {
  value: string;
  label: string;
  detail: string;
}

export type ArcanaCard = "fool" | "magician" | "chariot" | "star" | "sun";

export interface Arcana {
  card: ArcanaCard;
  /** contoh: "VII · The Chariot" */
  label: string;
  /** kenapa kartu ini cocok untuk project-nya, satu kalimat */
  meaning: string;
}

export interface Project {
  slug: string;
  arcana: Arcana;
  name: string;
  tagline: string;
  status: "live" | "in-development";
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  overview: string;
  features: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface SideQuest {
  title: string;
  place: string;
  period: string;
  detail: string;
}
