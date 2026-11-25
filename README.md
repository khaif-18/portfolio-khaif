# Portfolio · Muhammad Khalifah Erian

Portfolio pribadi bertema persona

**Stack:** Vite · React 19 · TypeScript · React Router (data router) · Motion · Tailwind CSS v4

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build ke dist/
npm run preview    # jalankan hasil build
npm run lint       # oxlint
npm run format     # prettier
```

---

## Update konten

Semua teks ada di `src/content/`. Untuk update portfolio, cukup edit file-file ini:

| File | Isi |
|---|---|
| `profile.ts` | nama, ringkasan, email, link (aktifkan baris GitHub), facts |
| `experience.ts` | angka "Critical hits" + daftar pengalaman kerja (Mission Log) |
| `projects.ts` | project (Targets) + halaman detail `/projects/:slug` |
| `skills.ts` | skill (Stats) + pendidikan/volunteer (Side quests) |

CV ada di `public/cv.pdf`. Kalau CV-mu berubah, ganti file itu.

---

## Aset

```
assets/                   sprite sheet asli + aset lepas (sumber)
assets/sliced/            hasil potongan otomatis (di-.gitignore, bisa dibuat ulang)
src/assets/p5/            sprite terpilih yang dipakai situs (webp)
tools/slice_sheets.py     potong semua sheet -> assets/sliced (+ _preview_*.jpg bernomor)
tools/export_assets.py    salin sprite terpilih -> src/assets/p5 (+ tarot, cut-in, crowd)
tools/responsive_images.py  varian kecil (src/assets/p5-sm) + ukuran asli (src/lib/image-sizes.json)
tools/og_images.py        gambar preview link 1200x630 -> public/og/ (home + per project)
tools/favicon.py          favicon "KE" (svg, png 96, ico, apple-touch-icon) -> public/
tools/build_font.py       atlas glyph (Miscellaneous - Font.png) -> src/assets/fonts/phantom-dialog.woff2
src/assets/crowd/         40 silhouette pejalan kaki (dibuat oleh export_assets.py)
src/assets/holes/         12 stiker lubang peluru (dibuat oleh export_assets.py)
```

Cara menambah sprite:
1. `python tools/slice_sheets.py`, lalu buka `assets/sliced/_preview_<sheet>.jpg` dan cari nomornya.
2. Tambahkan ke `PICKS` di `tools/export_assets.py`, lalu jalankan `python tools/export_assets.py` dan `python tools/responsive_images.py` (ukuran untuk width/height, dan varian kecil kalau perlu).
3. Tambahkan namanya ke `SpriteName` di `src/lib/sprites.ts`. Setelah itu sprite bisa dipakai lewat `<Sprite name="..." />`.

Butuh `pip install pillow numpy scipy` (font: tambah `potracer fonttools brotli`).

> Sprite di folder ini adalah artwork Persona 5 (© ATLUS / SEGA). Footer situs mencantumkan kreditnya. Untuk portfolio publik, pertimbangkan risikonya.

---

## Peta folder

```
src/
  main.tsx                 entry browser: font, hydrateRoot / createRoot
  routes.tsx               daftar rute (dipakai browser dan prerender)
  entry-server.tsx         render(url) + daftar halaman prerender (title, description, og:image, JSON-LD)
  index.css                warna (@theme), halftone, bentuk miring (clip-path), drop-shadow
  app/
    RootLayout.tsx         LazyMotion + MotionConfig + WipeProvider + header/footer
    motionFeatures.ts      fitur animasi, dimuat sebagai chunk terpisah
  content/                 SEMUA TEKS
  lib/sprites.ts           peta nama sprite -> URL
  lib/prefs.ts, announce.ts  preferensi (jeda gerakan, shortcut) + live region
  components/
    ransom/RansomText.tsx  teks "surat kaleng": tiap huruf di kartu polygon acak
    crowd/                 CrowdWalk (pejalan kaki), CrowdStreet (pembatas section)
    transition/            page wipe (WipeProvider, WipeLink, useWipe)
    layout/                Header, Footer, ThemeToggle, ScrollHud
  theme/                   theme.ts (baca/simpan tema), useTheme.ts
    ui/                    Button, Tag, SectionHeading, Sprite, SpriteNumber, TarotCard, Arrow
    fx/                    PressFx (feedback tekan global)
    a11y/                  Shortcuts (panel Controls), RouteFocus, Announcer
  sections/                Hero, About, Experience, Projects, Skills, Contact
  pages/                   Home, ProjectDetail, NotFound
  lib/random.ts            shuffle() deterministik (aman untuk hidrasi)
