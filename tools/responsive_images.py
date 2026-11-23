"""Varian kecil untuk srcset + peta ukuran asli gambar.

Jalankan SETELAH export_assets.py:

    python tools/responsive_images.py

1. src/assets/p5-sm/<nama>.webp
   Versi kecil untuk sprite yang sering tampil jauh lebih kecil dari ukuran filenya
   (kartu tarot 256 px tampil 80-96 px di Home; latar kota di layar HP).
   <Sprite sizes="..."> memakai keduanya lewat srcset, browser memilih sendiri.

2. src/lib/image-sizes.json
   Lebar x tinggi asli tiap gambar (p5, p5-sm, crowd, holes). <Sprite> memasangnya
   sebagai atribut width/height supaya browser tahu rasio gambar sebelum file datang
   (tidak ada layout shift). Ukuran tampil tetap diatur CSS.
"""

import glob
import json
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
ASSETS = os.path.join(ROOT, "src", "assets")
P5 = os.path.join(ASSETS, "p5")
SM = os.path.join(ASSETS, "p5-sm")

# nama (glob) -> lebar varian kecil
SMALL = {
    "city-night": 640,
    "tarot-*": 128,
}
QUALITY = {"city-night": 40}


def make_small() -> None:
    os.makedirs(SM, exist_ok=True)
    for pattern, width in SMALL.items():
        for path in sorted(glob.glob(os.path.join(P5, f"{pattern}.webp"))):
            name = os.path.splitext(os.path.basename(path))[0]
            img = Image.open(path)
            if img.width <= width:
                continue
            small = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
            small.save(os.path.join(SM, f"{name}.webp"), "WEBP", quality=QUALITY.get(name, 80), method=6)


def write_sizes() -> None:
    sizes = {}
    for folder in ["p5", "p5-sm", "crowd", "holes"]:
        for path in sorted(glob.glob(os.path.join(ASSETS, folder, "*.webp"))):
            name = os.path.splitext(os.path.basename(path))[0]
            with Image.open(path) as img:
                sizes[f"{folder}/{name}"] = list(img.size)
    out = os.path.join(ROOT, "src", "lib", "image-sizes.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(sizes, f, separators=(",", ":"))
    print(f"{len(sizes)} gambar -> {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    make_small()
    write_sizes()
