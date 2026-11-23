import { m } from "motion/react";
import { SectionHeading } from "../components/ui/SectionHeading";
import { TarotCard } from "../components/ui/TarotCard";
import { Sprite } from "../components/ui/Sprite";
import { profile } from "../content/profile";

export function About() {
  return (
    <section id="about" className="stripes relative overflow-hidden bg-ink-soft px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="01" kicker="Who's behind the mask" title="PROFILE" />

        {/* cut-in ala critical hit: meluncur masuk dari kanan */}
        <m.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          className="relative -mx-5 mb-14 md:mx-0 md:ml-[20%]"
        >
          {/* yang dipantau pembungkusnya; isinya meluncur dari kanan */}
          <m.div
            variants={{ hidden: { x: "110%" }, show: { x: "0%" } }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="ds-ink">
              <div className="overflow-hidden bg-red [clip-path:polygon(4%_0,100%_0,96%_100%,0_100%)]">
                <Sprite
                  name="cutin-joker"
                  className="h-36 w-full object-cover object-[50%_35%] sm:h-48"
                />
              </div>
            </div>
            <p className="absolute -bottom-4 left-[8%] -rotate-2 bg-ink px-4 py-1 font-display tracking-[0.3em] text-paper uppercase ring-2 ring-red">
              Take your time. I'll take your requirements.
            </p>
          </m.div>
        </m.div>

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <m.div
            initial={{ x: -60, opacity: 0, rotate: -3 }}
            whileInView={{ x: 0, opacity: 1, rotate: -1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="frame-gold relative px-7 py-10 sm:px-12 sm:py-14"
          >
            <Sprite
              name="sparkles-gold"
              className="pointer-events-none absolute -bottom-12 -left-10 w-24 sm:w-28"
            />
            <div className="halftone pointer-events-none absolute inset-0 text-ink/15" />
            <div className="absolute -right-4 -bottom-24 hidden rotate-12 sm:block">
              <TarotCard
                arcana={{ card: "fool", label: "0 · The Fool", meaning: "" }}
                mode="reveal"
                className="w-20"
              />
            </div>
            <div className="relative space-y-4 text-lg leading-relaxed text-paper">
              {profile.summary.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0 ? "font-display text-2xl leading-snug tracking-wide uppercase" : ""
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </m.div>

          <div className="relative">
            <Sprite name="check" className="absolute -top-16 right-0 w-36 rotate-6 z-10" />
            <dl className="space-y-4">
              {profile.facts.map((f, i) => (
                <m.div
                  key={f.label}
                  initial={{ x: 60, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="ds-red"
                >
                  <div
                    className={`flex flex-col gap-1 bg-paper px-5 py-3 text-ink ${
                      i % 2 ? "card-cut-alt" : "card-cut"
                    }`}
                  >
                    <dt className="font-display text-xs tracking-[0.3em] text-red uppercase">
                      {f.label}
                    </dt>
                    <dd className="text-lg font-bold">{f.value}</dd>
                  </div>
                </m.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
