"""Buat gambar preview link (og:image) 1200x630 dari aset Persona yang sudah diekspor.

Hasilnya PNG di public/og/ (ikut di-commit), dipakai scripts/prerender.mjs:
    public/og/home.png
    public/og/<slug>.png   (satu per project, kartu tarot sesuai arcana-nya)

Teks diambil dari src/content/*.ts supaya tidak perlu disalin manual.
Jalankan ulang setelah mengubah nama / tagline / arcana project:

    pip install pillow
    python tools/og_images.py
"""

import os
import re

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P5 = os.path.join(ROOT, "src", "assets", "p5")
OUT = os.path.join(ROOT, "public", "og")
ANTON = os.path.join(ROOT, "node_modules", "@fontsource", "anton", "files", "anton-latin-400-normal.woff")

W, H = 1200, 630
RED = (224, 0, 18)
INK = (11, 11, 11)
PAPER = (247, 245, 240)


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(ANTON, size)


def read(path: str) -> str:
    with open(os.path.join(ROOT, path), encoding="utf8") as f:
        return f.read()


def field(src: str, key: str) -> str:
    m = re.search(rf'\b{key}:\s*"([^"]*)"', src)
    if not m:
        raise SystemExit(f"og_images: '{key}' tidak ditemukan")
    return m.group(1)


def load_projects() -> list[dict]:
    src = read("src/content/projects.ts")
    blocks = re.split(r"\n  \{\n    slug:", src)[1:]
    out = []
    for b in blocks:
        b = "slug:" + b
        out.append(
            {
                "slug": field(b, "slug"),
                "card": field(b, "card"),
                "label": field(b, "label"),
                "name": field(b, "name"),
                "tagline": field(b, "tagline"),
            }
        )
    return out


def background() -> Image.Image:
    """kota malam grayscale, ditint merah gelap, dengan slab merah miring di kiri"""
    city = Image.open(os.path.join(P5, "city-night.webp")).convert("L")
    city = ImageOps.fit(city, (W, H), Image.LANCZOS, centering=(0.5, 0.6))
    city = ImageOps.colorize(city, black=INK, white=(150, 40, 46), mid=(60, 10, 14))
    img = Image.new("RGB", (W, H), INK)
    img = Image.blend(img, city, 0.55)

    d = ImageDraw.Draw(img)
    # slab merah dengan tepi hitam: bentuk khas panel P5
    d.polygon([(0, 0), (800, 0), (700, H), (0, H)], fill=INK)
    d.polygon([(0, 0), (770, 0), (670, H), (0, H)], fill=RED)
    # garis halftone diagonal tipis di atas slab
    stripes = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(stripes)
    for x in range(-H, W, 18):
        sd.line([(x, H), (x + H, 0)], fill=28, width=6)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon([(0, 0), (770, 0), (670, H), (0, H)], fill=255)
    stripes = ImageChops.multiply(stripes, mask)
    img.paste(INK, (0, 0), stripes)
    return img


def fit_font(text: str, max_w: int, start: int, minimum: int = 40) -> ImageFont.FreeTypeFont:
    size = start
    while size > minimum and font(size).getlength(text) > max_w:
        size -= 2
    return font(size)


def text_block(img: Image.Image, x: int, y: int, text: str, f, fill, shadow=INK, rotate=-4):
    """teks Anton dengan bayangan keras, sedikit miring seperti judul P5"""
    pad = 30
    w = int(f.getlength(text)) + pad * 2
    bbox = f.getbbox(text)
    h = bbox[3] + pad * 2
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.text((pad + 6, pad + 6), text, font=f, fill=shadow)
    ld.text((pad, pad), text, font=f, fill=fill)
    layer = layer.rotate(-rotate, resample=Image.BICUBIC, expand=True)
    img.paste(layer, (x - pad, y - pad), layer)
    return y + bbox[3]


def label_box(img: Image.Image, x: int, y: int, text: str, size: int, bg=INK, fg=PAPER):
    f = font(size)
    w = int(f.getlength(text))
    d = ImageDraw.Draw(img)
    d.polygon([(x - 14, y - 8), (x + w + 22, y - 12), (x + w + 14, y + size + 14), (x - 20, y + size + 10)], fill=bg)
    d.text((x, y - size * 0.12), text, font=f, fill=fg)


def tarot(img: Image.Image, card: str, cx: int, cy: int, height: int = 470, angle: float = 8):
    c = Image.open(os.path.join(P5, f"tarot-{card}.webp")).convert("RGBA")
    c = c.resize((height // 2, height), Image.LANCZOS)
    border = 10
    framed = Image.new("RGBA", (c.width + border * 2, c.height + border * 2), INK + (255,))
    framed.paste(c, (border, border))
    shadow = Image.new("RGBA", framed.size, INK + (200,))
    for layer, off in ((shadow, 18), (framed, 0)):
        r = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
        img.paste(r, (cx - r.width // 2 + off, cy - r.height // 2 + off), r)


def footer(img: Image.Image, text: str):
    f = font(26)
    d = ImageDraw.Draw(img)
    d.text((60, H - 70), text, font=f, fill=PAPER)


def home(profile_src: str):
    name = field(profile_src, "name").upper().split(" ")
    role = field(profile_src, "role").upper()
    img = background()
    tarot(img, "fool", 960, 320)
    first, last = " ".join(name[:-1]), name[-1]
    label_box(img, 64, 70, "TAKE YOUR TIME", 30)
    y = text_block(img, 60, 140, first, fit_font(first, 640, 96), PAPER)
    text_block(img, 60, y + 10, last, fit_font(last, 640, 150), PAPER)
    label_box(img, 70, 455, role, 44, bg=PAPER, fg=INK)
    footer(img, "REACT · TYPESCRIPT · DATA VIZ · MAPS")
    return img


def project(p: dict, author: str):
    img = background()
    tarot(img, p["card"], 960, 320)
    label_box(img, 64, 70, p["label"].upper(), 30)
    title = p["name"].upper()
    text_block(img, 60, 150, title, fit_font(title, 620, 170), PAPER)
    tag = p["tagline"].upper()
    label_box(img, 70, 430, tag, fit_font(tag, 560, 44).size, bg=PAPER, fg=INK)
    footer(img, f"CASE FILE · {author.upper()}")
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    profile_src = read("src/content/profile.ts")
    jobs = [("home", home(profile_src))]
    author = field(profile_src, "name")
    jobs += [(p["slug"], project(p, author)) for p in load_projects()]
    for slug, im in jobs:
        path = os.path.join(OUT, f"{slug}.png")
        # palet 256 warna: ±5x lebih kecil dari PNG penuh, tetap tajam untuk preview sosial
        im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(
            path, optimize=True
        )
        print(f"og  {path[len(ROOT) + 1:]}  ({os.path.getsize(path) // 1024} KB)")


if __name__ == "__main__":
    main()
