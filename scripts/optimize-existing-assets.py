from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / ".ease" / "assets"

SPECS = {
    "identity-profile.png": (1200, 1500),
    "project-agribot.jpg": (1200, 750),
    "project-rov.jpg": (1200, 750),
    "project-security-lock.png": (1200, 750),
    "project-megasumo.jpg": (1200, 750),
}


for filename, size in SPECS.items():
    filepath = ASSETS / filename
    with Image.open(filepath) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        image = ImageOps.fit(
            image,
            size,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.46 if filename == "identity-profile.png" else 0.5),
        )
        image = ImageEnhance.Contrast(image).enhance(1.04)
        image = ImageEnhance.Sharpness(image).enhance(1.35)
        image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=220, threshold=2))

        if filepath.suffix.lower() == ".png":
            image.save(filepath, "PNG", optimize=True, compress_level=9)
        else:
            image.save(filepath, "JPEG", quality=88, optimize=True, progressive=True)

    print(f"optimized {filename} -> {size[0]}x{size[1]}")
