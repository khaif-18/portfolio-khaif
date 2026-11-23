import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { NAV } from "../../content/nav";
import { announce, focusHeading } from "../../lib/announce";
import { setPref, usePref } from "../../lib/prefs";
import { applyTheme, getTheme } from "../../theme/theme";
import { RansomText } from "../ransom/RansomText";
import { useWipe, useWipeRun } from "../transition/useWipe";

/** Event untuk membuka panel dari mana saja (tombol di footer). */
export const OPEN_SHORTCUTS = "p5:shortcuts";
export const openShortcuts = () => window.dispatchEvent(new Event(OPEN_SHORTCUTS));

const KEYS: [string[], string][] = [
  [["Tab", "Shift Tab"], "Move between links and buttons"],
  [["Enter"], "Open a link or press a button"],
  [["Space"], "Press a button (shoot a tarot card)"],
  [["Esc"], "Close the menu or this panel"],
  [["1", "–", "5"], NAV.map((n) => n.label).join(" · ")],
  [["J", "K"], "Next / previous section"],
  [["0"], "Back to the top"],
  [["T"], "Switch theme"],
  [["P"], "Pause or resume animations"],
  [["?"], "Show this panel"],
];

/** apakah tombol sedang diketik ke dalam field (bukan shortcut) */
function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true']");
}

function landed(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate([{ transform: "translateX(-14px)" }, { transform: "none" }], {
    duration: 380,
    easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
  });
}

/**
 * Navigasi keyboard ekstra + panel bantuan (`?`).
 *
 * Shortcut satu tombol bisa bentrok dengan perintah screen reader / speech input,
 * jadi bisa dimatikan dari panel ini (WCAG 2.1.4). Shortcut diabaikan saat
 * Ctrl/Alt/Cmd ditekan, saat mengetik di field, dan saat panel terbuka.
 * Panel memakai <dialog> native: fokus terkunci di dalam, Esc menutup, dan
 * fokus kembali ke elemen sebelumnya saat ditutup.
 */
export function Shortcuts() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const off = usePref("shortcuts");
  const paused = usePref("motion");
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const go = useWipe();
  const run = useWipeRun();

  const jumpTo = useCallback(
    (id: string) => {
      if (!onHome) {
        void go(`/#${id}`); // fokus ke judul diurus RouteFocus setelah pindah
        return;
      }
      const section = document.getElementById(id);
      if (!section) return;
      section.scrollIntoView({ block: "start" });
      history.replaceState(history.state, "", `#${id}`);
      const heading = section.querySelector<HTMLElement>("h2") ?? section;
      focusHeading(heading);
      landed(heading);
    },
    [onHome, go],
  );

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0 });
    focusHeading(document.querySelector<HTMLElement>("main h1"));
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!onHome) return;
      const tops = NAV.map((n) => {
        const el = document.getElementById(n.id);
        return { id: n.id, top: el ? el.getBoundingClientRect().top : 0 };
      });
      // section "sekarang" = yang terakhir sudah melewati bawah header
      let current = -1;
      tops.forEach((t, i) => {
        if (t.top <= 120) current = i; // 5.5rem scroll-padding + toleransi
      });
      const next = Math.min(NAV.length - 1, Math.max(0, current + dir));
      if (next === current && dir === -1 && current === 0) {
        toTop();
        return;
      }
      if (next !== current) jumpTo(tops[next].id);
    },
    [onHome, jumpTo, toTop],
  );

  const toggleTheme = useCallback(() => {
    const next = getTheme() === "red" ? "blue" : "red";
    void run(() => applyTheme(next)).then(() => announce(`${next} theme on`));
  }, [run]);

  const toggleMotion = useCallback(() => {
    const next = !document.documentElement.dataset.motion;
    setPref("motion", next);
    announce(next ? "Animations paused" : "Animations playing");
  }, []);

  // buka/tutup <dialog>
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_SHORTCUTS, show);
    return () => window.removeEventListener(OPEN_SHORTCUTS, show);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (isTyping(e.target) || dialog.current?.open) return;
      if (off) return;
      const k = e.key.toLowerCase();
      const n = Number(k);
      if (k === "?") setOpen(true);
      else if (n >= 1 && n <= NAV.length) jumpTo(NAV[n - 1].id);
      else if (k === "0") {
        if (onHome) toTop();
        else void go("/");
      } else if (k === "j") step(1);
      else if (k === "k") step(-1);
      else if (k === "t") toggleTheme();
      else if (k === "p") toggleMotion();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [off, onHome, jumpTo, step, toTop, toggleTheme, toggleMotion, go]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="shortcuts-title"
      onClose={() => setOpen(false)}
      // klik di luar kartu (backdrop) = tutup
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      className="shortcuts m-auto w-[min(92vw,40rem)] bg-transparent p-0 text-ink backdrop:bg-ink/80"
    >
      <div className="ds-red">
        <div className="card-cut bg-paper px-6 py-8 sm:px-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <RansomText
              as="h2"
              id="shortcuts-title"
              text="CONTROLS"
              tone="light"
              animate={false}
              className="text-4xl sm:text-5xl"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="slant-sm min-h-11 bg-ink px-4 font-display tracking-wide text-paper uppercase transition-[scale,background-color] active:scale-90 active:bg-red"
            >
              Close
            </button>
          </div>

          <table className="mb-8 w-full text-left text-sm">
            <caption className="sr-only">Keyboard shortcuts</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {KEYS.map(([keys, action]) => (
                <tr key={action} className="border-b-2 border-ink/10 last:border-0">
                  <th scope="row" className="py-2 pr-4 align-top font-normal whitespace-nowrap">
                    {keys.map((k) =>
                      k === "–" ? (
                        <span key={k} className="mx-1 text-ink/60">
                          to
                        </span>
                      ) : (
                        <kbd key={k} className="kbd mr-1.5">
                          {k}
                        </kbd>
                      ),
                    )}
                  </th>
                  <td className="py-2 font-semibold">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Switch
              label="Single-key shortcuts"
              checked={!off}
              onChange={(v) => {
                setPref("shortcuts", !v);
                announce(v ? "Shortcuts on" : "Shortcuts off");
              }}
            />
            <Switch label="Animations" checked={!paused} onChange={() => toggleMotion()} />
          </div>
          <p className="mt-4 text-xs text-ink/70">
            Turn single-key shortcuts off if they clash with your screen reader or voice control.
          </p>
        </div>
      </div>
    </dialog>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group slant-sm flex min-h-11 flex-1 items-center justify-between gap-3 bg-ink px-4 py-2 font-display tracking-wide text-paper uppercase transition-[scale] active:scale-95"
    >
      {label}
      <span
        aria-hidden
        className={`px-2 py-0.5 text-sm ${checked ? "bg-red text-paper" : "bg-paper text-ink"}`}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
