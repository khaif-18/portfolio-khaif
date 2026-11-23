import SIZES from "./image-sizes.json";

// Stiker lubang peluru hasil tools/export_assets.py (export_bullet_holes).
const files = import.meta.glob<string>("../assets/holes/*.webp", {
  eager: true,
  import: "default",
});
const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));
const sizes = SIZES as unknown as Record<string, [number, number]>;

export const HOLE_FRAMES = entries.map(([, url]) => url);
/** ukuran asli [lebar, tinggi] per URL frame, untuk atribut width/height */
export const HOLE_SIZE = new Map(
  entries.map(([path, url]) => [
    url,
    sizes[`holes/${path.split("/").pop()!.replace(".webp", "")}`] ?? [0, 0],
  ]),
);
