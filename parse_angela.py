from bs4 import BeautifulSoup
with open('ladies-mastery.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')
for h2 in soup.find_all('h2'):
    if 'Ángela' in h2.text or 'Angela' in h2.text:
        parent = h2.find_parent('div')
        print(parent.text[:500])
