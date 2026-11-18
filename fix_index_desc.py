from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

man_lady = soup.find('section', id='man-lady-styling')
if man_lady:
    p = man_lady.find('p')
    if p:
        p.string = "Men Styling is Dominican and Fusion with Micka and Ramon, improving Dominican roots with Ramon and learning the flow of Bachata Fusion with Micka. Ladies learn the sensuality and flow of Sensual with Gloria and the authentic Dominican energy from Angela."
    
with open('index.html', 'w') as f:
    f.write(str(soup))
print("Index updated")
