import { Fragment, type ReactNode } from "react";

/**
 * Panah SVG yang center secara OPTIS terhadap huruf di sebelahnya.
 *
 * Glyph → ← ↗ tidak ada di Anton maupun font dialog, jadi browser mengambilnya
 * dari font cadangan dan meletakkannya di "math axis" (sekitar tengah huruf
 * kecil). Di sebelah teks kapital, panah itu terlihat terlalu rendah dan tipis.
 *
 * Komponen ini menaruh tengah panah di tengah tinggi huruf kapital font yang
 * sedang dipakai (--cap-mid, diatur per font di index.css dari metrik font),
 * dan tebal garisnya mengikuti berat font (--arrow-stroke).
 */

type Dir = "right" | "left" | "up-right";

const PATHS: Record<Dir, string> = {
  right: "M3 12h17M13 5l7 7-7 7",
  left: "M21 12H4M11 5l-7 7 7 7",
  "up-right": "M6 18L18 6M8.5 6H18v9.5",
};

export function Arrow({ dir = "right", className = "" }: { dir?: Dir; className?: string }) {
  // panah diagonal secara visual lebih "padat"; sedikit lebih kecil supaya seimbang
  const size =
    dir === "up-right" ? "calc(var(--arrow-size, 0.85em) * 0.8)" : "var(--arrow-size, 0.85em)";
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        strokeWidth: "var(--arrow-stroke, 2.4)",
        // di konteks inline biasa: taruh tengah panah di tengah tinggi huruf kapital.
        // (di dalam flex, vertical-align diabaikan; items-center sudah memberi hasil sama
        // karena tengah kotak baris ≈ tengah huruf kapital untuk kedua font ini)
        verticalAlign: `calc(var(--cap-mid, 0.33em) - ${size} / 2)`,
      }}
    >
      <path d={PATHS[dir]} />
    </svg>
  );
}

const GLYPH: Record<string, Dir> = { "→": "right", "←": "left", "↗": "up-right" };

/** Ganti → ← ↗ di dalam string konten dengan <Arrow>, sisanya tetap teks. */
export function withArrows(text: string): ReactNode {
  if (!/[→←↗]/.test(text)) return text;
  const parts = text.split(/([→←↗])/);
  return parts.map((part, i) => {
    if (!GLYPH[part]) return <Fragment key={i}>{part}</Fragment>;
    // "16 → 18" sudah berjarak spasi; "87→19" belum, jadi beri ruang tipis
    const spaced = /\s$/.test(parts[i - 1] ?? "") && /^\s/.test(parts[i + 1] ?? "");
    return (
      <Fragment key={i}>
        <span className="sr-only">{part === "↗" ? "(opens site)" : "to"}</span>
        <Arrow dir={GLYPH[part]} className={spaced ? "" : "mx-[0.12em]"} />
      </Fragment>
    );
  });
}
