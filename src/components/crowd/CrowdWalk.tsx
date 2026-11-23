import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { CROWD_FRAMES } from "../../lib/crowd";

/**
 * Barisan silhouette pejalan kaki yang melintas terus-menerus.
 *
 * Geraknya murni CSS (crowd-walk + crowd-step di index.css), jadi murah.
 * JS hanya mengatur playbackRate: makin cepat scroll, makin cepat orang berjalan,
 * dan scroll ke atas membuat mereka berjalan mundur. Animasi dijeda saat
 * di luar layar.
 */

type Tone = "light" | "dark" | "red";

const TONE_FILTER: Record<Tone, string | undefined> = {
  light: undefined,
  dark: "brightness(0)",
  // putih -> warna aksen gelap (merah/biru, ikut tema; lihat --accent-filter)
  red: "var(--accent-filter)",
};

interface Props {
  count?: number;
  /** tinggi orang paling tinggi, nilai CSS */
  height?: string;
  tone?: Tone;
  /** detik untuk satu kali melintas (rata-rata) */
  speed?: number;
  direction?: "left" | "right";
  seed?: number;
  /** ikut scroll: cepat/lambat/mundur */
  scrollLinked?: boolean;
  className?: string;
}

/** sisa bagi 1 yang selalu positif (delay positif = orang diam di tepi kiri) */
const mod1 = (x: number) => ((x % 1) + 1) % 1;

function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function CrowdWalk({
  count = 12,
  height = "16rem",
  tone = "light",
  speed = 26,
  direction = "left",
  seed = 1,
  scrollLinked = true,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const walkers = useMemo(() => {
    const r = rng(seed);
    const pool = [...CROWD_FRAMES].sort(() => r() - 0.5);
    // Tiga lapis kedalaman. Semua orang di satu lapis berjalan dengan kecepatan
    // yang SAMA dan berjarak rata, jadi jaraknya tidak pernah menyusut dan
    // tidak bisa bergerombol walau dibiarkan lama.
    const LAYERS = [
      { depth: 0.1, pace: 1.3 },
      { depth: 0.55, pace: 1.0 },
      { depth: 1, pace: 0.75 },
    ];
    const perLayer = LAYERS.map(
      (_, l) => Math.floor(count / LAYERS.length) + (l < count % LAYERS.length ? 1 : 0),
    );
    let n = 0;
    return LAYERS.flatMap((layer, l) => {
      const walk = speed * layer.pace;
      const offset = r(); // geser fase tiap lapis supaya lapisan tidak sejajar
      return Array.from({ length: perLayer[l] }, (_, i) => ({
        src: pool[n++ % pool.length],
        depth: layer.depth,
        walk,
        // jitter kecil (< 1 slot) supaya tidak terlihat seperti barisan baris-berbaris
        delay: -mod1((i + offset + (r() - 0.5) * 0.35) / perLayer[l]) * walk,
        step: 0.9 + r() * 0.35,
        scale: 0.72 + layer.depth * 0.28 + (r() - 0.5) * 0.08,
        opacity: 0.45 + layer.depth * 0.55,
      }));
    });
  }, [count, seed, speed]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let rate = 1;
    let target = 1;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;

    const apply = () => {
      for (const a of el.getAnimations({ subtree: true })) {
        // Saat berjalan mundur, currentTime menuju 0. Kalau mentok, animasi
        // dianggap "finished" dan semua orang loncat ke posisi awal lalu
        // menumpuk. Jadi sebelum itu terjadi, mundurkan jam sejauh kelipatan
        // durasi (fase sama persis, tidak terlihat).
        const d = Number(a.effect?.getComputedTiming().duration) || 0;
        const t = Number(a.currentTime) || 0;
        if (rate < 0 && d > 0 && t < d * 4) a.currentTime = t + d * 50;
        a.playbackRate = rate;
        if (a.playState === "finished") a.play();
      }
    };

    const tick = () => {
      // target kembali pelan-pelan ke 1 saat scroll berhenti
      target += (1 - target) * 0.04;
      rate += (target - rate) * 0.15;
      apply();
      raf = visible && Math.abs(rate - 1) > 0.01 ? requestAnimationFrame(tick) : 0;
      if (!raf) {
        rate = 1;
        apply();
      }
    };

    const onScroll = () => {
      const now = performance.now();
      const v = (window.scrollY - lastY) / Math.max(now - lastT, 1); // px per ms
      lastY = window.scrollY;
      lastT = now;
      if (!visible) return;
      target = Math.max(-4, Math.min(6, 1 + v * 3));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      el.toggleAttribute("data-crowd-paused", !visible);
    });
    io.observe(el);
    if (scrollLinked) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollLinked]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-crowd-paused
      className={`pointer-events-none overflow-hidden select-none ${className.includes("absolute") ? "" : "relative"} ${className}`}
      style={{ height }}
    >
      {walkers.map((w, i) => (
        <div
          key={i}
          className="crowd-track absolute inset-0"
          data-dir={direction}
          style={{ "--walk": `${w.walk}s`, "--delay": `${w.delay}s` } as CSSProperties}
        >
          <div
            className="crowd-body absolute bottom-0 left-0 h-full"
            style={
              {
                "--step": `${w.step}s`,
                "--delay": `${w.delay}s`,
                height: `${w.scale * 100}%`,
                opacity: w.opacity,
              } as CSSProperties
            }
          >
            <img
              src={w.src}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              className="h-full w-auto max-w-none"
              style={{
                filter: TONE_FILTER[tone],
                transform: direction === "right" ? "scaleX(-1)" : undefined,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
