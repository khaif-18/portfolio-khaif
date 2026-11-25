"""Buat favicon "KE" (logo header) dalam semua format yang dibutuhkan.

    public/favicon.svg          browser modern (huruf Anton jadi path: favicon tidak bisa memuat font)
    public/favicon-96.png       Google Search (ukuran harus kelipatan 48 px)
    public/favicon.ico          16/32/48 px, untuk crawler & browser lama
    public/apple-touch-icon.png 180 px, ikon layar utama iOS

Desain: latar tinta, panel merah miring, "KE" putih sedikit miring.
SVG dan PNG memakai geometri yang sama (panel, pusat, tinggi huruf, rotasi).

    pip install pillow fonttools
    python tools/favicon.py
"""

import os

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ANTON = os.path.join(ROOT, "node_modules", "@fontsource", "anton", "files", "anton-latin-400-normal.woff")

INK = "#0b0b0b"
RED = "#e00012"
WHITE = "#ffffff"

BOX = 64  # viewBox
PANEL = [(6, 9), (58, 3), (53, 59), (10, 54)]
TEXT = "KE"
CENTER = (32.5, 31.5)
TEXT_H = 34  # tinggi huruf kapital, unit viewBox
ROTATE = -6  # derajat (berlawanan jarum jam), seperti judul P5
TRACKING = -10  # unit font, merapatkan K dan E

FONT = TTFont(ANTON)
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UPM = FONT["head"].unitsPerEm


def layout():
    """[(offset_x, glyph_name)] dan bbox gabungan, dalam unit font"""
    out, x, box = [], 0, None
    for ch in TEXT:
        name = CMAP[ord(ch)]
        bp = BoundsPen(GLYPHS)
        GLYPHS[name].draw(bp)
        x0, y0, x1, y1 = bp.bounds
        b = (x0 + x, y0, x1 + x, y1)
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
        out.append((x, name))
        x += FONT["hmtx"][name][0] + TRACKING
    return out, box


def svg() -> str:
    items, (x0, y0, x1, y1) = layout()
    s = TEXT_H / (y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    paths = ""
    for dx, name in items:
        pen = SVGPathPen(GLYPHS, ntos=lambda v: f"{v:g}")
        GLYPHS[name].draw(pen)
        paths += f'<path transform="translate({dx} 0)" d="{pen.getCommands()}"/>'
    pts = " ".join(f"{x},{y}" for x, y in PANEL)
    # font: sumbu y ke atas -> geser pusat bbox ke 0, balik y, skala, putar, pindah ke CENTER
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}">'
        f'<rect width="{BOX}" height="{BOX}" fill="{INK}"/>'
        f'<polygon points="{pts}" fill="{RED}"/>'
        f'<g fill="{WHITE}" transform="translate({CENTER[0]} {CENTER[1]}) rotate({ROTATE}) '
        f'scale({s:.5f} {-s:.5f}) translate({-cx:g} {-cy:g})">{paths}</g>'
        "</svg>\n"
    )


def raster(size: int) -> Image.Image:
    """geometri yang sama digambar Pillow, supersampling 8x lalu diperkecil"""
    big = size * 8
    u = big / BOX
    img = Image.new("RGB", (big, big), INK)
    ImageDraw.Draw(img).polygon([(x * u, y * u) for x, y in PANEL], fill=RED)

    items, (x0, y0, x1, y1) = layout()
    px_per_unit = TEXT_H * u / (y1 - y0)
    font = ImageFont.truetype(ANTON, round(UPM * px_per_unit))
    ascent = font.getmetrics()[0]

    # titik asal teks dipilih supaya pusat bbox huruf jatuh tepat di CENTER;
    # Pillow menggambar dari atas ascent, font memakai baseline -> baseline = top + ascent
    ox = CENTER[0] * u - (x0 + x1) / 2 * px_per_unit
    baseline = CENTER[1] * u + (y0 + y1) / 2 * px_per_unit
    mask = Image.new("L", (big, big), 0)
    md = ImageDraw.Draw(mask)
    for (dx, _), ch in zip(items, TEXT):
        md.text((ox + dx * px_per_unit, baseline - ascent), ch, font=font, fill=255)
    # rotate() Pillow: sudut positif = berlawanan jarum jam (kebalikan SVG)
    mask = mask.rotate(-ROTATE, resample=Image.BICUBIC, center=(CENTER[0] * u, CENTER[1] * u))
    img.paste(WHITE, (0, 0), mask)
    return img.resize((size, size), Image.LANCZOS)


def main():
    with open(os.path.join(PUBLIC, "favicon.svg"), "w", encoding="utf8") as f:
        f.write(svg())
    raster(96).save(os.path.join(PUBLIC, "favicon-96.png"), optimize=True)
    raster(180).save(os.path.join(PUBLIC, "apple-touch-icon.png"), optimize=True)
    icons = {s: raster(s) for s in (16, 32, 48)}
    icons[48].save(
        os.path.join(PUBLIC, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[icons[16], icons[32]],
    )
    for name in ("favicon.svg", "favicon-96.png", "apple-touch-icon.png", "favicon.ico"):
        print(f"favicon  public/{name}  ({os.path.getsize(os.path.join(PUBLIC, name))} B)")


if __name__ == "__main__":
    main()
