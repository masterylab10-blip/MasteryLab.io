"""Build public metadata and the homepage calendar from shared source data."""
from pathlib import Path
import json,re,html
UTILITY={'profile','auth','auth-simple','auth-firebase','register','login','portal','application-received','contact-thank-you','registration-thank-you','order-panamio'}
def build(root):
    events=json.loads((root/'data/events.json').read_text())
    cards=[]
    for event in events:
        e={key:html.escape(str(value),quote=True)for key,value in event.items()}
        cards.append(f'''<article class="season-card" data-event-id="{e['id']}"><p class="event-date">{e['dateLabel']}</p><h3>{e['title']}</h3><p class="artists">{e['artists']}</p><p class="description">{e['description']}</p><a class="event-link" href="{e['url']}">EXPLORE THE LAB →</a></article>''')
    homepage=root/'index.html';s=homepage.read_text()
    s=re.sub(r'<!-- EVENTS_GRID_START -->[\s\S]*?<!-- EVENTS_GRID_END -->','<!-- EVENTS_GRID_START -->\n<div class="season-grid">\n'+'\n'.join(cards)+'\n</div>\n<!-- EVENTS_GRID_END -->',s)
    homepage.write_text(s)
    explicit={
      'bachata-dancers-lab':'Bachata Sensual Dancers Lab with Ale & Xidan and Aitor & Sara. 6–7 February 2027 at Area4 Dance Center in Baden, Switzerland.',
      'man-lady-styling-lab':'Men & Lady Styling Lab with Micka, Gloria, Ramon and Angela. 26–27 June 2027 in Baden. Explore Sensual, Fusion and Dominican styling.',
      'bachata-teachers-lab':'Bachata Sensual Teachers Education with Christina & Rebeca. Explore certification levels, training weekends and applications in Baden.',
      'bachata-sensual-lab':'Explore MasteryLab Bachata Sensual programs for dancers and teachers, with training and certification in Baden, Switzerland.',
      'michael-mayra-2027':'M&M Technique Lab with Michael & Mayra: 8–9 May 2027 in Baden. 9 hours of technique, connection and partnerwork. View passes and enquire.',
      'michael-mayra-show-team-2027':'M&M Show Team Lab: 15–16 May 2027 in Baden. 4 hours of bootcamp and 6 hours of choreography and stage training with Michael & Mayra.',
      'michael-mayra-technique-vol2-2027':'M&M Technique Lab Vol. 2: 18–19 September 2027 in Baden. 9 hours of connection, musicality and partnerwork with Michael & Mayra.',
      'artists':'Meet the international artists teaching at MasteryLab. Discover their backgrounds, dance styles and upcoming training in Switzerland.',
      'memories':'Relive MasteryLab through our event photo gallery. Browse moments from our dance intensives and download your favourite photographs.',
      'what-is-masterylab':'Discover MasteryLab: dance intensives focused on technique, connection, personal growth and community in Baden, Switzerland.',
      'education-journal':'Explore the MasteryLab Education Journal for ideas and insights about dance training, technique, teaching and community.',
      'dance-outfit':'Discover MasteryLab dance outfits and Panamio shoes. Explore product details, sizes and ordering information.',
      'partners':'Meet MasteryLab partners supporting our dance community, training experiences and events in Switzerland.',
      'projects':'Explore MasteryLab dance projects and training experiences in Switzerland.',
      'hotels':'Plan your stay for MasteryLab in Baden. Compare partner accommodation, amenities and booking information near the venue.'}
    public=[]
    for page in root.glob('*.html'):
      if page.name.startswith('_'):continue
      s=page.read_text();slug=page.stem;route='/'if slug=='index'else'/'+slug+'/'
      utility=slug in UTILITY or slug.startswith('registration-')
      if utility and not re.search(r'<meta[^>]*name=["\']robots',s,re.I):s=s.replace('</head>','<meta name="robots" content="noindex, follow">\n</head>',1)
      desc=explicit.get(slug)
      if not desc:
        title=re.search(r'<title>(.*?)</title>',s,re.S);label=html.unescape(re.sub(r'\s*\|\s*MasteryLab.*','',title[1]))if title else slug.replace('-',' ').title()
        desc=f'{label}. Explore information and details from MasteryLab in Switzerland.'
      if slug in explicit:
        replacement=f'<meta name="description" content="{html.escape(desc,quote=True)}">'
        s=re.sub(r'<meta\b(?=[^>]*\bname=["\']description["\'])[^>]*>',lambda m:replacement,s,flags=re.I)
      if not re.search(r'<meta[^>]*name=["\']description',s,re.I):s=s.replace('</head>',f'<meta name="description" content="{html.escape(desc,quote=True)}">\n</head>',1)
      noindex='noindex'in s.lower()
      if not noindex:
        title=re.search(r'<title>(.*?)</title>',s,re.S);title=title[1].strip()if title else'MasteryLab'
        img=re.search(r'<img[^>]*\bsrc=["\']([^"\']+)',s)
        social=img[1]if img else'/media/logo-wings-large.webp'
        if 'logo-wordmark'in social:
          imgs=re.findall(r'<img[^>]*\bsrc=["\']([^"\']+)',s);social=next((i for i in imgs if 'logo'not in i),'/media/logo-wings-large.webp')
        tags={'og:type':'website','og:title':html.unescape(title),'og:description':desc,'og:url':'https://masterylab.ch'+route,'og:image':'https://masterylab.ch'+social}
        for key,value in tags.items():
          if f'property="{key}"'not in s:s=s.replace('</head>',f'<meta property="{key}" content="{html.escape(value,quote=True)}">\n</head>',1)
        if 'name="twitter:card"'not in s:s=s.replace('</head>','<meta name="twitter:card" content="summary_large_image">\n</head>',1)
        canonical='<link rel="canonical" href="https://masterylab.ch'+route+'">'
        if not re.search(r'<link[^>]*rel=["\']canonical',s,re.I):s=s.replace('</head>',canonical+'\n</head>',1)
        public.append(route)
      # Add clear event summary near the headline, using shared confirmed facts.
      event=next((event for event in events if event['url']==route),None)
      if event and slug.startswith('michael-mayra') and 'class="event-summary"'not in s:
        summary=f'<div class="event-summary"><span>{html.escape(event["dateLabel"])}</span><span>Area4 Dance Center · Baden</span><span>{"10 hours"if"show-team"in slug else"9 hours"}</span></div>'
        s=s.replace('</h1>','</h1>\n'+summary,1)
      page.write_text(s)
    sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>https://masterylab.ch'+route+'</loc></url>\n'for route in sorted(public))+'</urlset>\n'
    (root/'sitemap.xml').write_text(sitemap)
