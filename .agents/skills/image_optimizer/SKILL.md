# Image Optimizer Skill

This skill automatically converts uploaded images to WebP format and creates multiple responsive versions (different widths) to optimize performance and LCP.

## Usage

When an image is added to the `media/` directory:
1. Run `python3 .agents/skills/image_optimizer/scripts/optimize.py`
2. Update the HTML to use `<picture>` tags with the generated versions.

## Generated Versions
- **small**: 480px width (Mobile).
- **medium**: 800px width (Tablet).
- **large**: 1200px width (Desktop).
- **webp**: All versions converted to .webp for maximum compression.

## Best Practices
- Use `loading="lazy"` for images below the fold.
- Use `fetchpriority="high"` for the LCP image.
- Always include `width` and `height` attributes to prevent layout shifts.