scripts/prerender.mjs      tulis HTML tiap halaman + sitemap.xml + robots.txt ke dist/ (langkah terakhir npm run build)
```

## Catatan teknis

- **RansomText**: huruf "surat kaleng" di game bukan font, melainkan huruf biasa di atas kartu polygon. Karena itu efeknya dibuat ulang dengan campuran Anton, Inter, serif, dan Phantom Dialog, ditambah potongan kertas `clip-path` dan rotasi. Acaknya deterministik (seed dari teks), jadi tampilannya selalu sama. Screen reader membaca teks utuh lewat `sr-only`. Markup tiap huruf hanya satu `<span class="rl rc* rf* rp*">` dengan empat variabel CSS (`--s`, `--r`, `--y`, `--i`): warna (`rc0-4`), font (`rf0-5`), dan 8 bentuk kertas (`rp0-7`, digambar `::before`/`::after`) ada di `index.css`. Menambah font atau bentuk berarti menambah kelas di CSS dan menaikkan `FONTS`/`SHAPES` di komponen.
- **Font "Phantom Dialog"**: atlas glyph bitmap dari game (16 kolom × 32 px, mulai U+0020) di-trace dengan potrace menjadi font CFF/WOFF2. Isinya hanya ASCII. Glyph `- / \ ~` di atlas berbentuk lebar (full-width), jadi sengaja dibuang dan jatuh ke Inter, begitu juga simbol seperti → · ↗. Font ini cuma punya satu ketebalan, jadi `font-synthesis: none` mencegah browser memalsukan bold/italic.
- **Crowd (`CrowdWalk`)**: silhouette dari game berupa pose diam, bukan siklus jalan. Efek berjalan dibuat dengan CSS (`crowd-walk` untuk melintas, `crowd-step` untuk naik-turun dan goyang). JS hanya mengubah `playbackRate` lewat `getAnimations()`: scroll cepat membuat crowd berjalan cepat, scroll ke atas membuat mereka mundur. Animasi dijeda di luar layar (IntersectionObserver). Orang dibagi ke tiga lapis kedalaman dengan kecepatan yang sama per lapis, jadi jaraknya tidak pernah menyusut. Saat berjalan mundur, jam animasi dimundurkan sejauh kelipatan durasi sebelum mentok di 0. Kalau mentok, animasi akan "finished" dan semua orang menumpuk di tepi kiri. Dipakai di hero, pembatas `CrowdStreet`, Calling Card, dan page wipe.
- **Tema merah / biru**: atribut `data-theme` di `<html>`. Token `--color-red` sebenarnya berarti warna *aksen*: tema biru cukup mengganti nilainya di `index.css`, dan semua `bg-red`/`text-red` ikut berubah. Sprite yang merahnya sudah tertanam di gambar (CRITICAL, bintang, dll.) diberi kelas `accent-art` secara otomatis oleh `<Sprite>`, lalu diputar hue-nya di tema biru. Kartu tarot memakai set biru asli dari sheet. Pergantian tema berjalan di balik page wipe (`useWipeRun`). Pilihan tema disimpan di `localStorage` (`p5-theme`), dan script kecil di `index.html` memasangnya sebelum React jalan supaya tidak ada kedipan warna.
- **Scroll**: ada dua lapis.
  - *Scrollbar bawaan*: track bergaris diagonal dengan garis aksen di tepi, thumb bergaris miring dengan bingkai putih, dan versi terbalik saat hover. Warnanya ditulis per tema, bukan lewat CSS variable, karena Chrome tidak selalu menggambar ulang scrollbar saat variable berubah. `applyTheme()` memaksa scrollbar digambar ulang (`repaintScrollbar`). Firefox hanya mendukung warna (`scrollbar-color`), tanpa pola.
  - *ScrollHud* (`components/layout/ScrollHud.tsx`): di layar ≥ xl tampil rel kanan dengan penanda tiap section (bisa diklik, section aktif disorot), bintang yang turun dan berputar mengikuti scroll, dan persentase. Di bawah xl berubah jadi pita progress tipis di atas, karena rel kanan akan bertabrakan dengan konten. Daftar section diambil dari `content/nav.ts`, sama dengan Header.
- **Tarot**: tiap project punya `arcana` di `projects.ts`. `TarotCard` punya dua mode:
  - `reveal` (Targets, kartu Fool di Profile): diam menampilkan punggung kartu.
  - `front` (halaman project): diam menampilkan muka kartu.

  Saat di-hover, kartu ditembak tiga kali. Tembakan 1 dan 2: kilat putih, lalu bekas peluru (kartu tersentak sedikit). Tembakan 3: kilat putih, bekas peluru, lalu momentum peluru membuat kartu ter-flip beberapa kali pada poros vertikal (cepat lalu melambat, sedikit terangkat, goyang kecil sebelum diam). Hasil akhirnya muka kartu dengan 3 bekas peluru. Lubang ada di kedua sisi kartu karena peluru menembus. Di Targets, hover di mana pun pada kartu project ikut memicunya (prop `shot`). Animasi memakai Web Animations API langsung supaya waktu tiap keyframe bisa diatur presisi; konstanta waktunya (`SHOT_TIMES`, `FLIP_MS`, jumlah putaran) ada di atas `TarotCard.tsx`. Di layar sentuh, mode `reveal` diperlakukan seperti `front`. Kalau "kurangi gerakan" aktif, kartu langsung berganti pose tanpa animasi.
- **Lubang peluru**: `export_bullet_holes()` membandingkan dua baris kartu terbalik yang identik di sheet Tarot. Baris terakhir sudah ditembak, jadi selisih pikselnya adalah lubangnya saja. Hasilnya 12 stiker abu-abu (`src/assets/holes/`) yang cocok untuk kartu merah maupun biru. Empat komponen yang ternyata dua lubang menyatu dikeluarkan lewat `MERGED_HOLES`. Posisi lubang deterministik per kartu.
- **Panjang baris**: paragraf dan bullet panjang memakai kelas `measure` (`max-width: 50ch`). Angka ini hasil ukur: huruf font dialog rata-rata lebih sempit dari angka "0" (patokan unit `ch`), jadi 50ch ≈ 70 karakter. Paragraf hero diberi lebar per breakpoint supaya tidak masuk ke blok aksen miring: diukur minimal 50 px dari tepi miring di layar ≥ 1024 px. Di bawah 1024 px blok miringnya dibuat transparan dan melebar penuh, seperti di mobile.
- **Kartu misi**: di layar ≥ 1024 px isi kartu dibagi dua kolom. Kiri berisi identitas misi (tanggal, perusahaan, peran, intro) dan menempel saat di-scroll (`sticky`). Kanan berisi fase dan bullet. Lebar kartu jadi terisi tanpa membuat baris kepanjangan. Section-nya memakai `overflow-x-clip`, bukan `overflow-hidden`, karena `hidden` membuat section jadi kontainer scroll dan sticky tidak berfungsi. Gambar panel berbingkai emas hanya dipakai di layar ≥ 1024 px. Di layar lebih sempit kartu jauh lebih tinggi, gambarnya tertarik vertikal dan pita emasnya menimpa teks, jadi diganti bingkai emas dari CSS (`.mission-panel`).
- **Optical center**:
  - *Panah*: glyph → ← ↗ tidak ada di Anton maupun font dialog. Browser mengambilnya dari font cadangan dan meletakkannya di tengah huruf kecil, sehingga di sebelah teks kapital panahnya terlihat sekitar 0,13 em terlalu rendah dan tipis. Semua panah sekarang memakai `<Arrow>` (SVG). Tengahnya dikunci ke tengah tinggi huruf kapital font aktif (`--cap-mid`: Anton 0,43 em, font dialog 0,305 em, dari metrik font), dan tebal garisnya mengikuti font (`--arrow-stroke`). String konten yang berisi panah diproses `withArrows()`. Terukur: tengah panah dalam ±1,1 px dari tengah huruf kapital.
  - *Label dalam kotak* (tombol, tag, chip, badge): diukur dari tinta teks sebenarnya. Semuanya 0,5–1 px di atas tengah geometris, sesuai prinsip optical center, jadi sengaja dibiarkan. Metrik Anton dan font dialog sudah seimbang (pusat kapital 0,006 em dan 0,024 em dari pusat kotak teks), jadi tidak perlu `ascent-override`.
  - Kotak "FRONTEND DEVELOPER" dulu 2 px terlalu tinggi karena spasi baseline elemen inline-block; isinya sekarang `block`. "+" di kartu "3+" sejajar tengah angka. Penanda ▸ diganti wajik CSS, dan wajik di tombol tema dikecilkan supaya sebanding dengan tinggi huruf kapital.
- **Interaksi & target sentuh**:
  - *Kursor*: tiga kursor SVG bertema di `index.css` (`--cursor-default`, `--cursor-target`, `--cursor-press`), hanya untuk `pointer: fine`. Semua yang bisa diklik (`a[href]`, `button`, `[role="button"]`, `[data-cursor="target"]`) memakai kursor bidikan. Bagian yang cuma bereaksi hover tapi tidak bisa diklik tidak boleh ada: kalau sesuatu bergerak saat di-hover, ia harus bisa ditekan. Preflight Tailwind v4 membuat `<button>` ber-kursor default, jadi dikembalikan ke `pointer` sebagai cadangan.
  - *Saat ditekan*: `PressFx` (global) memunculkan bidikan wajik di titik tekan yang mengunci selama ditahan, dan `<html data-press>` mengganti kursor. Dilepas di atas elemen yang sama = pecah jadi serpihan (klik terjadi). Digeser keluar dulu = pudar (batal). Efek hanya muncul di elemen yang bisa diklik. Tiap komponen juga punya state `:active` sendiri: tombol turun ke posisi bayangannya, nav/toggle mengecil, kartu project `whileTap`. Listener `touchstart` kosong membuat `:active` jalan di iOS.
  - *Kartu project*: seluruh kartu bisa diklik dan membuka case file (Ctrl/Cmd+klik = tab baru). Klik saat sedang memilih teks diabaikan. Link "Case file" tetap jadi target keyboard.
  - *Tarot mandiri* (About, halaman project): `role="button"`. Mouse: hover = tembak, klik = tembak ulang. Sentuh: tap = tembak, tap lagi = kembali. Keyboard: Enter/Spasi.
  - *Ukuran*: semua target sentuh ≥ 44 px di layar sentuh (diukur di 390 px): tombol `min-h-12`, item menu mobile `py-3`, toggle `pointer-coarse:min-h-11`, penanda ScrollHud diberi padding area klik.
- **Aksesibilitas: kontras & fokus**:
  - *Kontras*: merah asli game (`#e60012`) dengan putih hanya 4.41:1, kurang tipis dari WCAG AA 4.5:1 untuk teks kecil. Satu warna aksen tidak mungkin lolos sekaligus di atas putih dan di atas hitam (rentang luminansinya tidak beririsan), jadi aksen dibagi dua token. `--color-red` (`#e00012`, biru `#0861ff`) untuk bidang dan teks di atas putih: 4.62:1. `--color-red-bright` (`#ff3e4d`, biru `#4186ff`) untuk teks kecil di atas hitam: 5.7:1. Teks besar (≥ 24 px, atau Anton ≥ 18.66 px) cukup 3:1. Teks putih transparan di atas aksen dihindari (`text-paper/90` jatuh ke 3.7:1).
  - *Cara ukur*: halaman difoto dua kali, normal dan dengan semua teks transparan. Piksel yang berbeda adalah glyph, dan kontras dihitung antara keduanya di piksel inti glyph. Jadi latar gambar, halftone, gradien, dan opacity ikut terhitung apa adanya.
  - *Focus ring*: `:focus-visible` ditulis di luar `@layer` supaya selalu menang atas utility Tailwind (bayangan tombol, `clip-path`). Cincinnya dua warna: ink rapat ke elemen, paper di luarnya, jadi terlihat di latar apa pun. `clip-path` dilepas saat fokus karena bentuk miring memotong outline. Kartu tarot memakai `::after`, karena sisi kartu (lapisan 3D) digambar di atas outline induknya. `scroll-padding-top` menjaga elemen yang di-Tab tidak tertutup header fixed.
  - *Urutan Tab*: kartu project diberi `tabIndex={-1}` (Motion otomatis memberi `tabindex=0` pada elemen ber-`whileTap`). Untuk keyboard sudah ada link "Case file".
