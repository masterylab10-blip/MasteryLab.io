from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

body = soup.find('body')
if body:
    for child in body.children:
        if child.name:
            print(child.name, child.get('id', 'no-id'), child.get('class', []))
