/**
 * Umumkan pesan singkat ke screen reader lewat live region global
 * (<Announcer /> di RootLayout). Untuk perubahan yang tidak terlihat oleh
 * pembaca layar: ganti tema, pindah halaman, jeda animasi.
 */
export function announce(message: string) {
  const el = document.getElementById("sr-announcer");
  if (!el) return;
  // kosongkan dulu supaya pesan yang sama berturut-turut tetap dibacakan
  el.textContent = "";
  window.setTimeout(() => {
    el.textContent = message;
  }, 60);
}

/**
 * Pindahkan fokus ke elemen non-interaktif (judul) tanpa menambahkannya ke urutan Tab.
 * Tab berikutnya melanjutkan dari situ, dan screen reader membacakan judulnya.
 */
export function focusHeading(el: HTMLElement | null) {
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
