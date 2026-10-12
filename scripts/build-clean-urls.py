#!/usr/bin/env python3
"""Generate GitHub Pages directory routes from the root HTML source pages."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
pages=[p for p in ROOT.glob('*.html') if not p.name.startswith('_')]
routes={p.name:('/' if p.name=='index.html' else '/'+p.stem+'/') for p in pages}
def links(text):
    for name,route in sorted(routes.items(),key=lambda x:-len(x[0])):
        # Replace local page references only, including absolute MasteryLab URLs.
        text=re.sub(r'(?<![\w/-])'+re.escape(name)+r'(?=[\?\#\s\"\'<>)]|$)',lambda m:route,text)
        text=text.replace('https://masterylab.ch/'+name,'https://masterylab.ch'+route)
    # Repair old suffixes incorrectly appended to fragments/query values.
    text=re.sub(r'((?:href|action)=[\"\'])([^\"\']*)',lambda m:m[1]+m[2].replace('.html',''),text)
    # Directory routes require root-relative assets and page links.
    def attr(m):
        value=m[3]
        if value and not value.startswith(('/', '#', '$', '{')) and not re.match(r'[a-zA-Z][\w+.-]*:',value):
            if m[1].lower()=='srcset':value=', '.join('/'+v.strip() if not v.strip().startswith('/') else v.strip() for v in value.split(','))
            else:value='/'+value.removeprefix('./')
        return m[1]+'='+m[2]+value+m[2]
    text=re.sub(r'\b(href|src|poster|action|srcset)\s*=\s*([\"\'])(.*?)\2',attr,text,flags=re.I)
    # JS, inline CSS and dynamically assigned event imagery.
    text=re.sub(r'([\"\'(])(?:\./)?(media/|assets/)',r'\1/\2',text)
    return text
for p in list(ROOT.glob('*.js'))+pages:
    original=p.read_text();updated=links(original)
    if p.suffix=='.html':
        # Shared script handles old .html entrypoints; it does nothing on clean routes.
        if '/clean-urls.js' not in updated:
            updated=re.sub(r'(<head\b[^>]*>)',r'\1\n<script src="/clean-urls.js?v=1"></script>',updated,count=1,flags=re.I)
    if updated!=original:p.write_text(updated)
for p in pages:
    if p.name=='index.html':continue
    destination=ROOT/p.stem/'index.html';destination.parent.mkdir(exist_ok=True)
    text=p.read_text()
    if not re.search(r'<link[^>]+rel=[\"\']canonical',text,re.I) and 'noindex' not in text.lower():
        text=text.replace('</head>',f'<link rel="canonical" href="https://masterylab.ch{routes[p.name]}">\n</head>',1)
    destination.write_text(text)
p=ROOT/'sitemap.xml';text=p.read_text()
for name,route in routes.items():
    text=text.replace('https://masterylab.ch/'+name,'https://masterylab.ch'+route)
    if name!='index.html':text=re.sub(r'https://masterylab\.ch/'+re.escape(name[:-5])+r'(?=<)', 'https://masterylab.ch'+route,text)
p.write_text(text)
print(f'Generated {len(pages)-1} clean page routes.')
