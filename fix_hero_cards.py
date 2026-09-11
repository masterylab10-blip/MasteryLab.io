import re
from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

hero_cards_container = soup.find('div', class_='hero-cards')
if hero_cards_container:
    # 1. Update existing hrefs to point directly to the HTML pages instead of broken hash links, 
    # since we refactored the homepage layout and it's cleaner to link to pages if anchors are gone.
    # Alternatively, add anchor IDs to the sections. Let's just link to the pages.
    for a in hero_cards_container.find_all('a', class_='hero-card'):
        href = a.get('href', '')
        if href == '#lady-lab':
            a['href'] = 'ladies-mastery.html'
        elif href == '#men-lab':
            a['href'] = 'men-style-lab.html'
        elif href == '#mym-vol2-lab':
            a['href'] = 'michael-mayra-vol2.html'
        elif href == '#bs-lab':
            a['href'] = 'bachata-sensual-lab.html'
        elif href == '#dancers-lab':
            a['href'] = 'bachata-dancers-lab.html'

    # 2. Add new hero card for MAN-LADY STYLING LAB
    new_card_html = """
    <a class="hero-card" href="man-lady-styling-lab.html">
        <h3 class="text-primary">MAN-LADY STYLING LAB</h3>
        <p>Micka, Ramon, Gloria &amp; Angela</p>
    </a>
    """
    
    # We should insert it after the Men Style Lab card (which is index 1, or after lady lab)
    # Let's insert it as the 3rd card
    cards = hero_cards_container.find_all('a', class_='hero-card')
    if len(cards) >= 2:
        cards[1].insert_after(BeautifulSoup(new_card_html, 'html.parser'))
    else:
        hero_cards_container.append(BeautifulSoup(new_card_html, 'html.parser'))

with open('index.html', 'w') as f:
    f.write(str(soup))
print("Hero cards updated")
