import os
try:
    from PIL import Image
except ImportError:
    print("Pillow not found. Installing...")
    os.system("pip install Pillow")
    from PIL import Image

MEDIA_DIR = "media"
SIZES = {"small": 480, "medium": 800, "large": 1200}

def optimize_image(filename):
    if not any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg"]):
        return

    basename = os.path.splitext(filename)[0]
    filepath = os.path.join(MEDIA_DIR, filename)
    
    with Image.open(filepath) as img:
        # Save as main WebP
        img.save(os.path.join(MEDIA_DIR, f"{basename}.webp"), "WEBP", quality=85)
        
        # Create sized versions
        for size_name, width in SIZES.items():
            if img.width > width:
                ratio = width / float(img.width)
                height = int(float(img.height) * float(ratio))
                resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                resized_img.save(os.path.join(MEDIA_DIR, f"{basename}-{size_name}.webp"), "WEBP", quality=85)
            else:
                # If image is smaller than target size, just save as webp with size name
                img.save(os.path.join(MEDIA_DIR, f"{basename}-{size_name}.webp"), "WEBP", quality=85)

if __name__ == "__main__":
    for file in os.listdir(MEDIA_DIR):
        if not "-" in file: # Skip already generated versions
            print(f"Optimizing {file}...")
            optimize_image(file)
