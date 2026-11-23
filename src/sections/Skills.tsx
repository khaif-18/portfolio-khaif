import { m } from "motion/react";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Sprite } from "../components/ui/Sprite";
import { sideQuests, skills } from "../content/skills";

export function Skills() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-title"
      className="stripes relative overflow-hidden bg-ink-soft px-5 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="04" kicker="Skills & tools" title="STATS" id="stats-title" />

        <div className="space-y-5">
          {skills.map((g, gi) => (
            <m.div
              key={g.label}
              initial={{ x: gi % 2 ? 80 : -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="grid items-start gap-3 md:grid-cols-[14rem_1fr]"
            >
              <h3 className="slant w-fit bg-red px-6 py-2 font-display text-xl tracking-wide uppercase md:w-full">
                {g.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li
                    key={s}
                    className="slant-sm bg-paper px-4 py-1.5 font-semibold text-ink transition-colors hover:bg-gold"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </div>

        <div className="relative mt-24">
          <div className="mb-8 flex items-center gap-4">
            <Sprite name="bonus" alt="Bonus" className="w-48 -rotate-3" />
            <span className="font-display text-2xl tracking-wide uppercase">Side quests</span>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sideQuests.map((q, i) => (
              <m.li
                key={q.title}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="ds-paper"
              >
                <div
                  className={`${i % 2 ? "card-cut-alt" : "card-cut"} h-full border-l-8 border-red bg-ink p-6`}
                >
                  {q.period && (
                    <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">
                      {q.period}
                    </p>
                  )}
                  <h3 className="mt-1 font-display text-2xl leading-tight tracking-wide uppercase">
                    {q.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-paper/70">{q.place}</p>
                  <p className="mt-3 text-sm text-paper/80">{q.detail}</p>
                </div>
              </m.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
