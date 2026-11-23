import type { ComponentProps, ReactNode } from "react";
import { WipeLink } from "../transition/WipeLink";

type Variant = "red" | "light" | "dark";

const styles: Record<Variant, string> = {
  red: "bg-red text-paper shadow-[5px_5px_0_var(--color-ink)] hover:bg-paper hover:text-ink active:shadow-[0_0_0_var(--color-ink)] active:bg-ink active:text-paper",
  light:
    "bg-paper text-ink shadow-[5px_5px_0_var(--color-red)] hover:bg-red hover:text-paper active:shadow-[0_0_0_var(--color-red)] active:bg-red-deep active:text-paper",
  dark: "bg-ink text-paper shadow-[5px_5px_0_var(--color-red)] hover:bg-paper hover:text-ink active:shadow-[0_0_0_var(--color-red)] active:bg-red active:text-paper",
};

const base =
  "group inline-flex min-h-12 items-center gap-2 px-6 py-3 font-display text-lg tracking-wide uppercase select-none " +
  "-skew-x-6 transition-[translate,rotate,scale,background-color,color,box-shadow] duration-150 " +
  "hover:-translate-y-0.5 hover:-rotate-1 " +
  // ditekan: tombol turun ke posisi bayangannya (bayangan hilang), sedikit mengecil, warna terbalik.
  // durasi pendek supaya terasa langsung saat mouse/jari turun.
  "active:translate-x-[5px] active:translate-y-[5px] active:rotate-0 active:scale-[0.97] active:duration-75";

function Inner({ children }: { children: ReactNode }) {
  return <span className="inline-flex skew-x-6 items-center gap-2">{children}</span>;
}

type AnchorProps = ComponentProps<"a"> & { variant?: Variant; to?: undefined };
type RouteProps = { to: string; variant?: Variant; children: ReactNode; className?: string };

/** Tombol miring. Pakai `to` untuk route internal (page wipe), `href` untuk link biasa. */
export function Button(props: AnchorProps | RouteProps) {
  const { variant = "red", className = "", children } = props;
  const cls = `${base} ${styles[variant]} ${className}`;

  if (props.to !== undefined) {
    return (
      <WipeLink to={props.to} className={cls}>
        <Inner>{children}</Inner>
      </WipeLink>
    );
  }
  const { variant: _v, className: _c, children: _ch, ...rest } = props;
  return (
    <a className={cls} {...rest}>
      <Inner>{children}</Inner>
    </a>
  );
}
