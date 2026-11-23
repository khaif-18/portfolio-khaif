import { m, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { NAV } from "../../content/nav";
import { Sprite } from "../ui/Sprite";

interface Marker {
  id: string;
  label: string;
  /** posisi section di sepanjang halaman, 0–1 (sejajar dengan progress scroll) */
  at: number;
}

/**
 * Indikator scroll ala HUD game, pelengkap scrollbar bawaan.
 * Layar lebar (xl): rel vertikal di kanan, penanda tiap section (bisa diklik), bintang
 * yang turun dan berputar mengikuti scroll. Layar lebih kecil: pita progress di atas.
 */
export function ScrollHud() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.4 });
  const top = useTransform(progress, (v) => `${v * 100}%`);
  const spin = useTransform(progress, (v) => v * 720);

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [pct, setPct] = useState(0);

  // hitung ulang posisi section kalau tinggi halaman berubah (gambar termuat, resize)
  useEffect(() => {
    if (!onHome) {
      setMarkers([]);
      return;
    }
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setMarkers(
        NAV.flatMap(({ id, label }) => {
          const el = document.getElementById(id);
          if (!el) return [];
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          return [{ id, label, at: Math.min(1, Math.max(0, y / max)) }];
        }),
      );
    };
    // tinggi body berubah berkali-kali saat gambar/font termuat: gabungkan jadi satu
    // pengukuran per frame (getBoundingClientRect memaksa layout)
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [onHome]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
    let current: string | null = null;
    for (const mk of markers) if (v >= mk.at - 0.01) current = mk.id;
    setActive(current);
  });

  return (
    <>
      {/* layar < xl: pita progress di atas */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1.5 xl:hidden">
        <m.div className="hud-fill h-full origin-left" style={{ scaleX: progress }} />
      </div>

      {/* layar xl: rel kanan (di bawah xl rel ini bertabrakan dengan konten) */}
      {/* duplikat nav utama, jadi disembunyikan dari screen reader dan urutan Tab
          (tetap bisa diklik mouse). Keyboard punya nav utama + shortcut 1-5 / J K. */}
      <div
        aria-hidden
        className="fixed top-1/2 right-5 z-40 hidden h-[56vh] w-10 -translate-y-1/2 xl:block"
      >
        <div className="hud-rail absolute inset-y-0 right-[9px] w-[3px]" />
        <m.div
          aria-hidden
          className="hud-fill absolute top-0 right-[7px] w-[7px] origin-top"
          style={{ height: top }}
        />

        {markers.map((mk) => {
          const isActive = active === mk.id;
          return (
            <a
              key={mk.id}
              href={`#${mk.id}`}
              tabIndex={-1}
              className="group absolute right-0 flex -translate-y-1/2 items-center gap-2 py-2.5 pl-3"
              style={{ top: `${mk.at * 100}%` }}
            >
              <span
                className={`slant-sm font-display text-xs tracking-[0.2em] whitespace-nowrap uppercase transition-all duration-200 ${
                  isActive
                    ? "translate-x-0 bg-red px-2.5 py-0.5 text-paper opacity-100"
                    : "translate-x-2 bg-ink px-2.5 py-0.5 text-paper opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                }`}
              >
                {mk.label}
              </span>
              <span
                aria-hidden
                className={`block rotate-45 border-2 transition-all group-active:scale-75 group-active:bg-red ${
                  isActive
                    ? "h-4 w-4 border-paper bg-red"
                    : "h-3 w-3 border-paper/70 bg-ink group-hover:bg-paper"
                } mr-[4px]`}
              />
            </a>
          );
        })}

        {/* bintang = posisi sekarang */}
        <m.div
          aria-hidden
          className="pointer-events-none absolute right-[-7px] -translate-y-1/2"
          style={{ top }}
        >
          <m.div style={{ rotate: spin }} className="drop-shadow-[2px_2px_0_var(--color-ink)]">
            <Sprite name="star-red" loading="eager" className="w-9 max-w-none" />
          </m.div>
        </m.div>

        <span
          aria-hidden
          className="absolute -bottom-8 right-0 bg-paper px-1.5 font-display text-sm text-ink tabular-nums -rotate-6"
        >
          {String(pct).padStart(2, "0")}%
        </span>
      </div>
    </>
  );
}
