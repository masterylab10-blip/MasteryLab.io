with open('dominican-sensual-lab.html', 'r') as f:
    content = f.read()

import re
# Look for background: url('media/...') and replace with media/dominican-sensual-cover.jpg
new_content = re.sub(r'background:\s*url\([^)]+\)', "background: url('media/dominican-sensual-cover.jpg')", content)

with open('dominican-sensual-lab.html', 'w') as f:
    f.write(new_content)

print("Cover updated!")
