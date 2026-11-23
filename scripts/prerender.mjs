// Prerender: isi #root setiap halaman dengan HTML hasil render React saat build.
//
// Urutan build (lihat "build" di package.json):
//   1. vite build                                   -> dist/ (aset + index.html template)
//   2. vite build --ssr src/entry-server.tsx ...    -> dist-ssr/entry-server.js (Node)
//   3. node scripts/prerender.mjs                   -> dist/index.html, dist/projects/*/index.html, dist/404.html
//
// Browser lalu menghidrasi HTML ini (src/main.tsx), jadi isi halaman sudah terlihat
// sebelum JS selesai dimuat, dan crawler / preview link sosial mendapat teks lengkap.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, pages } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** ganti nilai satu tag; gagal keras kalau tag-nya tidak ada (template berubah) */
function replaceOnce(html, pattern, value, label) {
  if (!pattern.test(html)) throw new Error(`prerender: ${label} tidak ditemukan di index.html`);
  return html.replace(pattern, value);
}

for (const page of pages) {
  const app = await render(page.url);
  let html = template;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`, "<title>");
  html = replaceOnce(
    html,
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${esc(page.description)}$2`,
    "meta description",
  );
  html = replaceOnce(
    html,
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${esc(page.title)}$2`,
    "og:title",
  );
  html = replaceOnce(
    html,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${esc(page.description)}$2`,
    "og:description",
  );
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-prerendered="${esc(page.url)}">${app}</div>`,
    '<div id="root">',
  );
  const out = path.join(dist, page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(
    `prerender  ${page.url.padEnd(24)} -> dist/${page.file}  (${(html.length / 1024).toFixed(1)} KB)`,
  );
}

// bundle Node hanya dibutuhkan untuk langkah ini
fs.rmSync(ssrDir, { recursive: true, force: true });
