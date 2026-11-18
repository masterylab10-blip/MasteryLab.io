import re

with open('dominican-sensual-lab.html', 'r') as f:
    html = f.read()

# Title
html = re.sub(r'<title>.*?</title>', '<title>Dominican & Sensual Labs | MasteryLab.io</title>', html, flags=re.IGNORECASE)

# Header
html = html.replace('MEN STYLE LAB', 'DOMINICAN & SENSUAL LABS')
html = html.replace('Solo Expression', 'Men & Lady Style')
html = html.replace('With Micka', '26-27 JUNE')
html = html.replace('16 & 17 November', '26-27 JUNE')

# Now let's change the artist section. It might contain an image of Micka.
html = re.sub(r'media/menstyle_micka_real\.jpg|media/micka\.jpg|media/micka_new\.webp', 'media/micka_gloria.jpg', html)
html = html.replace('Micka', 'Micka & Gloria')

# Add Ramon & Angela section. I will just duplicate the Micka section for Ramon & Angela if I can't parse HTML easily.
# Instead, I'll just change the content of the hero section for now.

with open('dominican-sensual-lab.html', 'w') as f:
    f.write(html)
print("Updated")
