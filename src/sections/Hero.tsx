import { m } from "motion/react";
import { CrowdWalk } from "../components/crowd/CrowdWalk";
import { RansomText } from "../components/ransom/RansomText";
import { withArrows } from "../components/ui/Arrow";
import { Button } from "../components/ui/Button";
import { Sprite, SpriteNumber } from "../components/ui/Sprite";
import { profile } from "../content/profile";
import { sprite } from "../lib/sprites";

const TICKER = [
  "CRA → Vite migration",
  "−35% JS bundle",
  "React 16 → 18, zero downtime",
  "100+ page KPI dashboard",
  "Highcharts · React Flow · Leaflet",
  "Node.js · FastAPI · SQL Server",
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* latar kota + overlay */}
      <img
        src={sprite("city-night")}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45 grayscale"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      <div className="absolute inset-y-0 right-0 -z-10 w-[62%] bg-red [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)] max-lg:w-full max-lg:opacity-25" />
      <div className="halftone halftone-fade absolute inset-y-0 right-0 -z-10 w-1/2 text-ink/40" />
      {/* kerumunan kota yang lewat di belakang (ikut kecepatan scroll) */}
      <CrowdWalk
        count={14}
        height="clamp(9rem, 28vh, 17rem)"
        speed={30}
        seed={5}
        className="absolute inset-x-0 bottom-12 -z-10 opacity-20"
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 pt-28 pb-16 md:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0">
          <m.p
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-block bg-paper px-4 py-1 font-display tracking-[0.25em] text-ink uppercase -skew-x-12"
          >
            <span className="inline-block skew-x-12">{profile.location}</span>
          </m.p>

          <h1 className="mb-6">
            <span className="sr-only">
              {profile.name}, {profile.role}
            </span>
            <RansomText
              text="KHALIFAH"
              seed={7}
              className="block text-[clamp(2.4rem,10.5vw,6rem)]"
            />
            <RansomText
              text="ERIAN"
              seed={21}
              className="block pl-[8%] text-[clamp(2.4rem,10.5vw,6rem)]"
            />
          </h1>

          <m.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.4, ease: [0.7, 0, 0.3, 1] }}
            className="mb-6 inline-block origin-left bg-red px-5 py-2 -skew-x-12 shadow-[6px_6px_0_var(--color-paper)]"
          >
            {/* block, bukan inline-block: inline-block menyisakan ruang descender di
                bawah baris, sehingga huruf kapital terlihat naik di dalam kotak */}
            <span className="block skew-x-12 font-display text-2xl tracking-wide uppercase sm:text-3xl">
              {profile.role}
            </span>
          </m.div>

          <p className="mb-8 max-w-[22rem] text-lg leading-relaxed text-paper/85 md:max-w-[24rem] lg:max-w-[25rem] xl:max-w-[28rem]">
            3+ years building React apps for telecom and enterprise clients. Data-heavy dashboards,
            charts, and geospatial maps, plus enough backend to talk shop with API teams.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button href="#targets">View targets</Button>
            <Button href={profile.cvUrl} variant="light" download>
              Download CV
            </Button>
          </div>
        </div>

        {/* kartu statistik kanan */}
        <m.div
          initial={{ rotate: 12, scale: 0.6, opacity: 0 }}
          animate={{ rotate: -4, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.25 }}
          className="relative mx-auto mt-12 w-full max-w-sm md:mt-0"
        >
          <Sprite
            name="sparkles-gold"
            loading="eager"
            className="absolute -top-14 -right-10 w-40 animate-pulse z-10"
          />
          <div className="ds-ink">
            <div className="card-cut relative bg-paper p-8 pt-16 text-ink">
              <p className="font-display text-sm tracking-[0.3em] text-red uppercase">Experience</p>
              <div className="my-2 flex items-center gap-3">
                <SpriteNumber value="3" variant="big" className="h-44" label="3" />
                {/* "+" di tengah tinggi angka (bukan jatuh ke baseline) */}
                <span aria-hidden className="font-display text-7xl leading-none text-red">
                  +
                </span>
              </div>
              <RansomText text="YEARS OF REACT" tone="light" seed={4} className="text-3xl" />
              <ul className="mt-6 space-y-1.5 text-sm font-semibold">
                {[
                  "Telecom network dashboards",
                  "Enterprise web platforms",
                  "Performance & migrations",
                ].map((item) => (
                  // penanda CSS, bukan glyph ▸ (glyph cadangan duduk terlalu rendah)
                  <li key={item} className="flex items-center gap-2.5">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-red" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Sprite
            name="critical"
            loading="eager"
            className="absolute -top-12 -left-2 w-44 rotate-[-12deg] sm:-left-10 sm:w-52"
          />
        </m.div>
      </div>

      {/* pita berjalan */}
      <div className="relative -mb-1 -rotate-1 overflow-hidden border-y-4 border-ink bg-paper py-3 text-ink">
        <div className="animate-marquee flex w-max gap-10 font-display text-xl tracking-wide whitespace-nowrap uppercase">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-10" aria-hidden={i >= TICKER.length}>
              {/* satu span: kalau tidak, teks & panah jadi item flex terpisah (kena gap-10) */}
              <span>{withArrows(t)}</span>
              <Sprite name="star-red" className="h-6 w-auto" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
