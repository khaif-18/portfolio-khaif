import type { ComponentProps } from "react";
import { imageSize, sprite, spriteSrcSet, type SpriteName } from "../../lib/sprites";

type Props = Omit<ComponentProps<"img">, "src"> & { name: SpriteName };

/** Sprite dengan warna merah bawaan; di tema biru diputar warnanya (lihat .accent-art). */
const ACCENT_ART = new Set<SpriteName>([
  "critical",
  "star-red",
  "shards",
  "start",
  "new-skill",
  "end",
  "failed",
  "check",
]);

/**
 * Gambar dekoratif dari sprite sheet. Default-nya disembunyikan dari screen reader.
 * width/height asli selalu dipasang (rasio diketahui sebelum file datang, tanpa
 * layout shift); ukuran tampil tetap dari CSS. Beri `sizes` (lebar tampil, mis.
 * "6rem") untuk sprite yang punya varian kecil: browser memilih file lewat srcset.
 */
export function Sprite({ name, alt = "", className, sizes, ...rest }: Props) {
  const [width, height] = imageSize(`p5/${name}`) ?? [];
  const srcSet = sizes ? spriteSrcSet(name) : undefined;
  return (
    <img
      src={sprite(name)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      decoding="async"
      loading="lazy"
      className={ACCENT_ART.has(name) ? `accent-art ${className ?? ""}` : className}
      {...rest}
    />
  );
}

/** Angka yang digambar per digit memakai sprite angka. */
export function SpriteNumber({
  value,
  variant = "italic",
  className = "h-16",
  label,
}: {
  value: string;
  variant?: "italic" | "big";
  className?: string;
  label?: string;
}) {
  return (
    <span role="img" aria-label={label ?? value} className="inline-flex items-end">
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <Sprite
            key={i}
            name={`digit-${variant}-${Number(ch)}`}
            loading="eager"
            className={`${className} w-auto ${i > 0 ? "-ml-[0.15em]" : ""}`}
          />
        ) : (
          <span key={i} aria-hidden className="font-display leading-none text-red">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
