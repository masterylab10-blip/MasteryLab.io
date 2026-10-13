#!/usr/bin/env python3
"""Validate published routes, anchors, assets, metadata and image layout hints."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import collections,xml.etree.ElementTree as ET,json
ROOT=Path(__file__).resolve().parent.parent
class Document(HTMLParser):
    def __init__(self,text):super().__init__();self.tags=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
def check():
    errors=[];pages=[p for p in ROOT.glob('*.html')if not p.name.startswith('_')]
    for page in pages:
        text=page.read_text();doc=Document(text);ids=[attrs['id']for tag,attrs in doc.tags if 'id'in attrs]
        for id,count in collections.Counter(ids).items():
            if count>1:errors.append(f'{page.name}: duplicate ID {id}')
        for tag,attrs in doc.tags:
            if tag=='img':
                for key in ['alt','width','height']:
                    if key not in attrs:errors.append(f'{page.name}: image missing {key}: {attrs.get("src")}')
            for key in ['src','href','poster']:
                url=attrs.get(key,'');parts=urlsplit(url)
                if not url or parts.scheme or parts.netloc:continue
                if url.startswith('#'):
                    if url not in ['#','#book'] and unquote(url[1:])not in ids:errors.append(f'{page.name}: missing target {url}')
                elif not (ROOT/unquote(parts.path).lstrip('/')).exists():errors.append(f'{page.name}: missing asset/route {url}')
        if not any(tag=='meta'and attrs.get('name')=='description'for tag,attrs in doc.tags):errors.append(f'{page.name}: missing description')
        if 'noindex'not in text.lower() and not any(tag=='link'and attrs.get('rel')=='canonical'for tag,attrs in doc.tags):errors.append(f'{page.name}: missing canonical')
        if page.name!='index.html' and not (ROOT/page.stem/'index.html').is_file():errors.append(f'{page.name}: clean route missing')
    sitemap=(ROOT/'sitemap.xml').read_text();ET.fromstring(sitemap)
    if 'feedback-7c9e2b'in sitemap:errors.append('Unlisted feedback page appears in sitemap')
    if 'michael-mayra-show-team-2027/'not in sitemap:errors.append('Missing Show Team sitemap route')
    if 'class="lab-journey"'in(ROOT/'index.html').read_text():errors.append('Experimental animation is active')
    events=json.loads((ROOT/'data/events.json').read_text())
    for event in events:
        if not (ROOT/event['url'].strip('/')/'index.html').is_file():errors.append('Event route missing: '+event['url'])
    if errors:raise SystemExit('\n'.join(errors))
    print(f'Checked {len(pages)} source pages and {len(events)} calendar events: routes, IDs, anchors, metadata, image hints and private-page exclusion passed.')
if __name__=='__main__':check()
