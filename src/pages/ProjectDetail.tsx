import { m } from "motion/react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { RansomText } from "../components/ransom/RansomText";
import { WipeLink } from "../components/transition/WipeLink";
import { Arrow } from "../components/ui/Arrow";
import { Button } from "../components/ui/Button";
import { Sprite, SpriteNumber } from "../components/ui/Sprite";
import { Tag } from "../components/ui/Tag";
import { TarotCard } from "../components/ui/TarotCard";
import { getProject, projects } from "../content/projects";
import { NotFound } from "./NotFound";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProject(slug);
  const index = projects.findIndex((p) => p.slug === slug);

  useEffect(() => {
    if (project) document.title = `${project.name} · Khalifah Erian`;
    return () => {
      document.title = "Muhammad Khalifah Erian · Frontend Developer";
    };
  }, [project]);

  if (!project) return <NotFound />;
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="relative overflow-hidden bg-ink">
      {/* kepala */}
      <header className="relative overflow-hidden bg-red px-5 pt-32 pb-20">
        <div className="halftone pointer-events-none absolute inset-0 text-ink/20" />
        {/* elemen LCP halaman ini (bidang terbesar di layar pertama) */}
        <Sprite
          name="splash"
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute -right-20 -bottom-10 w-[36rem]"
        />
        <m.div
          initial={{ rotate: 20, y: 60, opacity: 0 }}
          animate={{ rotate: 6, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
          className="absolute top-28 right-[8%] z-10 hidden md:block"
        >
          <TarotCard arcana={project.arcana} mode="front" sizes="12rem" className="w-40 lg:w-48" />
        </m.div>
        <div className="relative mx-auto max-w-5xl">
          <WipeLink
            to="/#targets"
            className="group mb-6 inline-block py-2.5 font-display tracking-[0.25em] uppercase select-none hover:underline active:text-red-bright"
          >
            <Arrow
              dir="left"
              className="mr-2 transition-transform group-hover:-translate-x-1 group-active:-translate-x-2"
            />
            All targets
          </WipeLink>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className="slant bg-ink px-4 py-2">
              <SpriteNumber value={String(index + 1).padStart(2, "0")} className="h-14" />
            </span>
            <Tag tone={project.status === "live" ? "dark" : "light"}>
              {project.status === "live" ? "Live" : "In development"}
            </Tag>
          </div>
          <RansomText
            as="h1"
            text={project.name.toUpperCase()}
            seed={index + 5}
            className="block text-6xl sm:text-8xl"
          />
          <p className="mt-4 font-display text-2xl tracking-wide uppercase sm:text-3xl">
            {project.tagline}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-14 px-5 py-20 md:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-3xl tracking-wide text-red-bright uppercase">
            The job
          </h2>
          <p className="mb-12 text-lg leading-relaxed text-paper/85">{project.overview}</p>

          <h2 className="mb-5 font-display text-3xl tracking-wide text-red-bright uppercase">
            Features
          </h2>
          <ul className="space-y-3">
            {project.features.map((f, i) => (
              <m.li
                key={f}
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="ds-red"
              >
                <div
                  className={`${i % 2 ? "card-cut-alt" : "card-cut"} bg-paper px-5 py-3 font-semibold text-ink`}
                >
                  {f}
                </div>
              </m.li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8">
          <div className="border-l-4 border-gold pl-4">
            <h2 className="mb-1 font-display text-xl tracking-[0.2em] text-gold uppercase">
              Arcana
            </h2>
            <p className="font-display text-2xl tracking-wide uppercase">{project.arcana.label}</p>
            <p className="mt-1 text-paper/75">{project.arcana.meaning}</p>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl tracking-[0.2em] text-gold uppercase">
              Stack
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s}>
                  <Tag tone="light" className="normal-case">
                    {s}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-4">
            {project.liveUrl && (
              <Button href={project.liveUrl} target="_blank" rel="noreferrer">
                Visit live site <Arrow dir="up-right" />
              </Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} target="_blank" rel="noreferrer" variant="light">
                Source code <Arrow dir="up-right" />
              </Button>
            )}
          </div>
          <Sprite name="sparkles-gold" className="w-40" />
        </aside>
      </div>

      <footer className="border-t-4 border-red px-5 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6">
          <span className="font-display tracking-[0.3em] text-paper/60 uppercase">Next target</span>
          <WipeLink
            to={`/projects/${next.slug}`}
            className="group flex items-center gap-3 select-none transition-[rotate,scale] hover:-rotate-2 active:scale-95 active:rotate-0"
          >
            <RansomText
              text={next.name.toUpperCase()}
              tone="dark"
              animate={false}
              className="text-4xl"
            />
            {/* panah di kartu sendiri, digambar di tengah kotak (bukan glyph ransom) */}
            <span className="grid h-12 w-14 rotate-3 place-items-center bg-paper text-3xl text-ink ring-2 ring-ink transition-[translate,background-color,color] group-hover:translate-x-1 group-active:translate-x-3 group-active:bg-red group-active:text-paper">
              <Arrow className="block" />
            </span>
          </WipeLink>
        </div>
      </footer>
    </article>
  );
}
