import os
import re

def replacer(match):
    href = match.group(1)
    if not href.startswith('http') and not href.startswith('#') and not href.startswith('mailto:') and href != '/' and '.' not in href:
        return f'href="{href}.html"'
    return match.group(0)

for filename in os.listdir('.'):
    if filename.endswith('.html'):
        with open(filename, 'r') as f:
            html = f.read()
        
        new_html = re.sub(r'href="([^"]+)"', replacer, html)
        
        if html != new_html:
            with open(filename, 'w') as f:
                f.write(new_html)
            print(f"Fixed links in {filename}")

