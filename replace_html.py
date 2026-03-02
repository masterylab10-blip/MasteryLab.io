import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all href="..."
    # We want to match local html files. E.g. href="michael-mayra.html" -> href="michael-mayra"
    # href="registration-bachata-sensual.html?track=teachers..." -> href="registration-bachata-sensual?track=teachers..."
    
    # Replace index.html with /
    new_content = re.sub(r'href="(/?)(index)\.html([#?]?.*?)?"', r'href="/\3"', content)
    
    # Replace other local html files
    new_content = re.sub(r'href="(/?)([\w-]+)\.html([#?]?.*?)?"', r'href="\1\2\3"', new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            process_file(filepath)

