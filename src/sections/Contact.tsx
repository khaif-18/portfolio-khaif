import { m } from "motion/react";
import { CrowdWalk } from "../components/crowd/CrowdWalk";
import { RansomText } from "../components/ransom/RansomText";
import { sprite } from "../lib/sprites";
import { Arrow } from "../components/ui/Arrow";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Sprite } from "../components/ui/Sprite";
import { profile } from "../content/profile";

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-ink px-5 pt-28 pb-44">
      <div className="mx-auto max-w-5xl">
        <SectionHeading index="05" kicker="Get in touch" title="CALLING CARD" />

        <m.div
          initial={{ rotate: -14, scale: 0.7, opacity: 0 }}
          whileInView={{ rotate: -2, scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="relative"
        >
          <div className="ds-paper">
            <div className="card-cut relative overflow-hidden bg-red px-8 py-14 sm:px-16">
              <div className="halftone pointer-events-none absolute inset-0 text-ink/20" />
              <Sprite
                name="knife"
                className="pointer-events-none absolute top-8 -right-10 w-64 rotate-[-20deg] opacity-90 max-sm:hidden"
              />
              <div className="relative">
                <p className="mb-4 font-display tracking-[0.3em] uppercase">To the hiring team,</p>
                <RansomText
                  text="LET'S BUILD SOMETHING"
                  seed={3}
                  className="mb-1 block text-4xl sm:text-6xl"
                />
                <RansomText
                  text="FAST & BOLD"
                  seed={11}
                  className="mb-8 block text-4xl sm:text-6xl"
                />
                <p className="mb-10 max-w-xl text-lg text-paper">
                  Open to frontend roles where performance, data-heavy UIs, and a bit of style
                  matter. Drop a line and I'll get back to you.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button href={`mailto:${profile.email}`} variant="dark">
                    {profile.email}
                  </Button>
                  {profile.links.map((l) => (
                    <Button
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="light"
                    >
                      {l.label} <Arrow dir="up-right" />
                    </Button>
                  ))}
                  <Button href={profile.cvUrl} download variant="light">
                    CV (PDF)
                  </Button>
                </div>
                <div className="mt-10 flex items-end justify-end gap-4">
                  <p className="font-display tracking-[0.3em] uppercase">— Khalifah</p>
                  <div className="relative w-20 shrink-0 sm:w-24">
                    <div
                      className="flame absolute -top-[70%] left-[18%] aspect-[83/89] w-[64%] opacity-80"
                      style={{ backgroundImage: `url(${sprite("flame-strip")})` }}
                    />
                    <Sprite name="top-hat" className="relative w-full -rotate-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Sprite name="ok" className="absolute -top-8 -left-6 w-28 -rotate-12" />
        </m.div>
      </div>
      <CrowdWalk
        count={12}
        height="11rem"
        tone="red"
        speed={28}
        seed={9}
        className="absolute inset-x-0 bottom-0 opacity-70"
      />
    </section>
  );
}
