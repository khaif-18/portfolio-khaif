import type { ReactNode } from "react";

type Tone = "dark" | "light" | "red" | "outline";

const tones: Record<Tone, string> = {
  dark: "bg-ink text-paper",
  light: "bg-paper text-ink",
  red: "bg-red text-paper",
  outline: "bg-transparent text-paper ring-1 ring-paper/40",
};

export function Tag({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`slant-sm inline-block px-3.5 py-1 text-xs font-bold tracking-wide uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
