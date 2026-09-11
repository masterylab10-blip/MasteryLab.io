from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

if soup.title:
    soup.title.string = "Man-Lady Styling Lab | MasteryLab.io"

hero_h1 = soup.find('h1')
if hero_h1:
    hero_h1.string = "MAN-LADY STYLING LAB"

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("man-lady-styling-lab.html updated")
