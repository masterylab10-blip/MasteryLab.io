# Image Optimizer Skill

This skill automatically converts uploaded images to WebP format and creates multiple responsive versions (different widths) to optimize performance and LCP. It also automatically injects those new optimal pictures directly into the HTML!

## Usage

When any image is uploaded or added to the `media/` directory:
1. Run `python3 .agents/skills/image_optimizer/scripts/optimize.py`
   - This automatically reads the standard JPGs or PNGs in `media/` and produces WebP images at `small`, `medium`, and `large` resolutions.
2. Run `python3 .agents/skills/image_optimizer/scripts/update_html.py`
   - This automatically traverses through *all* `.html` files in the website root directory. 
   - It seamlessly upgrades any basic `<img>` pointing to `media/` into a robust HTML5 `<picture>` tag.
   - It embeds `srcset` maps linking to our generated WebP resolutions automatically based on device sizes.
   - It strategically assigns `loading="lazy"` automatically on all images to dramatically boost performance, except for specific images inherently identified as Above-The-Fold / LCP images (like logos or heroes).

## Generated Versions
- **small**: 480px width (Mobile).
- **medium**: 800px width (Tablet).
- **large**: 1200px width (Desktop).
- **webp**: Full size, zero-loss optimized WebP!
