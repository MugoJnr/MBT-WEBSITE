"""Generate optimized webp assets for MBT website."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
SRC = IMG / "source"


def save_webp(im: Image.Image, dest: Path, max_width: int | None = None, quality: int = 82):
    im = im.convert("RGB") if im.mode in ("RGBA", "P") else im
    if im.mode == "RGBA":
        im = im.convert("RGB")
    if max_width and im.width > max_width:
        h = round(im.height * max_width / im.width)
        im = im.resize((max_width, h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=quality, method=6)
    return dest


def logo_square(src: Path, dest: Path, size: int = 512):
    im = Image.open(src).convert("RGBA")
    im = ImageOps.contain(im, (size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - im.width) // 2
    oy = (size - im.height) // 2
    canvas.paste(im, (ox, oy), im)
    rgb = Image.new("RGB", (size, size), (255, 255, 255))
    rgb.paste(canvas, mask=canvas.split()[3])
    save_webp(rgb, dest, quality=85)


def main():
    farm = SRC / "farm-records.jpg"
    if farm.exists():
        full = Image.open(farm)
        w, h = full.size
        # Focus on laptop screen area (center-weighted crop)
        left = int(w * 0.18)
        top = int(h * 0.12)
        right = int(w * 0.88)
        bottom = int(h * 0.82)
        crop = full.crop((left, top, right, bottom))
        save_webp(crop, IMG / "farm-dashboard.webp", max_width=1400)
        save_webp(full, IMG / "farm-hero.webp", max_width=1200)

    for name in ("pulse-dashboard.png", "pulse-menu.png"):
        p = SRC / name
        if p.exists():
            save_webp(Image.open(p), IMG / (Path(name).stem + ".webp"))

    exam = IMG / "examhub-raw.png"
    if exam.exists():
        ex = Image.open(exam)
        home_h = min(900, ex.height)
        save_webp(ex.crop((0, 0, ex.width, home_h)), IMG / "examhub-home.webp", max_width=1400)
        y0 = min(900, max(0, ex.height - 900))
        if ex.height > 1000:
            y0 = 900
            y1 = min(ex.height, y0 + 900)
            save_webp(ex.crop((0, y0, ex.width, y1)), IMG / "examhub-resources.webp", max_width=1400)

    for logo, out in (("farm-logo.png", "farm.webp"), ("trading-logo.png", "trading.webp")):
        p = IMG / logo
        if p.exists():
            logo_square(p, IMG / out)

    td = IMG / "trading-dashboard.png"
    if td.exists():
        save_webp(Image.open(td), IMG / "trading-dashboard.webp", max_width=1440, quality=88)

    print("done")


if __name__ == "__main__":
    main()
