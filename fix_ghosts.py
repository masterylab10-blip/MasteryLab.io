from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Find all regModal divs
modals = soup.find_all('div', id='regModal')
if len(modals) > 1:
    # Remove the first one (the old one)
    modals[0].decompose()
    
# Find all scripts
scripts = soup.find_all('script')
# We need to remove the one that contains 'stripeLinks' and 'selectTicket'
for s in scripts:
    if s.string and 'stripeLinks' in s.string and 'localRegForm.addEventListener' in s.string:
        s.decompose()

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Ghosts removed")
