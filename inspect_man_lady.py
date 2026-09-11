from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

print("Sections in main:")
main = soup.find('main')
if main:
    for sec in main.find_all('section', recursive=False):
        print(sec.get('id', 'no-id'), sec.get('class', []))

print("\nOther sections in body:")
for sec in soup.body.find_all('section', recursive=False):
    if sec.parent.name != 'main':
        print(sec.get('id', 'no-id'), sec.get('class', []))
