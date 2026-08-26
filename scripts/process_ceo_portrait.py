"""Process CEO portrait: remove background, composite on branded gradient, export."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "img"
SRC = IMG / "ceo.webp"
BACKUP_DIR = IMG / "source"
BACKUP = BACKUP_DIR / "ceo-original.webp"
OUT_MAIN = IMG / "ceo.webp"
OUT_PORTRAIT = IMG / "ceo-portrait.webp"
OUT_CUTOUT = IMG / "ceo-cutout.png"
QA_DIR = ROOT / "qa-shots"
QA_PNG = QA_DIR / "ceo-processed.png"

CANVAS = 900
EXPORT = 900
WEBP_QUALITY = 88


def soft_gradient(size: int) -> Image.Image:
    """Warm-cool off-white gradient #f4f6f9 -> #e8eef5 plus soft blue radial behind head."""
    top = (0xF4, 0xF6, 0xF9)
    bottom = (0xE8, 0xEE, 0xF5)
    base = Image.new("RGB", (size, size))
    pixels = base.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(size):
            pixels[x, y] = (r, g, b)

    # Soft blue radial glow behind head (~upper third center), ~8% opacity
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    cx, cy = size // 2, int(size * 0.32)
    max_r = int(size * 0.42)
    # Layered soft discs approximating radial falloff
    for i in range(12, 0, -1):
        radius = int(max_r * i / 12)
        alpha = int(255 * 0.08 * (i / 12) ** 1.4)
        color = (0x0B, 0x7F, 0xD4, alpha)
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            fill=color,
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=48))
    base_rgba = base.convert("RGBA")
    return Image.alpha_composite(base_rgba, glow)


def add_vignette(img: Image.Image, strength: float = 0.12) -> Image.Image:
    """Subtle edge darkening."""
    w, h = img.size
    vignette = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(vignette)
    margin = int(min(w, h) * 0.08)
    draw.ellipse((-margin, -margin, w + margin, h + margin), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.18)))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dark = Image.new("RGBA", (w, h), (20, 30, 45, int(255 * strength)))
    # Where vignette is bright (center), less dark; invert mask for edges
    inv = Image.eval(vignette, lambda p: 255 - p)
    overlay = Image.composite(dark, overlay, inv)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def fit_subject(cutout: Image.Image, canvas: int) -> Image.Image:
    """Scale subject to fill canvas with headroom; place slightly lower third."""
    cutout = cutout.convert("RGBA")
    # Trim transparent margins for better centering
    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)

    cw, ch = cutout.size
    # Target: subject height ~78% of canvas, leave headroom
    target_h = int(canvas * 0.82)
    scale = target_h / ch
    # Cap width so it doesn't overflow sides
    if cw * scale > canvas * 0.92:
        scale = (canvas * 0.92) / cw
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    subject = cutout.resize((nw, nh), Image.Resampling.LANCZOS)

    # Center horizontally; vertical: slightly lower third (headroom above)
    # Place so top of subject sits ~8% from top (headroom), resting lower
    x = (canvas - nw) // 2
    y = int(canvas * 0.08)
    # If too tall after placement, nudge up slightly so feet aren't clipped
    if y + nh > canvas - 4:
        y = max(0, canvas - nh - 4)

    layer = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    layer.paste(subject, (x, y), subject)
    return layer


def drop_shadow(subject: Image.Image, blur: int = 28, offset: tuple[int, int] = (0, 18), opacity: int = 70) -> Image.Image:
    """Soft drop shadow under subject."""
    alpha = subject.split()[-1]
    shadow = Image.new("RGBA", subject.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", subject.size, (15, 25, 40, opacity))
    shadow.paste(shadow_layer, (0, 0), alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=blur))

    canvas = Image.new("RGBA", subject.size, (0, 0, 0, 0))
    ox, oy = offset
    # Shift shadow down
    shifted = Image.new("RGBA", subject.size, (0, 0, 0, 0))
    shifted.paste(shadow, (ox, oy), shadow)
    return Image.alpha_composite(shifted, subject)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source: {SRC}")

    before = SRC.stat().st_size
    print(f"Before: {SRC} ({before:,} bytes)")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    if not BACKUP.exists():
        shutil.copy2(SRC, BACKUP)
        print(f"Backup saved: {BACKUP}")
    else:
        print(f"Backup already exists: {BACKUP}")

    # Always remove bg from the original backup for clean processing
    original = Image.open(BACKUP).convert("RGBA")
    print("Removing background with rembg...")
    cutout = remove(original)
    if not isinstance(cutout, Image.Image):
        cutout = Image.open(BACKUP).convert("RGBA")
        cutout = remove(cutout)

    cutout.save(OUT_CUTOUT, "PNG")
    print(f"Cutout: {OUT_CUTOUT} ({OUT_CUTOUT.stat().st_size:,} bytes)")

    subject = fit_subject(cutout, CANVAS)
    subject = drop_shadow(subject)

    bg = soft_gradient(CANVAS)
    composed = Image.alpha_composite(bg, subject)
    composed = add_vignette(composed, strength=0.10)

    if EXPORT != CANVAS:
        composed = composed.resize((EXPORT, EXPORT), Image.Resampling.LANCZOS)

    rgb = composed.convert("RGB")
    rgb.save(OUT_MAIN, "WEBP", quality=WEBP_QUALITY, method=6)
    rgb.save(OUT_PORTRAIT, "WEBP", quality=WEBP_QUALITY, method=6)

    QA_DIR.mkdir(parents=True, exist_ok=True)
    rgb.save(QA_PNG, "PNG", optimize=True)

    after = OUT_MAIN.stat().st_size
    print(f"After:  {OUT_MAIN} ({after:,} bytes)")
    print(f"Portrait: {OUT_PORTRAIT} ({OUT_PORTRAIT.stat().st_size:,} bytes)")
    print(f"QA shot:  {QA_PNG} ({QA_PNG.stat().st_size:,} bytes)")
    print(f"Size delta: {before:,} -> {after:,} ({after - before:+,} bytes)")
    print("SUCCESS")


if __name__ == "__main__":
    main()
