from bs4 import BeautifulSoup
import re

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

body = soup.find('body')

# Collect elements to delete
to_delete = []
for child in body.children:
    if child.name == 'section':
        if 'bio-intro' in child.get('class', []):
            to_delete.append(child)
        elif 'section-padding' in child.get('class', []):
            to_delete.append(child)
        elif 'bio-pillars-container' in child.get('class', []):
            to_delete.append(child)
        elif 'bio-schedule-section' in child.get('class', []):
            to_delete.append(child)
        elif not child.get('id') and not child.get('class'):
            to_delete.append(child)
    elif child.name == 'div' and 'bio-section-divider' in child.get('class', []):
        to_delete.append(child)

for el in to_delete:
    el.decompose()

# Insert the two artists right after header
header = soup.find('header', class_='bio-hero')

sec1_html = """
<section id="micka-gloria" class="lab-section">
    <div class="container lab-content" style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; margin-top: 4rem; margin-bottom: 4rem;">
        <div class="lab-image" style="flex: 1; min-width: 300px;">
            <img src="media/micka_gloria.jpg" alt="Micka & Gloria" style="width:100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        </div>
        <div class="lab-info" style="flex: 1; min-width: 300px;">
            <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Sensual and Fusion Menstyle</span>
            <h2 style="font-size: 3rem; margin-bottom: 1rem;">MICKA & GLORIA</h2>
            <h3 style="color: #fff; margin-bottom: 1.5rem; font-family: 'Outfit'; text-transform: none;">26-27 JUNE 2027</h3>
            <p style="font-size: 1.2rem; color: #ccc; line-height: 1.6;">Join Micka & Gloria for an immersive experience focusing on sensual and fusion elements.</p>
        </div>
    </div>
</section>
"""

sec2_html = """
<section id="ramon-angela" class="lab-section alt" style="background: #0a0a0a; padding-bottom: 4rem; padding-top: 4rem;">
    <div class="container lab-content" style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; flex-direction: row-reverse;">
        <div class="lab-image" style="flex: 1; min-width: 300px;">
            <img src="media/ramon_angela_couple.jpg" alt="Ramon & Angela" style="width:100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        </div>
        <div class="lab-info" style="flex: 1; min-width: 300px;">
            <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Dominican Men-Lady Style</span>
            <h2 style="font-size: 3rem; margin-bottom: 1rem;">RAMON & ANGELA</h2>
            <h3 style="color: #fff; margin-bottom: 1.5rem; font-family: 'Outfit'; text-transform: none;">26-27 JUNE 2027</h3>
            <p style="font-size: 1.2rem; color: #ccc; line-height: 1.6;">Elevate your dance with Ramon & Angela focusing on Dominican style footwork and partnerwork.</p>
        </div>
    </div>
</section>
"""

if header:
    header.insert_after(BeautifulSoup(sec2_html, 'html.parser'))
    header.insert_after(BeautifulSoup(sec1_html, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Lab fixed")
