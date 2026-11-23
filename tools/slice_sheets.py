"""Potong sprite sheet (PNG transparan) jadi file-file terpisah.

Cara kerja: piksel dengan alpha > ALPHA_MIN dianggap isi, lalu di-dilate GAP px
supaya huruf-huruf satu kata ikut tergabung. Tiap gumpalan = satu sprite.

    python tools/slice_sheets.py            # semua sheet di assets/
    python tools/slice_sheets.py --gap 4    # gap lebih kecil = potongan lebih detail
"""

import argparse
import glob
import os
import re

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ALPHA_MIN = 8
MIN_SIZE = 10  # buang noise lebih kecil dari ini (px)
PAD = 2
# sheet berisi grid huruf butuh gap kecil supaya tiap glyph terpisah
PER_SHEET_GAP = {"name-decision-jpn": 1, "calendar-jpn": 3, "minigames-jpn": 3}


def slug(path: str) -> str:
    name = os.path.splitext(os.path.basename(path))[0]
    name = re.sub(r"^PlayStation 3 - Persona 5 - (HUD|Miscellaneous) - ", "", name)
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def slice_sheet(path: str, out_root: str, gap: int) -> int:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    mask = arr[..., 3] > ALPHA_MIN
    grown = ndimage.binary_dilation(mask, iterations=gap) if gap else mask
    labels, _ = ndimage.label(grown)
    boxes = ndimage.find_objects(labels)

    # urutkan baris demi baris (atas -> bawah, kiri -> kanan)
    boxes = [b for b in boxes if b is not None]
    boxes.sort(key=lambda b: (b[0].start // 40, b[1].start))

    out_dir = os.path.join(out_root, slug(path))
    os.makedirs(out_dir, exist_ok=True)
    for f in glob.glob(os.path.join(out_dir, "*.png")):
        os.remove(f)

    h, w = mask.shape
    preview = img.copy()
    draw = ImageDraw.Draw(preview)
    n = 0
    for b in boxes:
        sub = mask[b]
        if not sub.any():
            continue
        ys, xs = np.nonzero(sub)
        y0 = max(b[0].start + ys.min() - PAD, 0)
        y1 = min(b[0].start + ys.max() + 1 + PAD, h)
        x0 = max(b[1].start + xs.min() - PAD, 0)
        x1 = min(b[1].start + xs.max() + 1 + PAD, w)
        if (x1 - x0) < MIN_SIZE and (y1 - y0) < MIN_SIZE:
            continue
        n += 1
        img.crop((x0, y0, x1, y1)).save(
            os.path.join(out_dir, f"{n:03d}_{x1 - x0}x{y1 - y0}.png"), optimize=True
        )
        draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(0, 200, 255, 255), width=2)
        draw.text((x0 + 3, y0 + 2), str(n), fill=(255, 220, 0, 255))

    # preview di atas latar gelap supaya sprite putih kelihatan
    bg = Image.new("RGBA", preview.size, (40, 40, 48, 255))
    bg.alpha_composite(preview)
    bg.convert("RGB").save(os.path.join(out_root, f"_preview_{slug(path)}.jpg"), quality=80)
    return n


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gap", type=int, default=6)
    ap.add_argument("--src", default="assets")
    ap.add_argument("--out", default="assets/sliced")
    args = ap.parse_args()

    sheets = sorted(glob.glob(os.path.join(args.src, "PlayStation*.png")))
    for s in sheets:
        gap = PER_SHEET_GAP.get(slug(s), args.gap)
        print(f"{slice_sheet(s, args.out, gap):4d} sprite  (gap {gap})  <- {os.path.basename(s)}")


if __name__ == "__main__":
    main()