- **Keyboard & screen reader**:
  - *Shortcut* (`components/a11y/Shortcuts.tsx`): `1`–`5` lompat ke section, `J`/`K` section berikut/sebelumnya, `0` ke atas, `T` ganti tema, `P` jeda animasi, `?` panel Controls (juga tombol "Keyboard controls" di footer). Lompatan memindah **fokus** ke judul section (bukan cuma scroll), jadi Tab berikutnya melanjutkan dari sana. Shortcut diabaikan saat Ctrl/Alt/Cmd ditekan, saat mengetik di field, dan saat panel terbuka. Karena shortcut satu tombol bisa bentrok dengan screen reader atau voice control, shortcut bisa dimatikan dari panel (WCAG 2.1.4, disimpan di `p5-shortcuts`). Panelnya `<dialog>` native: fokus terkunci, Esc menutup, dan fokus kembali ke tempat semula.
  - *Pindah halaman* (`RouteFocus`): setelah route berganti, fokus dipindah ke `h1`, atau ke judul section kalau ada hash (`/#targets`). Tanpa ini, fokus jatuh ke `<body>` dan screen reader diam. Judul yang menerima fokus lewat skrip memakai `tabindex="-1"` (tidak masuk urutan Tab, tanpa cincin).
  - *Pengumuman* (`announce()` + live region `#sr-announcer`): ganti tema, jeda animasi, dan shortcut on/off dibacakan.
  - *Jeda gerakan*: tombol di ujung ticker, shortcut `P`, dan switch di panel menjeda ticker, kerumunan, dan api (`html[data-motion="paused"]`, disimpan di `p5-motion`, dipasang anti-kedip di `index.html`). Ticker juga berhenti saat di-hover. Ini syarat WCAG 2.2.2 untuk konten bergerak > 5 detik, terlepas dari setelan "kurangi gerakan" di OS.
  - *Esc* menutup menu mobile dan mengembalikan fokus ke tombol Menu.
  - *Struktur*: tiap section punya `aria-labelledby` ke judulnya, jadi muncul di daftar landmark screen reader. `RansomText` menulis teks utuh di `sr-only` dan menyembunyikan huruf-hurufnya (`srText={false}` kalau induknya sudah punya label, seperti `h1` hero). Rel ScrollHud adalah duplikat nav utama, jadi `aria-hidden` dan keluar dari urutan Tab. Nama link logo memuat teks yang terlihat ("KE KHALIFAH, home") supaya cocok untuk voice control. Hasil axe-core: 0 pelanggaran di Home, halaman project, dan 404.
