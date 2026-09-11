from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

tickets = soup.find_all('section', id=lambda x: x and 'lab' in x)
for t in tickets:
    print(t.get('id'))
    print(t.prettify()[:300])
    print("-----")
