import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

/**
 * Teks gaya "surat kaleng": tiap huruf ditempel di kartu polygon acak,
 * dengan font, warna, ukuran, dan rotasi yang berbeda-beda.
 * Acaknya deterministik (seed dari teks), jadi tampilan selalu sama tiap render.
 *
 * Animasi "dicap" memakai CSS (.ransom-letter di index.css), bukan komponen Motion
 * per huruf: ada ±200 huruf di Home, dan ratusan komponen animasi membuat main
 * thread sibuk saat load (Lighthouse: TBT & forced reflow). Satu IntersectionObserver
 * bersama memasang data-inview saat teks masuk layar; delay per huruf lewat --i.
 */

type Tone = "mixed" | "light" | "dark";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  tone?: Tone;
  seed?: number;
  animate?: boolean;
  id?: string;
  /** false kalau induknya sudah punya teks sr-only sendiri (mis. h1 di hero) */
  srText?: boolean;
}

interface Card {
  bg: string;
  fg: string;
  edge: string;
}

const INK = "var(--color-ink)";
const PAPER = "var(--color-paper)";
const RED = "var(--color-red)";

const CARDS: Record<Tone, Card[]> = {
  mixed: [
    { bg: PAPER, fg: INK, edge: INK },
    { bg: INK, fg: PAPER, edge: PAPER },
    { bg: RED, fg: PAPER, edge: INK },
    { bg: PAPER, fg: RED, edge: INK },
    { bg: INK, fg: PAPER, edge: PAPER },
  ],
  light: [
    { bg: PAPER, fg: INK, edge: INK },
    { bg: PAPER, fg: RED, edge: INK },
    { bg: INK, fg: PAPER, edge: PAPER },
  ],
  dark: [
    { bg: INK, fg: PAPER, edge: PAPER },
    { bg: PAPER, fg: INK, edge: INK },
    { bg: INK, fg: RED, edge: PAPER },
  ],
};

const FONTS: CSSProperties[] = [
  { fontFamily: "var(--font-display)", textTransform: "uppercase" },
  { fontFamily: "var(--font-inter)", fontWeight: 900, fontStyle: "italic" },
  { fontFamily: "var(--font-serif)", fontWeight: 700 },
  { fontFamily: "var(--font-display)", textTransform: "uppercase" },
  { fontFamily: "var(--font-inter)", fontWeight: 800, textTransform: "lowercase" },
  // font dialog game
  { fontFamily: "var(--font-sans)", textTransform: "uppercase" },
];

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

function polygon(r: () => number, amount: number) {
  const j = () => (r() * amount).toFixed(1);
  return `polygon(${j()}% ${j()}%, ${100 - +j()}% ${j()}%, ${100 - +j()}% ${100 - +j()}%, ${j()}% ${100 - +j()}%)`;
}

/** satu observer untuk semua RansomText: pasang data-inview sekali, lalu berhenti mengamati */
let observer: IntersectionObserver | null = null;
function observe(el: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute("data-inview", "");
        observer?.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  observer.observe(el);
  return () => observer?.unobserve(el);
}

export function RansomText({
  text,
  as: Tag = "span",
  className = "",
  tone = "mixed",
  seed,
  animate = true,
  id,
  srText = true,
}: Props) {
  const r = rng(seed ?? hash(text));
  const palette = CARDS[tone];
  const words = text.split(" ");
  let n = 0;

  const lettersRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (animate && lettersRef.current) return observe(lettersRef.current);
  }, [animate]);

  return (
    <Tag id={id} className={`leading-[1.15] ${className}`}>
      {srText && <span className="sr-only">{text}</span>}
      <span ref={lettersRef} aria-hidden className="inline">
        {words.map((word, wi) => (
          <span key={wi}>
            {wi > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((ch) => {
                const i = n++;
                // huruf pertama tiap kata sedikit lebih besar, seperti di judul game
                const scale = (wi === 0 && i === 0 ? 1.18 : 0.86) + r() * 0.24;
                const rotate = (r() - 0.5) * 14;
                const y = (r() - 0.5) * 0.12;
                const card = palette[Math.floor(r() * palette.length)];
                const font = FONTS[Math.floor(r() * FONTS.length)];
                const shape = polygon(r, 12);
                const edge = polygon(r, 6);
                return (
                  <span
                    key={i}
                    className={`relative mx-[0.02em] inline-block px-[0.12em] py-[0.04em] align-middle ${
                      animate ? "ransom-letter" : ""
                    }`}
                    style={
                      {
                        fontSize: `${scale}em`,
                        color: card.fg,
                        transform: `translateY(${y}em) rotate(${rotate}deg)`,
                        "--y": `${y}em`,
                        "--r": `${rotate}deg`,
                        "--r0": `${rotate * 3}deg`,
                        "--i": i,
                        ...font,
                      } as CSSProperties
                    }
                  >
                    <span
                      className="absolute -inset-[0.07em]"
                      style={{ background: card.edge, clipPath: edge }}
                    />
                    <span
                      className="absolute inset-0"
                      style={{ background: card.bg, clipPath: shape }}
                    />
                    <span className="relative">{ch}</span>
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