- **Performance** (Lighthouse 13, build production, median 3 run):

  | Halaman | Profil | Awal | Optimasi SPA | + Prerender |
  | --- | --- | --- | --- | --- |
  | Home | mobile | 94 · LCP 2.06 s · TBT 191 ms | 97 · LCP 1.71 s · TBT 138 ms | 98 · LCP 1.22 s · TBT 162 ms |
  | Home | desktop | 92 · LCP 1.32 s · TBT 165 ms | 100 · LCP 0.21 s · TBT 58 ms | 100 · LCP 0.34 s · TBT 4 ms |
  | Project | mobile | 88 · LCP 3.27 s | 91 · LCP 3.33 s · TBT 64 ms | 96 · LCP 2.84 s · TBT 18 ms |
  | Project | desktop | 100 | 100 | 100 · LCP 0.70 s · TBT 0 ms |

  SEO 92 → 100 (`public/robots.txt`), accessibility 100.
  - *RansomText tanpa Motion*: ±200 huruf dulu masing-masing komponen Motion. Sekarang `<span>` biasa dengan animasi CSS (`.rl-a`) dan satu IntersectionObserver bersama. Akibatnya forced reflow di frame loop Motion hilang, TBT turun, dan huruf hero (elemen LCP desktop) tergambar sejak frame pertama animasi.
  - *RansomText ringkas*: tiap huruf dulu 4 elemen dengan style inline panjang (angka 16 digit, dua polygon), sekitar 700 byte per huruf di HTML prerender. Sekarang satu elemen sekitar 90 byte. HTML Home 213KB → 125KB (gzip 35.6 → 20.5KB), halaman project 42 → 27KB, dan TBT mobile Home (lokal) turun dari ±300ms ke ±140ms karena DOM yang diparse dan dihidrasi jauh lebih sedikit.
  - *Gambar tidak di-inline ke JS*: `assetsInlineLimit` di `vite.config.ts`. Sebelumnya 27 sprite < 4 KB = 75 KB base64 di bundle utama. Bundle: 206 → 147 KB gzip.
  - *Ukuran file sesuai tampilan*: latar kota grayscale q40 (144 → 68 KB, varian HP 640 px 35 KB lewat `srcset`), kartu tarot varian 128 px untuk Home (41 → 11 KB per kartu), sparkles 480 → 320 px. Pakai `<Sprite sizes="...">`, dan `TarotCard` meneruskan `sizes`.
  - *width/height* asli di setiap sprite, frame crowd, dan lubang peluru (dari `image-sizes.json`).
  - *Prioritas unduh*: silhouette di panel wipe `fetchPriority="low"` (harus termuat, tapi jangan berebut dengan hero). Latar kota tanpa `fetchPriority="high"` karena bukan elemen LCP. Splash (elemen LCP halaman project) `fetchPriority="high"`.
  - *ScrollHud* mengukur posisi section maksimal sekali per frame (dulu tiap ResizeObserver terpicu saat gambar termuat).
  - *Route project tidak di-lazy*: chunk-nya ±2 KB, sedangkan lazy menambah satu round-trip.
  - *Sisa yang disengaja*: best-practices mobile 96 karena silhouette kerumunan "resolusi rendah" (sumber aslinya memang sekecil itu; meng-upscale hanya menambah byte). LCP simulasi mobile halaman project ±2.8 s (nyata ±0.25 s). react-dom (202 KB) dan react-router (95 KB) mendominasi bundle.
