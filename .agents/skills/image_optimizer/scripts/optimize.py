import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow not found. Installing...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

MEDIA_DIR = "media"
SIZES = {"small": 480, "medium": 800, "large": 1200}

def optimize_image(filename):
    if not any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg"]):
        return

    basename = os.path.splitext(filename)[0]
    
    # Skip if it's already one of our generated sizes
    if any(basename.endswith(f"-{size}") for size in SIZES.keys()):
        return

    filepath = os.path.join(MEDIA_DIR, filename)
    webp_path = os.path.join(MEDIA_DIR, f"{basename}.webp")
    
    # Check if .webp version already exists and is newer than the original
    if os.path.exists(webp_path) and os.path.getmtime(webp_path) > os.path.getmtime(filepath):
        # Already optimized
        return
        
    try:
        with Image.open(filepath) as img:
            print(f"Optimizing {filename}...")
            # Save as main WebP
            img.save(webp_path, "WEBP", quality=85)
            
            # Create sized versions
            for size_name, width in SIZES.items():
                size_path = os.path.join(MEDIA_DIR, f"{basename}-{size_name}.webp")
                if img.width > width:
                    ratio = width / float(img.width)
                    height = int(float(img.height) * float(ratio))
                    resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                    resized_img.save(size_path, "WEBP", quality=85)
                else:
                    # If image is smaller than target size, just save original size
                    img.save(size_path, "WEBP", quality=85)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    for file in os.listdir(MEDIA_DIR):
        optimize_image(file)
