"""Salin sprite terpilih (hasil slice_sheets.py) ke src/assets/p5 sebagai webp.

    python tools/slice_sheets.py      # sekali, untuk membuat assets/sliced
    python tools/export_assets.py
"""

import glob
import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLICED = os.path.join(ROOT, "assets", "sliced")
RAW = os.path.join(ROOT, "assets")
OUT = os.path.join(ROOT, "src", "assets", "p5")


def sliced(sheet: str, idx: int) -> str:
    return glob.glob(os.path.join(SLICED, sheet, f"{idx:03d}_*.png"))[0]


def raw(prefix: str) -> str:
    return glob.glob(os.path.join(RAW, f"{prefix}_*.png"))[0]


PICKS = {
    # kartu misi
    "mission": sliced("mission-clear-fail", 1),
    "failed": sliced("mission-clear-fail", 2),
    "clear": sliced("mission-clear-fail", 3),
    "knife": sliced("mission-clear-fail", 4),
    "ok": sliced("mission-clear-fail", 5),
    # label & efek
    "bonus": sliced("battle-results", 41),
    "new-skill": sliced("battle-results", 44),
    "burst-white": sliced("battle-results", 3),
    "star-red": sliced("battle-results", 51),
    "sparkle": sliced("battle-results", 53),
    "weak": sliced("battle-jpn", 69),
    "critical": sliced("battle-jpn", 78),
    "start": sliced("minigames-jpn", 311),
    "burst": sliced("minigames-jpn", 326),
    "arrow": sliced("minigames-jpn", 327),
    "splash": sliced("minigames-jpn", 304),
    "frame": sliced("minigames-jpn", 312),
    # panel dari aset lepas
    "sparkles-gold": raw("chara_star"),
    "check": raw("check"),
    "shards": raw("bg_red_line"),
    "frame-red": raw("bg_spec"),
    "panel-profile": raw("chara2_txt_bg"),
    "panel-black": raw("bg_slider_text1"),
    "panel-stack": raw("bottom_info_text_bg"),
}

# sprite yang tampil kecil tidak perlu resolusi penuh
# (lebar tampil terbesar x 2 untuk layar retina)
MAX_W = {"shards": 360, "sparkles-gold": 320, "frame-red": 900}

# angka miring putih (battle results) dan angka besar (battle)
DIGITS_ITALIC = [25, 26, 27, 28, 29, 30, 31, 32, 37, 38]
DIGITS_BIG = [1, 2, 3, 4, 5, 6, 7, 8, 40, 41]


def save(img: Image.Image, name: str, max_w: int = 1600, quality: int = 88) -> None:
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    img.save(os.path.join(OUT, f"{name}.webp"), "WEBP", quality=quality, method=6)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name, path in PICKS.items():
        save(Image.open(path).convert("RGBA"), name, MAX_W.get(name, 1600))
    for d, idx in enumerate(DIGITS_ITALIC):
        save(Image.open(sliced("battle-results", idx)).convert("RGBA"), f"digit-italic-{d}")
    for d, idx in enumerate(DIGITS_BIG):
        img = Image.open(sliced("battle-jpn", idx)).convert("RGBA")
        # potongan angka "3" ikut membawa serpihan di bawahnya; angka aslinya ~250px
        if img.height > 260:
            img = img.crop(img.crop((0, 0, img.width, 250)).getbbox())
        save(img, f"digit-big-{d}")

    # panel kota versi malam dari sheet Calendar (3 panel bersebelahan @1024px)
    city = Image.open(sliced("calendar-jpn", 1)).convert("RGBA")
    # latar hero tampil grayscale + opacity 45%: simpan grayscale tanpa alpha dengan
    # kualitas lebih rendah (artefak tidak terlihat di balik overlay): 144 KB -> 68 KB.
    city = city.crop((1026, 0, 2048, min(city.height, 720))).convert("L").convert("RGB")
    save(city, "city-night", quality=40)

    export_misc()
    export_crowd()
    export_bullet_holes()

    files = sorted(os.listdir(OUT))
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in files)
    print(f"{len(files)} file, {total / 1024:.0f} KB -> {OUT}")


def misc(name: str) -> Image.Image:
    return Image.open(
        os.path.join(RAW, f"PlayStation 3 - Persona 5 - Miscellaneous - {name}.png")
    ).convert("RGBA")


def trim(img: Image.Image) -> Image.Image:
    return img.crop(img.getbbox())


def knock_out_black(img: Image.Image) -> Image.Image:
    """Latar hitam yang menyambung ke tepi gambar dijadikan transparan."""
    img = img.copy()
    w, h = img.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(img, xy, (0, 0, 0, 0), thresh=24)
    return trim(img)


# kartu tarot (arcana mayor 0–XIX di baris 2 sheet, XX–XXI di baris 3), sel 256x512
TAROT = {"fool": 0, "magician": 1, "chariot": 7, "star": 17, "sun": 19}


