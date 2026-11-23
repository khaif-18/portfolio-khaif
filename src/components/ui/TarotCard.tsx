import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Arcana } from "../../content/types";
import { HOLE_FRAMES } from "../../lib/holes";
import { sprite } from "../../lib/sprites";
import { Sprite } from "./Sprite";

/**
 * Kartu tarot yang ditembak saat di-hover:
 *
 *   tembakan 1: kilat putih -> bekas peluru (kartu tersentak sedikit)
 *   tembakan 2: kilat putih -> bekas peluru
 *   tembakan 3: kilat putih -> bekas peluru -> momentum peluru membuat kartu
 *               ter-flip beberapa kali (poros vertikal), cepat lalu melambat,
 *               sedikit terangkat, lalu bergoyang kecil sebelum diam.
 *
 * Hasil akhir: muka kartu dengan 3 bekas peluru.
 *
 * mode "reveal": diam = punggung, akhir flip = muka (Targets).
 * mode "front" : diam = muka, flip beberapa putaran penuh, akhir = muka (halaman project).
 *
 * Peluru menembus kartu, jadi lubang ada di kedua sisi (posisi di punggung dicerminkan).
 * `shot` dikendalikan parent; kalau tidak diberikan, kartu berdiri sendiri dan jadi tombol:
 *   mouse   : hover = tembak, klik = tembak ulang (kartu sudah menghadap muka -> flip penuh)
 *   sentuh  : tap = tembak, tap lagi = kembali
 *   keyboard: Enter/Spasi seperti klik, fokus lepas = kembali
 * Di layar sentuh, "reveal" diperlakukan seperti "front" (punggung tak bisa dibuka tanpa hover).
 */

type Mode = "reveal" | "front";

const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

interface Props {
  arcana: Arcana;
  mode?: Mode;
  shot?: boolean;
  className?: string;
}

/** waktu tiap tembakan (ms sejak hover) */
const SHOT_TIMES = [0, 230, 460];
/** jeda dari tembakan terakhir sampai kartu mulai ter-flip */
const FLIP_DELAY = 50;
const FLIP_MS = 1500;
/** jumlah setengah putaran tambahan dari momentum (reveal: 5 = 2,5 putaran, berakhir di muka) */
const REVEAL_HALF_TURNS = 5;
const FRONT_HALF_TURNS = 6;

