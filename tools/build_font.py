"""Bangun webfont dari atlas glyph bitmap (Miscellaneous - Font.png).

Atlas: 16 kolom x 32px, latar hitam, glyph putih anti-alias. Baris 0 dimulai dari
U+0020 (spasi) sampai U+007E. Tiap glyph di-upscale, di-threshold, lalu di-trace
(potrace) jadi kurva vektor, kemudian dirakit jadi font CFF (.woff2).

    pip install pillow numpy potracer fonttools brotli
    python tools/build_font.py
"""

import os

import numpy as np
import potrace
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "PlayStation 3 - Persona 5 - Miscellaneous - Font.png")
OUT_DIR = os.path.join(ROOT, "src", "assets", "fonts")
FAMILY = "Phantom Dialog"

CELL = 32
COLS = 16
UP = 8  # faktor upscale sebelum trace, supaya kurva halus
UPM = 1000
PX = UPM / CELL  # unit font per piksel atlas
SIDE = 1.25  # side bearing (px atlas) kiri-kanan
SPACE_PX = 9


def cell_image(atlas: Image.Image, code: int) -> np.ndarray:
    i = code - 0x20
    x, y = (i % COLS) * CELL, (i // COLS) * CELL
    return np.asarray(atlas.crop((x, y, x + CELL, y + CELL)), dtype=np.float32) / 255.0


def trace(cell: np.ndarray):
    big = Image.fromarray((cell * 255).astype(np.uint8)).resize(
        (CELL * UP, CELL * UP), Image.BICUBIC
    )
    # potracer memperlakukan piksel GELAP sebagai isi, jadi glyph putih dibalik dulu
    bitmap = potrace.Bitmap(np.asarray(big) <= 138)
    return bitmap.trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.2)


def main() -> None:
    atlas = Image.open(SRC).convert("L")
    # "-", "/", "\\", "~" di atlas berbentuk lebar (gaya full-width Jepang); dibiarkan
    # jatuh ke font cadangan supaya "data-heavy" tidak terbaca "data—heavy"
    skip = {0x2D, 0x2F, 0x5C, 0x7E}
    codes = [c for c in range(0x21, 0x7F) if c not in skip]

    cells = {c: cell_image(atlas, c) for c in codes}
    ink = {c: np.argwhere(cells[c] > 0.45) for c in codes}

    # baseline = bawah huruf "H", cap height = atas huruf "H", x-height dari "x"
    base_px = ink[ord("H")][:, 0].max() + 1
    cap_px = base_px - ink[ord("H")][:, 0].min()
    xh_px = base_px - ink[ord("x")][:, 0].min()
    digit_w = max(np.ptp(ink[ord(str(d))][:, 1]) + 1 for d in range(10))

    def to_font(xp: float, yp: float, left_px: float) -> tuple[float, float]:
        # koordinat trace (upscaled, y ke bawah) -> unit font (y ke atas, baseline = 0)
        return ((xp / UP - left_px + SIDE) * PX, (base_px - yp / UP) * PX)

    glyph_order = [".notdef", "space"]
    charstrings, metrics, cmap = {}, {}, {0x20: "space"}

    pen = T2CharStringPen(int(SPACE_PX * PX), None)
    charstrings["space"] = pen.getCharString()
    metrics["space"] = (int(SPACE_PX * PX), 0)
    pen = T2CharStringPen(500, None)
    charstrings[".notdef"] = pen.getCharString()
    metrics[".notdef"] = (500, 0)

    for c in codes:
        name = f"uni{c:04X}"
        pts = ink[c]
        if len(pts) == 0:
            continue
        left, right = pts[:, 1].min(), pts[:, 1].max() + 1
        width = right - left
        left_pad = 0.0
        if chr(c).isdigit():  # angka tabular: semua lebar sama, glyph di tengah
            left_pad = (digit_w - width) / 2
            width = digit_w
        adv = int(round((width + 2 * SIDE) * PX))

        pen = T2CharStringPen(adv, None)
        for curve in trace(cells[c]):
            p = lambda pt: to_font(pt.x, pt.y, left - left_pad)  # noqa: E731
            pen.moveTo(p(curve.start_point))
            for seg in curve.segments:
                if seg.is_corner:
                    pen.lineTo(p(seg.c))
                    pen.lineTo(p(seg.end_point))
                else:
                    pen.curveTo(p(seg.c1), p(seg.c2), p(seg.end_point))
            pen.closePath()
        charstrings[name] = pen.getCharString()
        lsb = int(round((SIDE + left_pad) * PX))
        metrics[name] = (adv, lsb)
        glyph_order.append(name)
        cmap[c] = name

    ascent = int(round(base_px * PX))
    descent = int(round((CELL - base_px) * PX))

    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(FAMILY.replace(" ", ""), {"FullName": FAMILY}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ascent, descent=-descent)
    fb.setupNameTable({"familyName": FAMILY, "styleName": "Regular"})
    fb.setupOS2(
        sTypoAscender=ascent,
        sTypoDescender=-descent,
        sTypoLineGap=0,
        usWinAscent=ascent,
        usWinDescent=descent,
        sxHeight=int(xh_px * PX),
        sCapHeight=int(cap_px * PX),
        usWeightClass=500,
    )
    fb.setupPost()

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, "phantom-dialog.woff2")
    fb.font.flavor = "woff2"
    fb.save(out)
    print(
        f"{len(cmap)} glyph -> {out} ({os.path.getsize(out) / 1024:.1f} KB) "
        f"baseline={base_px}px cap={cap_px}px x={xh_px}px"
    )


if __name__ == "__main__":
    main()
