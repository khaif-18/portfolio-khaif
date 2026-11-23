// Silhouette pejalan kaki hasil tools/export_assets.py (export_crowd).
export const CROWD_FRAMES = Object.values(
  import.meta.glob<string>("../assets/crowd/*.webp", { eager: true, import: "default" }),
);
