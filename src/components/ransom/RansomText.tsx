import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";

/**
 * Teks gaya "surat kaleng": tiap huruf ditempel di kartu polygon acak,
 * dengan font, warna, ukuran, dan rotasi yang berbeda-beda.
 * Acaknya deterministik (seed dari teks), jadi tampilan selalu sama tiap render.
 *
 * Animasi "dicap" memakai CSS (.rl-a di index.css), bukan komponen Motion
 * per huruf: ada ±200 huruf di Home, dan ratusan komponen animasi membuat main
 * thread sibuk saat load (Lighthouse: TBT & forced reflow). Satu IntersectionObserver
 * bersama memasang data-inview saat teks masuk layar; delay per huruf lewat --i.
 *
 * Markup per huruf sengaja minimal (satu span, kelas pendek, 4 variabel CSS) karena
 * ikut tertulis di HTML prerender: warna, font, dan bentuk kertas dipilih dari kelas
 * tetap di index.css (rc*, rf*, rp*), bukan style inline per huruf.
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
  /**
   * Animasi langsung jalan dari HTML (tanpa menunggu JS/IntersectionObserver).
   * Untuk teks di layar pertama, seperti judul hero: di HTML hasil prerender
   * hurufnya langsung tergambar (penting untuk LCP).
   */
  eager?: boolean;
}

/**
 * Kombinasi warna (teks / kertas / tepi) per tone, sebagai indeks kelas .rc0-.rc4:
 *   0 tinta di kertas · 1 kertas di tinta · 2 kertas di merah · 3 merah di kertas · 4 merah di tinta
 * Nilai ganda (1 di "mixed") = peluang lebih besar.
 */
const CARDS: Record<Tone, number[]> = {
  mixed: [0, 1, 2, 3, 1],
  light: [0, 3, 1],
  dark: [1, 0, 4],
};
/** jumlah kelas font (.rf0-.rf5) dan bentuk kertas (.rp0-.rp7) di index.css */
const FONTS = 6;
const SHAPES = 8;

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

/** angka pendek untuk style: 2 desimal, tanpa nol di belakang */
const num = (v: number) => String(Math.round(v * 100) / 100);

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
  eager = false,
}: Props) {
  const r = rng(seed ?? hash(text));
  const palette = CARDS[tone];
  const words = text.split(" ");
  let n = 0;

  const lettersRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (animate && !eager && lettersRef.current) return observe(lettersRef.current);
  }, [animate, eager]);

  return (
    <Tag id={id} className={`leading-[1.15] ${className}`}>
      {srText && <span className="sr-only">{text}</span>}
      <span
        ref={lettersRef}
        aria-hidden
        className="inline"
        data-inview={animate && eager ? "" : undefined}
      >
        {words.map((word, wi) => (
          // spasi di luar .rw supaya baris bisa patah di antara kata, tidak di dalamnya
          <Fragment key={wi}>
            {wi > 0 && " "}
            <span className="rw">
              {[...word].map((ch) => {
                const i = n++;
                // huruf pertama tiap kata sedikit lebih besar, seperti di judul game
                const scale = (wi === 0 && i === 0 ? 1.18 : 0.86) + r() * 0.24;
                const rotate = (r() - 0.5) * 14;
                const y = (r() - 0.5) * 0.12;
                const card = palette[Math.floor(r() * palette.length)];
                const font = Math.floor(r() * FONTS);
                const shape = Math.floor(r() * SHAPES);
                // dulu tiap huruf memakai 16 angka acak untuk dua polygon; tetap "dibuang"
                // supaya urutan acak (dan pilihan font/warna tiap huruf) sama seperti desain awal
                for (let k = 0; k < 15; k++) r();
                return (
                  <span
                    key={i}
                    className={`rl rc${card} rf${font} rp${shape}${animate ? " rl-a" : ""}`}
                    style={
                      {
                        "--s": num(scale),
                        "--r": `${num(rotate)}deg`,
                        "--y": `${num(y)}em`,
                        ...(animate && { "--i": i }),
                      } as CSSProperties
                    }
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