/** urutan fungsi transform harus selalu sama supaya WAAPI menginterpolasi per fungsi */
const pose = (y: number, s = 1, lift = 0) => `translateY(${lift}%) rotateY(${y}deg) scale(${s})`;

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function TarotCard({ arcana, mode = "reveal", shot, className = "w-28" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  /** naik tiap "tembak ulang"; 0 = tembakan pertama dari pose diam */
  const [round, setRound] = useState(0);
  const standalone = shot === undefined;
  const active = shot ?? (hovered || tapped);

  // pose diam, dan pose saat peluru kena (tembak ulang = kartu sudah menghadap muka)
  const idleFront = mode === "front" || !canHover;
  const impactFront = idleFront || round > 0;

  // posisi lubang deterministik per kartu (koordinat sisi MUKA, dalam % kartu).
  // satu lubang per pertiga tinggi kartu supaya tidak menumpuk.
  const holes = useMemo(() => {
    const r = rng(hash(arcana.card));
    const pool = [...HOLE_FRAMES].sort(() => r() - 0.5);
    return SHOT_TIMES.map((_, i) => {
      const size = 32 + r() * 12; // % lebar kartu
      return {
        src: pool[i % pool.length],
        size,
        left: 6 + r() * (86 - size),
        top: 8 + i * 27 + r() * 10,
        rotate: r() * 360,
      };
    });
  }, [arcana.card]);

  useEffect(() => {
    const card = inner.current;
    const el = root.current;
    if (!card || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idleY = idleFront ? 180 : 0;
    const holeEls = [...el.querySelectorAll<HTMLElement>("[data-hole]")];
    const flashEls = [...el.querySelectorAll<HTMLElement>("[data-flash]")];
    const holesOf = (i: number) => holeEls.filter((h) => h.dataset.hole === String(i));

    let cancelled = false;
    const running: Animation[] = [];
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((done) => timers.push(window.setTimeout(done, ms)));

    /** jalankan animasi; di akhir, bekukan hasilnya ke style lalu lepas animasinya */
    const play = (target: HTMLElement, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      const a = target.animate(frames, { fill: "forwards", ...opts });
      running.push(a);
      return a.finished
        .then(() => {
          if (cancelled) return;
          a.commitStyles();
          a.cancel();
        })
        .catch(() => {}); // dibatalkan
    };

    /** hentikan semua animasi di posisinya sekarang (untuk interupsi di tengah jalan) */
    const freeze = () => {
      cancelled = true;
      for (const a of running) {
        try {
          a.commitStyles();
        } catch {
          // elemen sudah tidak dirender
        }
        a.cancel();
      }
      running.length = 0;
      timers.forEach(clearTimeout);
    };

    // ---------- kursor keluar: lubang hilang, kartu kembali ke pose diam ----------
    if (!active) {
      if (reduced) {
        holeEls.forEach((h) => (h.style.opacity = "0"));
        card.style.transform = pose(idleY);
        return;
      }
      void (async () => {
        await Promise.all(holeEls.map((h) => play(h, [{ opacity: 0 }], { duration: 160 })));
        if (cancelled) return;
        await play(card, [{ transform: pose(idleY) }], {
          duration: 450,
          easing: "cubic-bezier(0.7, 0, 0.3, 1)",
        });
      })();
      return freeze;
    }

    // ---------- ditembak ----------
    const endY = 180; // keduanya berakhir di muka kartu
    const restY = impactFront ? 180 : 0;

    // tembak ulang: bersihkan lubang lama dulu
    if (round > 0) {
      holeEls.forEach((h) => (h.style.opacity = "0"));
      card.style.transform = pose(restY);
    }

    if (reduced) {
      card.style.transform = pose(endY);
      holeEls.forEach((h) => (h.style.opacity = "1"));
      return;
    }

    /** kilat putih di titik kena, lalu bekas peluru muncul (di kedua sisi) */
    const fire = (i: number) => {
      const flash = flashEls[i];
      if (flash)
        void play(
          flash,
          [
            { opacity: 1, transform: "translate(-50%, -50%) scale(0.2)" },
            { opacity: 1, transform: "translate(-50%, -50%) scale(1.3)", offset: 0.35 },
            { opacity: 0, transform: "translate(-50%, -50%) scale(1.7)" },
          ],
          { duration: 200, easing: "ease-out" },
        );
      for (const h of holesOf(i)) {
        const rot = h.dataset.rot;
        void play(
          h,
          [
            { opacity: 0, transform: `rotate(${rot}deg) scale(1.6)` },
            { opacity: 1, transform: `rotate(${rot}deg) scale(1)` },
          ],
          // muncul tepat setelah kilat memuncak
          { duration: 110, delay: 60, easing: "ease-out" },
        );
      }
    };

    /** sentakan kecil saat peluru kena (belum cukup untuk membalik kartu) */
    const jolt = (dir: 1 | -1) =>
      play(
        card,
        [
          { transform: pose(restY) },
          { transform: pose(restY + 14 * dir, 0.95), offset: 0.35 },
          { transform: pose(restY) },
        ],
        { duration: 200, easing: "ease-out" },
      );

    void (async () => {
      // tembakan 1 dan 2
      fire(0);
      void jolt(1);
      await wait(SHOT_TIMES[1]);
      if (cancelled) return;
      fire(1);
      void jolt(-1);
      await wait(SHOT_TIMES[2] - SHOT_TIMES[1]);
      if (cancelled) return;

      // tembakan 3: momentum membuat kartu ter-flip beberapa kali lalu melambat
      fire(2);
      await wait(FLIP_DELAY);
      if (cancelled) return;
      const final = restY + (impactFront ? FRONT_HALF_TURNS : REVEAL_HALF_TURNS) * 180;
      await play(
        card,
        [
          { transform: pose(restY, 0.95, 0), easing: "cubic-bezier(0.12, 0.75, 0.3, 1)" },
          // terangkat di awal (paling cepat), lalu turun sambil melambat
          {
            transform: pose(final - 260, 1.1, -7),
            offset: 0.38,
            easing: "cubic-bezier(0.25, 0.6, 0.35, 1)",
          },
          // sedikit kelewatan, lalu goyang kecil sebelum diam
          { transform: pose(final + 16, 1.02, 0), offset: 0.74, easing: "ease-in-out" },
          { transform: pose(final - 7, 1, 0), offset: 0.87, easing: "ease-in-out" },
          { transform: pose(final + 2, 1, 0), offset: 0.95, easing: "ease-in-out" },
          { transform: pose(final, 1, 0) },
        ],
        { duration: FLIP_MS },
      );
      if (cancelled) return;
      // sudut setara 180°: normalkan diam-diam supaya flip pulang tidak berputar-putar
      card.style.transform = pose(endY);
    })();

    return freeze;
  }, [active, idleFront, impactFront, round, holes]);

  // saat kena, sisi yang menghadap penonton: reveal = punggung, front = muka
  const showsFrontAtImpact = impactFront;

  const trigger = () => {
    if (!active) setTapped(true);
    else if (!canHover) setTapped(false);
    else setRound((r) => r + 1);
  };
  const reset = () => {
    setHovered(false);
    setTapped(false);
    setRound(0);
  };
  const interactive = standalone
    ? {
        role: "button",
        tabIndex: 0,
        "aria-label": `Shoot the ${arcana.label} card`,
        "aria-pressed": active,
        "data-cursor": "target",
        onClick: trigger,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          trigger();
        },
        onBlur: reset,
        // hanya mouse: di layar sentuh pointerleave ikut terpicu setelah tap
        onPointerEnter: (e: PointerEvent<HTMLDivElement>) => {
          if (e.pointerType === "mouse") setHovered(true);
        },
        onPointerLeave: (e: PointerEvent<HTMLDivElement>) => {
          if (e.pointerType === "mouse") reset();
        },
      }
    : {};

  const face =
    "absolute inset-0 h-full w-full rounded-sm object-cover shadow-[4px_4px_0_var(--color-ink)]";

  /** lubang di satu sisi; sisi punggung = posisi dicerminkan */
  const renderHoles = (mirrored: boolean) =>
    holes.map((h, i) => (
      <img
        key={i}
        data-hole={i}
        data-rot={mirrored ? -h.rotate : h.rotate}
        src={h.src}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute max-w-none"
        style={{
          left: `${mirrored ? 100 - h.left - h.size : h.left}%`,
          top: `${h.top}%`,
          width: `${h.size}%`,
          opacity: 0,
          transform: `rotate(${mirrored ? -h.rotate : h.rotate}deg)`,
        }}
      />
    ));

  return (
    <div
      ref={root}
      // kilatan butuh induk yang ter-posisi; jangan timpa "absolute" dari luar
      className={`tarot ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${
        standalone ? "transition-[scale] duration-100 select-none active:scale-90" : ""
      } ${className}`}
      {...interactive}
    >
      <div
        ref={inner}
        className="tarot-inner relative aspect-1/2"
        style={{ transform: pose(mode === "front" ? 180 : 0) }}
      >
        {/* punggung (+ lubang tembus, dicerminkan) */}
        <div className="tarot-face absolute inset-0">
          <Sprite name="tarot-back" className={`${face} theme-red-only`} />
          <Sprite name="tarot-blue-back" className={`${face} theme-blue-only`} />
          {renderHoles(true)}
        </div>
        {/* muka + lubang */}
        <div className="tarot-face tarot-front absolute inset-0">
          <Sprite
            name={`tarot-${arcana.card}`}
            alt={`Tarot: ${arcana.label}`}
            className={`${face} theme-red-only`}
          />
          <Sprite
            name={`tarot-blue-${arcana.card}`}
            alt={`Tarot: ${arcana.label}`}
            className={`${face} theme-blue-only`}
          />
          {renderHoles(false)}
        </div>
      </div>
      {/* kilat putih: lapisan datar di atas kartu. Semua tembakan terjadi saat
          kartu masih menghadap depan, jadi posisinya pas dengan lubang di sisi
          yang sedang terlihat. */}
      <div className="pointer-events-none absolute inset-0">
        {holes.map((h, i) => (
          <img
            key={i}
            data-flash
            src={sprite("burst-white")}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute max-w-none"
            style={{
              left: `${showsFrontAtImpact ? h.left + h.size / 2 : 100 - h.left - h.size / 2}%`,
              top: `${h.top + h.size / 4}%`,
              width: `${h.size * 1.4}%`,
              opacity: 0,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
