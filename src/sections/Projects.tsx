import { m } from "motion/react";
import { useState, type MouseEvent } from "react";
import { useWipe } from "../components/transition/useWipe";
import { RansomText } from "../components/ransom/RansomText";
import { Arrow } from "../components/ui/Arrow";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Sprite, SpriteNumber } from "../components/ui/Sprite";
import { Tag } from "../components/ui/Tag";
import { TarotCard } from "../components/ui/TarotCard";
import { projects } from "../content/projects";
import type { Project } from "../content/types";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tilt = [-2, 1.5, -1][index % 3];
  // hover/fokus di mana pun pada kartu project = kartu tarot "ditembak"
  const [shot, setShot] = useState(false);
  const go = useWipe();
  const to = `/projects/${project.slug}`;

  // seluruh kartu bisa diklik (kartunya terangkat saat hover, jadi harus bisa ditekan).
  // Link "Case file" tetap jadi target keyboard & pembaca layar; klik di link/tombol
  // lain diurus elemen itu sendiri, dan klik saat sedang memilih teks diabaikan.
  const openCase = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if ((e.target as Element).closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(to, "_blank", "noopener");
      return;
    }
    void go(to);
  };

  return (
    <m.article
      initial={{ y: 80, rotate: tilt * 4, opacity: 0 }}
      whileInView={{ y: 0, rotate: tilt, opacity: 1 }}
      whileHover={{ rotate: 0, y: -8 }}
      whileTap={{ scale: 0.98, y: -2 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      onHoverStart={() => setShot(true)}
      onHoverEnd={() => setShot(false)}
      onFocus={() => setShot(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setShot(false);
      }}
      onClick={openCase}
      // Motion memberi tabindex=0 pada elemen ber-whileTap. Kartu ini cuma pintasan
      // mouse/sentuh; untuk keyboard & pembaca layar sudah ada link "Case file".
      tabIndex={-1}
      data-cursor="target"
      className="group relative"
    >
      <TarotCard
        arcana={project.arcana}
        mode="reveal"
        shot={shot}
        className="absolute -top-20 -right-3 z-10 w-20 rotate-[8deg] transition-[rotate,translate] duration-300 group-hover:-translate-y-2 group-hover:rotate-[-4deg] sm:w-24"
      />
      <div className="ds-ink h-full transition-[filter] group-hover:[filter:drop-shadow(14px_14px_0_var(--color-ink))]">
        <div className="card-cut flex h-full flex-col bg-paper p-7 text-ink">
          <div className="mb-5 flex items-center gap-3 pr-20">
            <span className="slant bg-ink px-4 py-2">
              <SpriteNumber value={String(index + 1).padStart(2, "0")} className="h-12" />
            </span>
            {project.status === "in-development" ? (
              <Tag tone="red">In development</Tag>
            ) : (
              <Tag tone="dark">Live</Tag>
            )}
          </div>

          <RansomText
            as="h3"
            text={project.name.toUpperCase()}
            tone="light"
            className="mb-2 text-4xl"
          />
          <p className="mb-4 font-display text-lg tracking-wide text-red uppercase">
            {project.tagline}
          </p>
          <p className="mb-5 flex-1 leading-relaxed text-ink/80">{project.overview}</p>

          <ul className="mb-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.stack.map((s) => (
              <li key={s}>
                <Tag tone="dark" className="normal-case">
                  {s}
                </Tag>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button to={`/projects/${project.slug}`} variant="red">
              Case file <Arrow />
            </Button>
            {project.liveUrl && (
              <Button href={project.liveUrl} target="_blank" rel="noreferrer" variant="dark">
                Live <Arrow dir="up-right" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </m.article>
  );
}

export function Projects() {
  return (
    <section
      id="targets"
      aria-labelledby="targets-title"
      className="relative overflow-hidden bg-red px-5 py-24 text-paper"
    >
      <div className="halftone pointer-events-none absolute inset-0 text-ink/15" />
      <Sprite
        name="splash"
        className="pointer-events-none absolute -top-10 -left-20 w-[40rem] opacity-90"
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          index="03"
          kicker="Side projects"
          title="TARGETS"
          id="targets-title"
          tone="dark"
        >
          <Sprite
            name="new-skill"
            className="absolute -top-6 right-0 hidden w-48 rotate-6 sm:block"
          />
        </SectionHeading>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
