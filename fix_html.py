from bs4 import BeautifulSoup
import re

with open('men-style-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Title
if soup.title:
    soup.title.string = "Dominican & Sensual Labs | MasteryLab.io"

# Hero Section
hero_h1 = soup.find('h1')
if hero_h1:
    hero_h1.string = "DOMINICAN & SENSUAL LABS"

for p in soup.find_all('p', class_='bio-hero-subtitle'):
    if "For the First Time" in p.text:
        pass

# Change date in hero overlay text or tags
for span in soup.find_all('span'):
    if '16 & 17 November' in span.text:
        span.string = '26-27 JUNE'

# Create sections for artists
main_content = soup.find('main')
if main_content:
    # Remove existing artist sections
    for sec in main_content.find_all('section'):
        sec.decompose()
    
    # Section 1: Micka & Gloria
    sec1 = soup.new_tag('section', id='micka-gloria', **{'class': 'lab-section'})
    sec1_html = """
    <div class="container lab-content">
        <div class="lab-image">
            <img src="media/micka_gloria.jpg" alt="Micka & Gloria" style="width:100%; border-radius: 12px; object-fit: cover;">
        </div>
        <div class="lab-info">
            <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Sensual and Fusion Menstyle</span>
            <h2>MICKA & GLORIA</h2>
            <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">26-27 JUNE</h3>
            <p>Join Micka & Gloria for an immersive experience focusing on sensual and fusion elements.</p>
        </div>
    </div>
    """
    sec1.append(BeautifulSoup(sec1_html, 'html.parser'))
    
    # Section 2: Ramon & Angela
    sec2 = soup.new_tag('section', id='ramon-angela', **{'class': 'lab-section alt'})
    sec2_html = """
    <div class="container lab-content">
        <div class="lab-image">
            <img src="media/ramon_angela_couple.jpg" alt="Ramon & Angela" style="width:100%; border-radius: 12px; object-fit: cover;">
        </div>
        <div class="lab-info">
            <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Dominican Men-Lady Style</span>
            <h2>RAMON & ANGELA</h2>
            <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">26-27 JUNE</h3>
            <p>Elevate your dance with Ramon & Angela focusing on Dominican style footwork and partnerwork.</p>
        </div>
    </div>
    """
    sec2.append(BeautifulSoup(sec2_html, 'html.parser'))
    
    main_content.append(sec1)
    main_content.append(sec2)

with open('dominican-sensual-lab.html', 'w') as f:
    f.write(str(soup))
print("HTML built")
