import type { ReactNode } from "react";
import { RansomText } from "../ransom/RansomText";

/** Judul section: nomor + label kecil, lalu judul gaya surat kaleng. */
export function SectionHeading({
  index,
  kicker,
  title,
  tone = "mixed",
  children,
  className = "",
  id,
}: {
  index: string;
  kicker: string;
  title: string;
  tone?: "mixed" | "light" | "dark";
  children?: ReactNode;
  className?: string;
  /** id untuk h2; section memakainya lewat aria-labelledby (jadi landmark "region") */
  id?: string;
}) {
  return (
    <header className={`relative mb-12 ${className}`}>
      <p className="mb-3 flex items-center gap-3 font-display text-sm tracking-[0.3em] uppercase">
        <span className="slant-sm bg-red px-3 py-0.5 text-paper">{index}</span>
        <span className="opacity-80">{kicker}</span>
      </p>
      <RansomText
        as="h2"
        id={id}
        text={title}
        tone={tone}
        className="text-5xl sm:text-6xl md:text-7xl"
      />
      {children}
    </header>
  );
}
