import SIZES from "./image-sizes.json";

// Silhouette pejalan kaki hasil tools/export_assets.py (export_crowd).
const files = import.meta.glob<string>("../assets/crowd/*.webp", {
  eager: true,
  import: "default",
});
const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));
const sizes = SIZES as unknown as Record<string, [number, number]>;

export const CROWD_FRAMES = entries.map(([, url]) => url);
/** ukuran asli [lebar, tinggi] per URL frame, untuk atribut width/height */
export const CROWD_SIZE = new Map(
  entries.map(([path, url]) => [
    url,
    sizes[`crowd/${path.split("/").pop()!.replace(".webp", "")}`] ?? [0, 0],
  ]),
);