- **Bayangan di elemen ber-`clip-path`**: `box-shadow` ikut terpotong. Pakai kelas `ds-red` / `ds-ink` / `ds-paper` (`filter: drop-shadow`) di elemen **pembungkus**.
- **Page wipe**: panel menutup layar, lalu `await navigate(to)` (di data router, ini menunggu chunk lazy selesai dimuat), lalu panel membuka. `WipeLink` tetap merender `<a href>` asli, jadi Ctrl+klik dan klik tengah tetap membuka tab baru.
- **Motion**: `LazyMotion strict` + `m.*`, fitur dimuat async. `MotionConfig reducedMotion="user"`, page wipe dilewati kalau "kurangi gerakan" aktif.
- **Prerender (SSG)**: `npm run build` menjalankan tiga langkah: build client, build SSR `src/entry-server.tsx` ke `dist-ssr/`, lalu `scripts/prerender.mjs`. Skrip itu merender tiap halaman (`pages` di `entry-server.tsx`) dengan `createStaticHandler` + `StaticRouterProvider` + `renderToString`, lalu menulis `dist/index.html`, `dist/projects/<slug>.html`, dan `dist/404.html`, masing-masing dengan `<title>`, description, dan `og:*` sendiri. Isi halaman sudah tampil sebelum JS dimuat, dan crawler serta preview link sosial mendapat teks lengkap. Tanpa JS pun halaman tetap terbaca (`<noscript>` di `index.html` menampilkan elemen yang animasi masuknya tidak sempat jalan).
  - *Hidrasi*: `#root` diberi `data-prerendered="<url>"`. `main.tsx` memakai `hydrateRoot` hanya kalau nilainya sama dengan URL sekarang. Kalau beda (server yang menyajikan `index.html` untuk semua URL, atau URL ber-garis miring di akhir), HTML dibuang dan dirender biasa, jadi tidak ada hydration mismatch.
  - *Aturan supaya HTML server = render pertama client*: (1) jangan baca `window`/`matchMedia`/`localStorage` saat render. Pakai effect, atau `useSyncExternalStore` dengan nilai server (contoh `useCanHover` di `TarotCard`, `useTheme`, `usePref`). (2) Acak harus deterministik: `shuffle()` di `lib/random.ts`, bukan `sort(() => r() - 0.5)`, karena hasilnya beda antar engine JS. (3) Nilai yang wajar berbeda (tahun di footer) diberi `suppressHydrationWarning`.
  - *Animasi masuk layar pertama* (lokasi, kotak role, kartu statistik hero, tarot header project) memakai CSS (`.enter-*` di `index.css`), bukan Motion: Motion merender keadaan awal (`opacity: 0`) di HTML dan baru jalan setelah hidrasi. Judul hero dan nama project memakai `RansomText eager` (animasi langsung jalan tanpa IntersectionObserver).
  - *Preload otomatis React*: saat SSR, React 19 membuat `<link rel="preload">` untuk setiap `<img>` yang tidak `loading="lazy"`. Jadi hanya gambar layar pertama yang boleh eager (`SpriteNumber eager` untuk angka di hero/header). Lubang peluru dan kilatan tarot lazy, dan gambar panel wipe baru dirender setelah browser idle.
  - *Rute baru*: tambahkan ke `routes.tsx`, dan kalau perlu di-prerender, ke `pages` di `entry-server.tsx`.
