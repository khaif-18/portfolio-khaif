import { useReducedMotion } from "motion/react";
import { useAnimate } from "motion/react-mini";
import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { CROWD_FRAMES } from "../../lib/crowd";
import { Sprite } from "../ui/Sprite";
import { WipeContext, type WipeRun, type WipeTo } from "./useWipe";

const EASE = [0.76, 0, 0.24, 1] as const;
const OFF_LEFT = "translateX(-130%) skewX(-12deg)";
const ON = "translateX(0%) skewX(-12deg)";
const OFF_RIGHT = "translateX(130%) skewX(-12deg)";

/**
 * Transisi: panel aksen-hitam menutup layar, aksi (ganti route / ganti tema)
 * dijalankan di baliknya, lalu panel membuka. `await navigate()` di data router baru selesai setelah
 * chunk lazy termuat, jadi panel tidak pernah membuka halaman kosong.
 */
export function WipeProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const busy = useRef(false);

  const run = useCallback<WipeRun>(
    async (action) => {
      if (busy.current) return;
      if (reduced) {
        await action();
        return;
      }
      busy.current = true;
      const panels = scope.current.querySelectorAll<HTMLElement>("[data-panel]");
      try {
        await Promise.all(
          [...panels].map((el, i) =>
            animate(
              el,
              { transform: [OFF_LEFT, ON] },
              { duration: 0.45, delay: i * 0.07, ease: EASE },
            ),
          ),
        );
        await action();
        await Promise.all(
          [...panels]
            .reverse()
            .map((el, i) =>
              animate(
                el,
                { transform: [ON, OFF_RIGHT] },
                { duration: 0.45, delay: i * 0.07, ease: EASE },
              ),
            ),
        );
      } finally {
        busy.current = false;
      }
    },
    [animate, reduced, scope],
  );

  const go = useCallback<WipeTo>((to) => run(() => navigate(to)), [run, navigate]);
  const value = useMemo(() => ({ go, run }), [go, run]);

  return (
    <WipeContext.Provider value={value}>
      {children}
      <div
        ref={scope}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      >
        {/* panel hitam: kerumunan putih ikut tersapu melintas */}
        <div
          data-panel
          className="absolute -inset-y-10 -left-[20%] w-[140%] overflow-hidden bg-ink"
          style={{ transform: OFF_LEFT }}
        >
          <WipeCrowd frames={[0, 5, 9, 14, 21, 27, 33]} className="opacity-90" />
        </div>
        {/* panel merah: kerumunan hitam + "take your time" */}
        <div
          data-panel
          className="absolute -inset-y-10 -left-[20%] grid w-[140%] place-items-center overflow-hidden bg-red"
          style={{ transform: OFF_LEFT }}
        >
          <WipeCrowd frames={[3, 11, 18, 24, 30, 36, 39]} className="brightness-0" />
          <Sprite
            name="take-your-time"
            loading="eager"
            className="relative -mt-[12vh] w-[min(80vw,34rem)] skew-x-12 -rotate-3 drop-shadow-[6px_6px_0_var(--color-ink)]"
          />
        </div>
      </div>
    </WipeContext.Provider>
  );
}

/** Barisan silhouette di dasar panel wipe (statis; bergerak bersama panel). */
function WipeCrowd({ frames, className = "" }: { frames: number[]; className?: string }) {
  return (
    <div
      className={`absolute inset-x-[12%] bottom-10 flex h-[40vh] skew-x-12 items-end justify-around ${className}`}
    >
      {frames.map((f, i) => (
        <img
          key={f}
          src={CROWD_FRAMES[f % CROWD_FRAMES.length]}
          alt=""
          loading="eager"
          decoding="async"
          className="w-auto max-w-none"
          style={{ height: `${78 + ((i * 37) % 22)}%` }}
        />
      ))}
    </div>
  );
}
