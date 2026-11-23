import type { CSSProperties } from "react";
import { m } from "motion/react";
import { RansomText } from "../components/ransom/RansomText";
import { withArrows } from "../components/ui/Arrow";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Sprite } from "../components/ui/Sprite";
import { metrics, missions } from "../content/experience";
import type { Mission } from "../content/types";
import { sprite } from "../lib/sprites";

function Points({ points }: { points: string[] }) {
  return (
    <ul className="measure space-y-2.5">
      {points.map((p) => (
        <li key={p} className="flex gap-3 leading-relaxed text-paper/85">
          <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rotate-45 bg-red" />
          <span>{withArrows(p)}</span>
        </li>
      ))}
    </ul>
  );
}

function MissionCard({ mission, index }: { mission: Mission; index: number }) {
  return (
    <m.article
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className="relative md:pl-28"
    >
      {/* penanda timeline */}
      <div className="absolute top-2 left-0 hidden md:block">
        <span className="slant grid h-16 w-20 place-items-center bg-red font-display text-3xl text-paper">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div
        // panel "stack" punya tumpukan emas tebal di kanan-bawah: beri ruang lebih
        className={`mission-panel relative px-7 py-10 sm:px-12 lg:pt-16 lg:pr-20 ${
          index % 2 ? "lg:pb-14" : "lg:pb-24"
        }`}
        style={
          {
            "--panel": `url(${sprite(index % 2 ? "panel-black" : "panel-stack")})`,
          } as CSSProperties
        }
      >
        <Sprite
          name={mission.current ? "mission" : "clear"}
          alt={mission.current ? "Mission in progress" : "Mission clear"}
          className="absolute -top-8 right-4 w-32 rotate-6 shadow-[4px_4px_0_var(--color-ink)] sm:w-40"
        />

        {/* desktop: dua kolom. Kiri = identitas misi (menempel saat di-scroll),
            kanan = fase & bullet. Lebar kartu terisi tanpa membuat baris kepanjangan. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <header className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 pr-28 font-display tracking-[0.2em] text-gold uppercase sm:pr-44 lg:pr-0">
              {mission.period}
            </p>
            <h3 className="pr-28 font-display text-3xl leading-tight tracking-wide uppercase sm:pr-44 sm:text-4xl lg:pr-0">
              {mission.company}
            </h3>
            <p className="mt-1 mb-5 font-semibold text-paper/70">
              {mission.role} · {mission.location}
            </p>
            {mission.intro && (
              <p className="measure mb-6 text-paper/80 italic lg:mb-0">{mission.intro}</p>
            )}
          </header>

          <div className="lg:pt-10">
            {mission.phases?.map((ph) => (
              <div key={ph.title} className="mb-7 last:mb-0">
                <h4 className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="slant-sm bg-paper px-3 py-0.5 font-display tracking-wide text-ink uppercase">
                    {ph.title}
                  </span>
                  <span className="text-sm text-paper/60">{ph.period}</span>
                </h4>
                {ph.intro && <p className="measure mb-3 text-sm text-paper/60">{ph.intro}</p>}
                <Points points={ph.points} />
              </div>
            ))}
            {mission.points && <Points points={mission.points} />}
          </div>
        </div>
      </div>
    </m.article>
  );
}

export function Experience() {
  return (
    <section
      id="missions"
      aria-labelledby="missions-title"
      className="relative overflow-x-clip bg-ink px-5 py-24"
    >
      {/* overflow-x-clip, bukan overflow-hidden: hidden membuat section jadi
          kontainer scroll sehingga kolom kiri kartu misi tidak bisa sticky */}
      <Sprite
        name="shards"
        className="pointer-events-none absolute top-[44rem] -right-28 hidden w-72 opacity-60 xl:block"
      />
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="02" kicker="Experience" title="MISSION LOG" id="missions-title" />

        {/* critical hits */}
        <div className="mb-20">
          <div className="mb-6 flex items-center gap-4">
            <Sprite name="critical" alt="Critical" className="w-44 -rotate-3" />
            <span className="font-display tracking-[0.25em] text-paper/70 uppercase">
              hits landed
            </span>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((mt, i) => (
              <m.li
                key={mt.label}
                initial={{ scale: 0.4, rotate: i % 2 ? 10 : -10, opacity: 0 }}
                whileInView={{ scale: 1, rotate: i % 2 ? 1.5 : -1.5, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 16, delay: i * 0.08 }}
                className="ds-red"
              >
                <div className="card-cut h-full bg-paper p-6 text-ink">
                  <p className="font-display text-6xl leading-none text-red">
                    {withArrows(mt.value)}
                  </p>
                  <p className="mt-2 font-display text-xl tracking-wide uppercase">{mt.label}</p>
                  <p className="mt-1 text-sm text-ink/70">{withArrows(mt.detail)}</p>
                </div>
              </m.li>
            ))}
          </ul>
        </div>

        <div className="relative space-y-16">
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-10 hidden w-1 bg-red/60 md:block"
          />
          {missions.map((mi, i) => (
            <MissionCard key={mi.id} mission={mi} index={i} />
          ))}
        </div>

        <p className="mt-16 text-center">
          <RansomText text="MORE MISSIONS SOON" tone="dark" className="text-2xl" animate={false} />
        </p>
      </div>
    </section>
  );
}