def export_misc() -> None:
    tarot = misc("Tarot Cards")
    save(trim(tarot.crop((1, 1, 257, 513))), "tarot-back")
    for name, i in TAROT.items():
        x = 1 + i * 257
        save(trim(tarot.crop((x, 514, x + 256, 1026))), f"tarot-{name}")

    # versi biru untuk tema biru: sel 128x235, 7 per baris. Baris pertama
    # melompati IV (L'Empereur), jadi urutannya 0,1,2,3,5,6,7 | 8–14 | 15–21.
    blue = misc("Tarot Cards (Blue)")
    save(trim(blue.crop((1, 11, 129, 246))), "tarot-blue-back")
    order = [0, 1, 2, 3, 5, 6, 7] + list(range(8, 22))
    rows_y = [268, 525, 782]
    for name, i in TAROT.items():
        slot = order.index(i)
        x, y = 1 + (slot % 7) * 129, rows_y[slot // 7]
        save(trim(blue.crop((x, y, x + 128, y + 235))), f"tarot-blue-{name}")

    # cut-in mata ala critical hit (sel tengah baris kedua)
    save(trim(misc("Critical Hit").crop((1290, 532, 2590, 1044))), "cutin-joker", 1100)

    # layar terakhir: "END." merah dan "FIN." putih di atas latar hitam
    last = misc("Last Screen")
    save(knock_out_black(last.crop((960, 530, 1250, 690))), "end")
    save(knock_out_black(last.crop((1010, 1580, 1230, 1730))), "fin")

    # loading screen: topi, tulisan "take your time", dan 9 frame api
    save(Image.open(sliced("loading-screen", 15)).convert("RGBA"), "top-hat")
    save(Image.open(sliced("loading-screen", 18)).convert("RGBA"), "take-your-time")
    flames = [1, 2, 3, 4, 5, 10, 11, 12, 13]
    frames = [Image.open(sliced("loading-screen", i)).convert("RGBA") for i in flames]
    fw, fh = max(f.width for f in frames), max(f.height for f in frames)
    strip = Image.new("RGBA", (fw * len(frames), fh))
    for i, f in enumerate(frames):  # rata bawah, supaya api tidak "loncat"
        strip.alpha_composite(f, (i * fw + (fw - f.width) // 2, fh - f.height))
    save(strip, "flame-strip", 4000)


CROWD_OUT = os.path.join(ROOT, "src", "assets", "crowd")
CROWD_H = 300  # tinggi untuk orang setinggi ~720px di sumber; proporsi tinggi dipertahankan


def export_crowd() -> None:
    """Silhouette pejalan kaki: buang varian musim panas (_s) dan set pantai (010)."""
    os.makedirs(CROWD_OUT, exist_ok=True)
    for f in glob.glob(os.path.join(CROWD_OUT, "*.webp")):
        os.remove(f)
    files = [
        f
        for f in sorted(glob.glob(os.path.join(RAW, "crowd", "crowd00[0-4]_00[01].pac_*.png")))
        if "_s." not in f
    ]
    scale = CROWD_H / 720
    for n, f in enumerate(files):
        img = trim(Image.open(f).convert("RGBA"))
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        img.save(os.path.join(CROWD_OUT, f"{n:02d}.webp"), "WEBP", quality=82, method=6)
    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(CROWD_OUT, "*.webp")))
    print(f"{len(files)} crowd, {total / 1024:.0f} KB -> {CROWD_OUT}")



HOLES_OUT = os.path.join(ROOT, "src", "assets", "holes")
# urutan komponen (0-15) yang ternyata dua lubang menyatu: kalau intinya diisi
# pekat jadi gumpalan hitam. Dicek visual; nilai "kebulatan" tidak bisa membedakan.
MERGED_HOLES = {3, 8, 10, 11}


def export_bullet_holes() -> None:
    """Ekstrak lubang peluru sebagai stiker transparan.

    Sheet tarot punya dua baris kartu terbalik yang identik, bedanya baris
    terakhir sudah ditembak. Selisih piksel keduanya = lubangnya saja. Cincin
    hangus dijadikan abu-abu (supaya cocok di kartu merah maupun biru). Pusatnya
    tetap hitam pekat: kalau dibuat transparan, yang terlihat malah gambar
    kartu di bawahnya, bukan "tembus".
    """
    os.makedirs(HOLES_OUT, exist_ok=True)
    for f in glob.glob(os.path.join(HOLES_OUT, "*.webp")):
        os.remove(f)
    sheet = np.asarray(misc("Tarot Cards"), dtype=np.float32)
    n = 0
    idx = -1
    for i in range(8):
        x = 1 + i * 257
        clean, shot = sheet[2053:2525, x : x + 256], sheet[2566:3038, x : x + 256]
        diff = np.abs(clean[..., :3] - shot[..., :3]).max(axis=2)
        mask = ndimage.binary_fill_holes(ndimage.binary_closing(diff > 40, iterations=3))
        labels, _ = ndimage.label(mask)
        for k, sl in enumerate(ndimage.find_objects(labels), start=1):
            if sl[0].stop - sl[0].start < 30 or sl[1].stop - sl[1].start < 30:
                continue
            region = ndimage.binary_fill_holes(labels[sl] == k)
            rgb = shot[sl][..., :3]
            lum = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
            # tepi halus dari besarnya selisih
            edge = np.clip((diff[sl] - 15) / 30, 0, 1)
            edge = np.maximum(edge, ndimage.binary_erosion(region, iterations=2))
            idx += 1
            if idx in MERGED_HOLES:
                continue
            h, w = region.shape
            # cincin tidak selalu tertutup rapat; paksa bagian tengah (elips) pekat
            yy, xx = np.mgrid[0:h, 0:w]
            core = ((yy - h / 2) / (h * 0.36)) ** 2 + ((xx - w / 2) / (w * 0.36)) ** 2 <= 1
            edge = np.maximum(edge, core)
            region = region | core
            alpha = np.clip(ndimage.gaussian_filter(edge * region, 0.7), 0, 1) * 255
            gray = np.repeat(lum[..., None], 3, axis=2)
            out = np.dstack([gray, alpha]).astype(np.uint8)
            Image.fromarray(out, "RGBA").save(
                os.path.join(HOLES_OUT, f"{n:02d}.webp"), "WEBP", quality=85, method=6
            )
            n += 1
    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(HOLES_OUT, "*.webp")))
    print(f"{n} lubang peluru, {total / 1024:.0f} KB -> {HOLES_OUT}")


if __name__ == "__main__":
    main()