- **CI/CD**: Vercel terhubung ke repo GitHub. Push ke `main` = deploy produksi, branch lain = preview URL. `npm run build` menjalankan `oxlint` → `tsc -b` → build → prerender; kalau salah satunya gagal, deploy dibatalkan dan versi live sebelumnya tetap tayang. Node dikunci lewat `engines` (22.x). Belum ada GitHub Actions (YAGNI): tambahkan kalau mulai kerja lewat pull request bersama orang lain atau punya tes otomatis.
- **Deploy**: hasil `dist/` statis. Vercel: `vercel.json` memberi `/assets/*` (nama ber-hash) cache 1 tahun `immutable`, `/og/*` cache 1 hari, dan header keamanan dasar (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`). `cleanUrls` menyajikan `/projects/kaether` dari `projects/kaether.html`, dan URL yang tidak ada mendapat `404.html` dengan status 404. Netlify: `public/_redirects` mengarahkan URL yang tidak ada ke `/404.html` (404). File `<slug>.html` (bukan `<slug>/index.html`) dipilih supaya `/projects/<slug>` tanpa garis miring juga tersaji di `vite preview` dan GitHub Pages.
- **SEO**: `scripts/prerender.mjs` menambahkan ke tiap halaman `<link rel="canonical">`, `og:url`, `og:image` (+ ukuran dan alt), `twitter:card`, dan JSON-LD (`WebSite` + `Person` di Home, `CreativeWork` per project, keduanya ditautkan lewat `@id`). Ia juga menulis `dist/sitemap.xml` dan `dist/robots.txt` (dengan baris `Sitemap:`). `404.html` diberi `noindex`, tanpa canonical, dan tidak masuk sitemap.
  - *Domain*: URL absolut diambil dari `SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` (diisi Vercel saat build; otomatis ikut domain custom begitu dipasang) → cadangan `https://khalifaherian.com`. Pindah ke domain sendiri atau VPS: set `SITE_URL=https://domainmu.com` saat build, tanpa ubah kode.
  - *Gambar preview*: `public/og/*.png` dibuat oleh `python tools/og_images.py` dari aset P5 + teks di `src/content/`. Jalankan ulang setelah menambah project atau mengubah nama, tagline, atau arcana. Build gagal kalau gambarnya belum ada.
  - *Domain & Search Console*: domain `khalifaherian.com` (DNS di Domainesia: A `@` dan CNAME `www` ke Vercel; `www` dan `portfolio-khaif.vercel.app` dialihkan 308 lewat dashboard Vercel). Search Console memakai property **Domain**, diverifikasi lewat record TXT `google-site-verification=...` di DNS, bukan meta tag. Jangan hapus record TXT itu.
  - *Setelah deploy*: submit `/sitemap.xml` di Search Console. Cek preview link dengan opengraph.xyz atau LinkedIn Post Inspector, dan JSON-LD dengan Rich Results Test / validator.schema.org.
