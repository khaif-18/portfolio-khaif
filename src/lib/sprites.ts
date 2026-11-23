import SIZES from "./image-sizes.json";

// Sprite hasil tools/export_assets.py. Nama file = kunci.
const files = import.meta.glob<string>("../assets/p5/*.webp", {
  eager: true,
  import: "default",
});
// varian kecil untuk srcset (tools/responsive_images.py)
const small = import.meta.glob<string>("../assets/p5-sm/*.webp", {
  eager: true,
  import: "default",
});
const sizes = SIZES as unknown as Record<string, [number, number]>;

export type SpriteName =
  | "mission"
  | "failed"
  | "clear"
  | "knife"
  | "ok"
  | "bonus"
  | "new-skill"
  | "burst-white"
  | "star-red"
  | "sparkle"
  | "weak"
  | "critical"
  | "start"
  | "burst"
  | "arrow"
  | "splash"
  | "frame"
  | "sparkles-gold"
  | "check"
  | "shards"
  | "frame-red"
  | "panel-profile"
  | "panel-black"
  | "panel-stack"
  | "city-night"
  | "tarot-back"
  | "tarot-blue-back"
  | `tarot-blue-${"fool" | "magician" | "chariot" | "star" | "sun"}`
  | `tarot-${"fool" | "magician" | "chariot" | "star" | "sun"}`
  | "cutin-joker"
  | "end"
  | "fin"
  | "top-hat"
  | "take-your-time"
  | "flame-strip"
  | `digit-italic-${number}`
  | `digit-big-${number}`;

export function sprite(name: SpriteName): string {
  const url = files[`../assets/p5/${name}.webp`];
  if (!url) throw new Error(`Sprite tidak ditemukan: ${name}`);
  return url;
}

/** ukuran asli [lebar, tinggi] dari tools/responsive_images.py (untuk atribut width/height) */
export function imageSize(key: string): [number, number] | undefined {
  return sizes[key];
}

/** srcset "kecil Nw, penuh Nw" kalau sprite punya varian kecil; selain itu undefined */
export function spriteSrcSet(name: SpriteName): string | undefined {
  const sm = small[`../assets/p5-sm/${name}.webp`];
  const smSize = sizes[`p5-sm/${name}`];
  const full = sizes[`p5/${name}`];
  if (!sm || !smSize || !full) return undefined;
  return `${sm} ${smSize[0]}w, ${sprite(name)} ${full[0]}w`;
}
