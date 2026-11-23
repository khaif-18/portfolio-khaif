// Stiker lubang peluru hasil tools/export_assets.py (export_bullet_holes).
export const HOLE_FRAMES = Object.values(
  import.meta.glob<string>("../assets/holes/*.webp", { eager: true, import: "default" }),
);
