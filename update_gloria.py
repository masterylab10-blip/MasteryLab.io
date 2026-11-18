from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

micka_gloria = soup.find('section', id='micka-gloria')
if micka_gloria:
    info_div = micka_gloria.find('div', class_='lab-info')
    if info_div:
        p = info_div.find('p')
        if p:
            p.decompose()
            
        new_text = """
        <p style="font-size: 1rem; color: #aaa; line-height: 1.5; border-left: 3px solid var(--color-primary); padding-left: 1rem;">
            <em><strong>Micka</strong>, a professional dancer from France, has captivated audiences for over a decade with his expertise in Bachata, distinctive man styling, and exceptional social dancing skills.</em><br/><br/>
            <em><strong>Gloria</strong>, born in Spain, is known for her sophisticated and sensual dance style. With a rich background from ballroom to competing globally, she will push you to express your most daring side in every movement.</em>
        </p>
        """
        info_div.append(BeautifulSoup(new_text, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Bio updated")
