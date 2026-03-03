import os
import re
import sys

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("BeautifulSoup not found. Installing...")
    os.system(f"{sys.executable} -m pip install beautifulsoup4 lxml")
    from bs4 import BeautifulSoup

SIZES = {"small": 480, "medium": 800, "large": 1200}
MEDIA_DIR = "media"

def update_html_files():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for html_file in html_files:
        print(f"Processing {html_file}...")
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        changed = False

        # Preload LCP Backgrounds (Check CSS classes or generic hero backgrounds)
        # We find `.bio-hero-bg` that could be using a background image and we preload its webp.
        # It's safer to preload the explicit hero background if known, but here we focus on `<img>`.

        for img in soup.find_all('img'):
            src = img.get('src', '')
            
            # Skip non-media images
            if not src.startswith(MEDIA_DIR + '/'):
                continue

            basename_with_ext = os.path.basename(src)
            basename, ext = os.path.splitext(basename_with_ext)
            
            # Skip already responsive setup if inside <picture>
            if img.parent and img.parent.name == 'picture':
                continue

            # Skip small static elements like logos by default, except we want webp for everything
            # If it's the main header logo, we shouldn't lazy load, but we can still use webp
            is_lcp_or_above_fold = False
            if 'logo' in src.lower() or img.get('fetchpriority') == 'high' or 'hero' in src.lower():
                is_lcp_or_above_fold = True
                if not img.get('fetchpriority'):
                    img['fetchpriority'] = 'high'
            
            # Change src to base webp if it exists
            webp_path = os.path.join(MEDIA_DIR, f"{basename}.webp")
            if os.path.exists(webp_path):
                img['src'] = f"media/{basename}.webp"
            
            # Apply lazy loading if it's not above the fold
            if not is_lcp_or_above_fold and not img.get('loading'):
                img['loading'] = 'lazy'
                
            # If it's a huge image, create a <picture> wrapper
            # Only do this if responsive versions were generated AND it's not a small icon
            if os.path.exists(os.path.join(MEDIA_DIR, f"{basename}-small.webp")):
                picture = soup.new_tag('picture')
                
                source_small = soup.new_tag('source', media=f"(max-width: {SIZES['small']}px)", srcset=f"media/{basename}-small.webp", type="image/webp")
                source_medium = soup.new_tag('source', media=f"(max-width: {SIZES['medium']}px)", srcset=f"media/{basename}-medium.webp", type="image/webp")
                source_large = soup.new_tag('source', srcset=f"media/{basename}-large.webp", type="image/webp")
                
                picture.append(source_small)
                picture.append(source_medium)
                picture.append(source_large)
                
                img.replace_with(picture)
                picture.append(img)
                
            changed = True

        if changed:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Updated {html_file}")

if __name__ == "__main__":
    update_html_files()
