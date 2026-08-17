from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / ".ease" / "assets"
FILES = {
    "identity-profile.png": 2.6,
    "project-agribot.jpg": 2.4,
    "project-security-lock.png": 1.35,
}


for filename, strength in FILES.items():
    filepath = ASSETS / filename
    with Image.open(filepath) as source:
        image = source.convert("RGB")
        image = ImageEnhance.Sharpness(image).enhance(strength)
        image = image.filter(
            ImageFilter.UnsharpMask(
                radius=0.8,
                percent=320 if strength > 2 else 180,
                threshold=1,
            )
        )
        if filepath.suffix.lower() == ".png":
            image.save(filepath, "PNG", optimize=True, compress_level=9)
        else:
            image.save(filepath, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"web sharpened {filename}")
