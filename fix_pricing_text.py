from bs4 import BeautifulSoup
import re

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

pricing = soup.find(id='pricing')
if pricing:
    # 1. Update prices
    for span in pricing.find_all('span'):
        if '140 CHF' in span.text:
            span.string = span.text.replace('140 CHF', '160 CHF')
            
    # Also update the modal script
    for script in soup.find_all('script'):
        if script.string and '140 CHF' in script.string:
            script.string = script.string.replace('140 CHF', '160 CHF')
            
    # 2. Inject the description above the pricing cards
    # Wrap pricing in a container if it's not
    wrapper = soup.new_tag('div', **{'class': 'container', 'style': 'margin-top: 5rem; margin-bottom: 5rem;'})
    
    desc_html = """
    <div style="text-align: center; max-width: 800px; margin: 0 auto 3rem auto;">
        <h2 class="bio-approach-header" style="font-size: 2.5rem; margin-bottom: 1.5rem;">WHAT YOU GET WHEN YOU JOIN</h2>
        <p style="font-size: 1.2rem; color: #ccc; line-height: 1.8; margin-bottom: 1.5rem;">
            <strong>Men Styling</strong> is Dominican and Fusion with Micka and Ramon. You will improve your Dominican roots with Ramon and learn the flow of Bachata Fusion with Micka.
        </p>
        <p style="font-size: 1.2rem; color: #ccc; line-height: 1.8; margin-bottom: 1.5rem;">
            <strong>Ladies</strong> will learn sensuality and the flow of Sensual Bachata with Gloria, along with authentic Dominican energy from Angela.
        </p>
        <p style="font-size: 1rem; color: rgba(255,255,255,0.5); line-height: 1.6;">
            <em>Micka brings over a decade of expertise in distinctive man styling, while Angela brings a lifetime of training from Russian ballet to Afro-Cuban salsa. Together with Gloria and Ramon, this is a fully comprehensive training experience.</em>
        </p>
    </div>
    """
    
    # We will insert the wrapper before pricing, then move pricing inside wrapper, 
    # but wait, pricing currently has 'margin-top: 5rem; margin-bottom: 5rem;'. 
    # Let's remove those margins from pricing itself.
    pricing['style'] = pricing['style'].replace('margin-top: 5rem; margin-bottom: 5rem;', '')
    
    pricing.insert_before(wrapper)
    wrapper.append(BeautifulSoup(desc_html, 'html.parser'))
    wrapper.append(pricing)

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Pricing and text updated")
