"""Create delivery-sized WebP derivatives while preserving every source image.

This script only applies EXIF orientation, proportional resizing, and WebP
encoding. It deliberately applies no sharpening, contrast, saturation, color,
or artistic filters.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUTPUT = PUBLIC / "media" / "optimized"
INVENTORY = ROOT / ".ease" / "optimized-image-inventory.json"

ASSETS = [
    ("images/profilePicture/profile3.png", "profile-ahmed.webp", (960, 1200)),
    ("images/agribot_image.jpg", "project-agribot.webp", (1600, 1200)),
    ("images/ROV.jpeg", "project-rov.webp", (1600, 1200)),
    ("images/Lock_system (2).png", "project-lock-primary.webp", (1600, 1200)),
    ("images/Lock_system.jpg", "project-lock-hardware.webp", (1600, 1200)),
    ("images/Lock_system.png", "project-lock-diagram.webp", (1600, 1200)),
    ("images/Mega-Sumo.jpg", "project-megasumo.webp", (1200, 900)),
    ("images/Rocket_league.jpg", "project-rocket-league.webp", (1600, 1200)),
    ("images/Human Follower.jpg", "project-human-follower.webp", (1600, 1200)),
    ("images/Ros Requirements_thubnail.jpg", "tutorial-ros.webp", (1400, 900)),
    ("images/intro_embeddedSystem.jpg", "tutorial-intro-embedded.webp", (1400, 900)),
    ("images/embedded system worksop level1.jpg", "tutorial-embedded-workshop.webp", (1400, 900)),
]


def web_mode(image: Image.Image) -> Image.Image:
    if image.mode in {"RGBA", "LA"}:
        return image.convert("RGBA")
    if image.mode == "P" and "transparency" in image.info:
        return image.convert("RGBA")
    return image.convert("RGB")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    INVENTORY.parent.mkdir(parents=True, exist_ok=True)
    records = []

    for source_name, target_name, max_size in ASSETS:
        source = PUBLIC / source_name
        target = OUTPUT / target_name

        with Image.open(source) as opened:
            original_size = opened.size
            icc_profile = opened.info.get("icc_profile")
            image = ImageOps.exif_transpose(opened)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            image = web_mode(image)

            save_options = {"format": "WEBP", "quality": 86, "method": 6}
            if icc_profile:
                save_options["icc_profile"] = icc_profile
            image.save(target, **save_options)

        source_bytes = source.stat().st_size
        target_bytes = target.stat().st_size
        records.append(
            {
                "source": source.relative_to(ROOT).as_posix(),
                "target": target.relative_to(ROOT).as_posix(),
                "original_dimensions": list(original_size),
                "delivery_dimensions": list(image.size),
                "source_bytes": source_bytes,
                "delivery_bytes": target_bytes,
                "reduction_percent": round((1 - target_bytes / source_bytes) * 100, 1),
                "visual_filters": [],
            }
        )

    payload = {
        "policy": "Originals retained; derivatives use orientation, resize, and WebP encoding only.",
        "assets": records,
        "source_bytes": sum(item["source_bytes"] for item in records),
        "delivery_bytes": sum(item["delivery_bytes"] for item in records),
    }
    INVENTORY.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()