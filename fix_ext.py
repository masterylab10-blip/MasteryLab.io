with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('href="man-lady-styling-lab"', 'href="man-lady-styling-lab.html"')

with open('index.html', 'w') as f:
    f.write(html)
