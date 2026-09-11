from PIL import Image
import os
import shutil

upload_dir = '/Users/nawfelmlouki/.gemini/antigravity-ide/brain/7ea6f6a8-c63c-422a-b97e-ebf1b817c33c/.user_uploaded'

# based on file sizes
# media_1789078188454.jpg (79KB) - Image 1 (Ramon)
# media_1789078223363.jpg (393KB) - Image 2 (Micka & Gloria)
# media_1789078688261.jpg (96KB) - Image 3 (Angela)

img_ramon_path = os.path.join(upload_dir, 'media_1789078188454.jpg')
img_mg_path = os.path.join(upload_dir, 'media_1789078223363.jpg')
img_angela_path = os.path.join(upload_dir, 'media_1789078688261.jpg')

# Copy Micka and Gloria
shutil.copy(img_mg_path, 'media/micka_gloria.jpg')

# Combine Ramon and Angela
img1 = Image.open(img_ramon_path)
img2 = Image.open(img_angela_path)

# Resize to have same height
target_height = 800
width1 = int(img1.width * (target_height / img1.height))
width2 = int(img2.width * (target_height / img2.height))

img1_resized = img1.resize((width1, target_height), Image.LANCZOS)
img2_resized = img2.resize((width2, target_height), Image.LANCZOS)

# Create new image
combined = Image.new('RGB', (width1 + width2, target_height))
combined.paste(img1_resized, (0, 0))
combined.paste(img2_resized, (width1, 0))

combined.save('media/ramon_angela_couple.jpg')
print("Images processed.")
