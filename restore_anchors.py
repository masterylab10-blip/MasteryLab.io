import re
from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# 1. Update Hero Cards
hero_cards_container = soup.find('div', class_='hero-cards')
if hero_cards_container:
    cards = hero_cards_container.find_all('a', class_='hero-card')
    for card in cards:
        text = card.get_text().upper()
        if 'LADIES MASTERY' in text:
            card['href'] = '#lady-lab'
        elif 'MEN STYLE' in text:
            card['href'] = '#men-lab'
        elif 'MAN-LADY' in text:
            card['href'] = '#man-lady-lab'
        elif 'M&M' in text:
            card['href'] = '#mym-vol2-lab'
        elif 'BACHATA SENSUAL' in text:
            card['href'] = '#bs-lab'
        elif 'BACHATA DANCERS' in text:
            card['href'] = '#dancers-lab'

# 2. Add IDs to the target blocks
h2_tags = soup.find_all('h2')
for h2 in h2_tags:
    text = h2.get_text().upper()
    
    # Find the closest parent that has class 'lab-content'
    # Actually, the direct parent of h2 is 'lab-info', and its parent is 'lab-content'.
    # Or we can just set id on the closest 'div' wrapping it.
    container = h2.find_parent('div', class_='lab-content')
    if not container:
        # Just use the parent section or div
        container = h2.parent.parent
    
    if 'LADIES MASTERY LAB' in text:
        container['id'] = 'lady-lab'
    elif 'MEN STYLE LAB' in text:
        container['id'] = 'men-lab'
    elif 'MAN-LADY STYLING' in text:
        container['id'] = 'man-lady-lab'
    elif 'M&M LAB VOL.2' in text:
        container['id'] = 'mym-vol2-lab'
    elif 'BACHATA SENSUAL EDUCATION' in text:
        container['id'] = 'bs-lab'
    elif 'BACHATA DANCERS LAB' in text:
        container['id'] = 'dancers-lab'

with open('index.html', 'w') as f:
    f.write(str(soup))
print("Anchors restored")
