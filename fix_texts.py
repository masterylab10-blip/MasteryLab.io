from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

micka_gloria = soup.find('section', id='micka-gloria')
if micka_gloria:
    info_div = micka_gloria.find('div', class_='lab-info')
    if info_div:
        # Update text
        p = info_div.find('p')
        if p:
            p.decompose()
        
        # Add new text blocks
        new_text = """
        <div style="font-size: 1.2rem; color: #ccc; line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>Men:</strong> Learn the flow of Bachata Fusion with Micka.<br/>
            <strong>Ladies:</strong> Learn the sensuality and the flow of Sensual with Gloria.
        </div>
        <p style="font-size: 1rem; color: #aaa; line-height: 1.5; border-left: 3px solid var(--color-primary); padding-left: 1rem;">
            <em>Micka, a professional dancer from France, has been captivating audiences for over a decade with his expertise in Bachata. Renowned for his distinctive man styling and exceptional social dancing skills, Micka has established himself as a prominent figure in the dance community.</em>
        </p>
        """
        info_div.append(BeautifulSoup(new_text, 'html.parser'))

ramon_angela = soup.find('section', id='ramon-angela')
if ramon_angela:
    info_div = ramon_angela.find('div', class_='lab-info')
    if info_div:
        # Update text
        p = info_div.find('p')
        if p:
            p.decompose()
            
        new_text = """
        <div style="font-size: 1.2rem; color: #ccc; line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>Men:</strong> Improve your Dominican roots with Ramon.<br/>
            <strong>Ladies:</strong> Learn the authentic Dominican energy from Angela.
        </div>
        <p style="font-size: 1rem; color: #aaa; line-height: 1.5; border-left: 3px solid var(--color-primary); padding-left: 1rem;">
            <em>Born in Puglia, Italy, Ángela began dancing at the age of 5. Her training spans ballroom & Latin, contemporary, street, hip-hop, lyrical jazz, modern, Afro-Cuban salsa, bachata, LA style salsa, salsa on2, and Russian ballet. She has appeared on multiple Italian TV shows and competed in prestigious dance contests since childhood.</em>
        </p>
        """
        info_div.append(BeautifulSoup(new_text, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Texts updated")
