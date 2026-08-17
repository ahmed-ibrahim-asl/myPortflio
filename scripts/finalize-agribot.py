from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

filepath = Path(__file__).resolve().parents[1] / ".ease" / "assets" / "project-agribot.jpg"
with Image.open(filepath) as source:
    image = source.convert("RGB")
    image = ImageEnhance.Sharpness(image).enhance(1.75)
    image = image.filter(ImageFilter.UnsharpMask(radius=0.65, percent=260, threshold=1))
    image.save(filepath, "JPEG", quality=91, optimize=True, progressive=True)
print("finalized project-agribot.jpg")
