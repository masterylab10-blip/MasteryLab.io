from bs4 import BeautifulSoup
import re

# Update index.html
with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

man_lady_section = soup.find('section', id='man-lady-styling')
if man_lady_section:
    # Update date inside the ticket
    date_h3 = man_lady_section.find('h3')
    if date_h3 and '26-27 JUNE' in date_h3.text:
        date_h3.string = '26-27 JUNE 2027'
    
    # Add a title/badge above this section
    # Let's wrap it in a container or just insert a title above it
    badge_html = """
    <div style="text-align: center; margin: 4rem 0 2rem 0;">
        <span style="background: linear-gradient(90deg, #1e3c72, #2a5298); color: white; padding: 10px 20px; border-radius: 30px; font-weight: bold; letter-spacing: 2px; box-shadow: 0 0 15px rgba(42,82,152,0.5); display: inline-block;">
            📅 BOOK YOUR PLACE FOR NEXT YEAR 📅
        </span>
    </div>
    """
    badge = BeautifulSoup(badge_html, 'html.parser')
    man_lady_section.insert_before(badge)

with open('index.html', 'w') as f:
    f.write(str(soup))


# Update man-lady-styling-lab.html
with open('man-lady-styling-lab.html', 'r') as f:
    page_soup = BeautifulSoup(f, 'html.parser')

for span in page_soup.find_all('span'):
    if '26-27 JUNE' in span.text:
        span.string = '26-27 JUNE 2027'
        
for h3 in page_soup.find_all('h3'):
    if '26-27 JUNE' in h3.text:
        h3.string = '26-27 JUNE 2027'

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(page_soup))

print("Updated for 2027")
