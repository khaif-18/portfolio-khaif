export type Theme = "red" | "blue";

/** Kalau diubah, ubah juga di script kecil di index.html (anti-kedip). */
export const THEME_KEY = "p5-theme";

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "blue" ? "blue" : "red";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // mode privat / storage penuh: tema tetap berlaku untuk sesi ini
  }
  repaintScrollbar();
  window.dispatchEvent(new CustomEvent<Theme>("themechange", { detail: theme }));
}

/**
 * Chrome tidak menggambar ulang ::-webkit-scrollbar saat atribut tema berubah.
 * Mematikan lalu menyalakan overflow sesaat memaksa scrollbar dibuat ulang
 * (terjadi di balik panel wipe, jadi tidak terlihat; posisi scroll tetap).
 */
function repaintScrollbar() {
  const html = document.documentElement;
  const y = window.scrollY;
  html.style.overflow = "hidden";
  void html.offsetWidth;
  html.style.overflow = "";
  window.scrollTo(0, y);
}
