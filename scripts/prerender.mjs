// Prerender: isi #root setiap halaman dengan HTML hasil render React saat build,
// plus tag SEO (canonical, Open Graph, JSON-LD), sitemap.xml, dan robots.txt.
//
// Urutan build (lihat "build" di package.json):
//   1. vite build                                   -> dist/ (aset + index.html template)
//   2. vite build --ssr src/entry-server.tsx ...    -> dist-ssr/entry-server.js (Node)
//   3. node scripts/prerender.mjs                   -> dist/index.html, dist/projects/<slug>.html,
//                                                      dist/404.html, dist/sitemap.xml, dist/robots.txt
//
// Browser lalu menghidrasi HTML ini (src/main.tsx), jadi isi halaman sudah terlihat
// sebelum JS selesai dimuat, dan crawler / preview link sosial mendapat teks lengkap.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

/**
 * Origin absolut situs (canonical, og:url, og:image, sitemap butuh URL lengkap).
 *   1. SITE_URL, kalau di-set (mis. domain sendiri nanti)
 *   2. VERCEL_PROJECT_PRODUCTION_URL: diisi Vercel saat build, berisi domain produksi
 *      (otomatis berganti ke domain custom begitu dipasang). Deploy preview pun memakai
 *      domain produksi, jadi canonical selalu menunjuk ke versi asli.
 *   3. cadangan: nama project Vercel default
 */
const SITE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://khalifah-portfolio.vercel.app"
).replace(/\/+$/, "");
const abs = (p) => (p === "/" ? `${SITE}/` : SITE + p);

const { render, pages } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** JSON aman di dalam <script>: "</script>" di teks tidak boleh menutup tag */
const jsonLd = (o) => JSON.stringify(o).replace(/</g, "\u003c");

/** ganti nilai satu tag; gagal keras kalau tag-nya tidak ada (template berubah) */
function replaceOnce(html, pattern, value, label) {
  if (!pattern.test(html)) throw new Error(`prerender: ${label} tidak ditemukan di index.html`);
  return html.replace(pattern, value);
}

function headTags(page) {
  const url = abs(page.url);
  const image = abs(page.image);
  const tags = page.noindex
    ? ['<meta name="robots" content="noindex" />']
    : [
        `<link rel="canonical" href="${esc(url)}" />`,
        `<meta property="og:url" content="${esc(url)}" />`,
      ];
  tags.push(
    `<meta property="og:site_name" content="Khalifah Erian" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(page.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  if (page.schema)
    tags.push(`<script type="application/ld+json">${jsonLd(page.schema(SITE))}</script>`);
  return tags.map((t) => `    ${t}\n`).join("");
}

for (const page of pages) {
  if (!fs.existsSync(path.join(dist, page.image)))
    throw new Error(`prerender: ${page.image} tidak ada. Jalankan: python tools/og_images.py`);
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
  html = replaceOnce(html, /\n\s*<\/head>/, `\n${headTags(page)}  </head>`, "</head>");
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

// sitemap: hanya halaman yang boleh diindeks. Tanpa <lastmod>: tanggal build bukan
// tanggal konten berubah, dan Google mengabaikan lastmod yang tidak akurat.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .filter((p) => !p.noindex)
  .map((p) => `  <url><loc>${esc(abs(p.url))}</loc></url>`)
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
);
console.log(`prerender  sitemap.xml + robots.txt  (site: ${SITE})`);

// bundle Node hanya dibutuhkan untuk langkah ini
fs.rmSync(ssrDir, { recursive: true, force: true });
