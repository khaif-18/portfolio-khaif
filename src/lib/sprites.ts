// Sprite hasil tools/export_assets.py. Nama file = kunci.
const files = import.meta.glob<string>("../assets/p5/*.webp", {
  eager: true,
  import: "default",
});

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
