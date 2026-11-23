import { useEffect } from "react";

/** Elemen yang dianggap bisa diklik (sama dengan selektor kursor "target" di index.css). */
export const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], label[for], summary, [data-cursor="target"]';

/**
 * Feedback tekan global, untuk mouse dan sentuh:
 *
 *   tekan  : bidikan wajik muncul di titik tekan lalu mengecil ("mengunci") selama ditahan
 *   lepas  : kalau masih di atas elemen yang sama -> pecah jadi serpihan (klik terjadi)
 *            kalau sudah digeser keluar         -> bidikan pudar tanpa ledakan (batal)
 *
 * Hanya muncul di elemen yang bisa diklik, jadi sekaligus jadi penanda: menekan
 * bagian yang bukan tombol tidak memberi efek apa pun.
 * Selama ditekan, <html data-press> mengganti kursor ke versi "terkunci".
 */
export function PressFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let layer: HTMLDivElement | null = null;
    let current: { el: Element; ring: HTMLElement; x: number; y: number } | null = null;

    const getLayer = () => {
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "press-layer";
        layer.setAttribute("aria-hidden", "true");
        document.body.append(layer);
      }
      return layer;
    };

    const spawn = (cls: string, x: number, y: number) => {
      const node = document.createElement("span");
      node.className = cls;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      getLayer().append(node);
      return node;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE);
      if (!el) return;
      root.dataset.press = "";
      if (reduced.matches) {
        current = { el, ring: document.createElement("span"), x: e.clientX, y: e.clientY };
        return;
      }
      const ring = spawn("press-ring", e.clientX, e.clientY);
      // muncul besar lalu mengunci ke titik; tetap di ukuran kecil selama ditahan
      ring.animate(
        [
          { transform: "translate(-50%, -50%) rotate(45deg) scale(1.9)", opacity: 0 },
          { transform: "translate(-50%, -50%) rotate(45deg) scale(1.9)", opacity: 1, offset: 0.15 },
          { transform: "translate(-50%, -50%) rotate(135deg) scale(0.8)", opacity: 1 },
        ],
        { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "forwards" },
      );
      current = { el, ring, x: e.clientX, y: e.clientY };
    };

    const burst = (x: number, y: number) => {
      const N = 7;
      for (let i = 0; i < N; i++) {
        const shard = spawn("press-shard", x, y);
        const a = (i / N) * 360 + Math.random() * 30;
        const d = 26 + Math.random() * 16;
        const rad = (a * Math.PI) / 180;
        const tx = Math.cos(rad) * d;
        const ty = Math.sin(rad) * d;
        shard
          .animate(
            [
              { transform: `translate(-50%, -50%) rotate(${a}deg) scaleX(0.3)`, opacity: 1 },
              {
                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${a}deg) scaleX(1)`,
                opacity: 1,
                offset: 0.5,
              },
              {
                transform: `translate(calc(-50% + ${tx * 1.3}px), calc(-50% + ${ty * 1.3}px)) rotate(${a}deg) scaleX(0.1)`,
                opacity: 0,
              },
            ],
            { duration: 460, easing: "cubic-bezier(0.1, 0.7, 0.3, 1)" },
          )
          .finished.then(
            () => shard.remove(),
            () => shard.remove(),
          );
      }
    };

    const onUp = (e: PointerEvent) => {
      const c = current;
      current = null;
      delete root.dataset.press;
      if (!c || reduced.matches) return;
      // klik dianggap jadi kalau dilepas masih di atas elemen yang sama
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const clicked = e.type === "pointerup" && !!over && c.el.contains(over);
      const { ring } = c;
      ring.getAnimations().forEach((a) => {
        a.commitStyles();
        a.cancel();
      });
      ring
        .animate(
          clicked
            ? [
                { transform: "translate(-50%, -50%) rotate(135deg) scale(0.8)", opacity: 1 },
                { transform: "translate(-50%, -50%) rotate(180deg) scale(2.2)", opacity: 0 },
              ]
            : [{ opacity: 0, transform: "translate(-50%, -50%) rotate(135deg) scale(0.5)" }],
          { duration: clicked ? 320 : 200, easing: "ease-out", fill: "forwards" },
        )
        .finished.then(
          () => ring.remove(),
          () => ring.remove(),
        );
      if (clicked) burst(c.x, c.y);
    };

    // iOS Safari hanya menerapkan :active kalau ada listener touchstart
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
    return () => {
      document.removeEventListener("touchstart", noop);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onUp, true);
      layer?.remove();
      delete root.dataset.press;
    };
  }, []);

  return null;
}
