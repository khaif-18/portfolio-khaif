/**
 * Acak tapi deterministik: hasil yang sama di server (prerender, Node) dan di browser
 * mana pun. Penting untuk hidrasi: HTML hasil prerender harus identik dengan render
 * pertama di client.
 *
 * Jangan pakai `arr.sort(() => r() - 0.5)`: urutannya bergantung pada algoritma sort
 * engine JS (V8 vs SpiderMonkey vs JavaScriptCore), jadi Firefox/Safari bisa memilih
 * gambar yang berbeda dari HTML hasil Node.
 */

/** Fisher-Yates dengan generator acak sendiri (mis. rng(seed)); tidak mengubah array asal */
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
