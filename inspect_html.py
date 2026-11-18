from bs4 import BeautifulSoup

with open('men-style-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

body = soup.find('body')
if body:
    print(body.prettify()[:1500])
else:
    print("No body tag found")
