import { m, type Variants } from "motion/react";
import type { CSSProperties, ElementType } from "react";

/**
 * Teks gaya "surat kaleng": tiap huruf ditempel di kartu polygon acak,
 * dengan font, warna, ukuran, dan rotasi yang berbeda-beda.
 * Acaknya deterministik (seed dari teks), jadi tampilan selalu sama tiap render.
 */

type Tone = "mixed" | "light" | "dark";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  tone?: Tone;
  seed?: number;
  animate?: boolean;
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

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

export function RansomText({
  text,
  as: Tag = "span",
  className = "",
  tone = "mixed",
  seed,
  animate = true,
}: Props) {
  const r = rng(seed ?? hash(text));
  const palette = CARDS[tone];
  const words = text.split(" ");
  let n = 0;

  return (
    <Tag className={`leading-[1.15] ${className}`}>
      <span className="sr-only">{text}</span>
      <m.span
        aria-hidden
        className="inline"
        variants={container}
        initial={animate ? "hidden" : false}
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
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
                  <m.span
                    key={i}
                    className="relative mx-[0.02em] inline-block px-[0.12em] py-[0.04em] align-middle"
                    style={{ fontSize: `${scale}em`, y: `${y}em`, color: card.fg, ...font }}
                    variants={{
                      hidden: { opacity: 0, scale: 1.8, rotate: rotate * 3 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        rotate,
                        transition: { type: "spring", stiffness: 520, damping: 22 },
                      },
                    }}
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
                  </m.span>
                );
              })}
            </span>
          </span>
        ))}
      </m.span>
    </Tag>
  );
}
