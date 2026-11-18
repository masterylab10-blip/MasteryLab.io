from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

ramon_angela = soup.find('section', id='ramon-angela')
if ramon_angela:
    info_div = ramon_angela.find('div', class_='lab-info')
    if info_div:
        # Find the paragraph with Angela's bio
        p = info_div.find('p')
        if p:
            p.decompose()
            
        new_text = """
        <p style="font-size: 1rem; color: #aaa; line-height: 1.5; border-left: 3px solid var(--color-primary); padding-left: 1rem;">
            <em><strong>Ramon</strong> brings over 15 years of professional teaching and performance experience in Bachata and Dominican folklore, with a mission to spread the joy of Dominican dance worldwide.</em><br/><br/>
            <em><strong>Ángela</strong>, born in Italy, brings a diverse background from Russian ballet to Afro-Cuban salsa, having competed in prestigious dance contests since childhood.</em>
        </p>
        """
        info_div.append(BeautifulSoup(new_text, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Bio updated")
