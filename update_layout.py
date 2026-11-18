from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

lady_lab = soup.find('section', id='lady-lab')
men_lab = soup.find('section', id='men-lab')

if lady_lab and men_lab:
    # We want them side-by-side. Let's create a new wrapper container.
    wrapper = soup.new_tag('section', id='weekend-labs', style='padding: 4rem 0; background: #050505;')
    container = soup.new_tag('div', **{'class': 'container'})
    
    # Add a title or badge
    badge_html = """
    <div style="text-align: center; margin-bottom: 2rem;">
        <span style="background: linear-gradient(90deg, #ff3b3b, #ff0000); color: white; padding: 10px 20px; border-radius: 30px; font-weight: bold; letter-spacing: 2px; box-shadow: 0 0 15px rgba(255,0,0,0.5); display: inline-block; animation: pulse 2s infinite;">
            🔥 HAPPENING THIS WEEKEND 🔥
        </span>
    </div>
    """
    container.append(BeautifulSoup(badge_html, 'html.parser'))
    
    # Create grid
    grid = soup.new_tag('div', style='display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;')
    
    # Modify lady_lab to fit in grid (remove container class from its child to avoid max-width limits compounding)
    # Actually, we can just extract the lab-content or just keep the structure and apply CSS
    
    # To make them look like cards instead of horizontal layouts, we might need to change lab-content flex direction
    # Let's just wrap the whole sections and use CSS
    # Wait, the sections have `padding` and `max-width`. If we put them in a grid, they might squish awkwardly.
    # It's better to just extract the inner content and style it as a card.
    
    def transform_to_card(lab_section, is_alt=False):
        content = lab_section.find('div', class_='lab-content')
        if content:
            # Change layout to vertical
            content['style'] = 'display: flex; flex-direction: column; gap: 1.5rem; background: #111; padding: 2rem; border-radius: 16px; border: 1px solid #333; height: 100%;'
            
            img_div = content.find('div', class_='lab-image')
            info_div = content.find('div', class_='lab-info')
            
            if img_div:
                img_div['style'] = 'width: 100%;'
            if info_div:
                info_div['style'] = 'width: 100%; text-align: center;'
            
            # Move it to a new div
            card = soup.new_tag('div')
            card.append(content)
            return card
        return None

    card1 = transform_to_card(lady_lab)
    card2 = transform_to_card(men_lab)
    
    if card1 and card2:
        grid.append(card1)
        grid.append(card2)
        container.append(grid)
        wrapper.append(container)
        
        # Replace the original sections
        lady_lab.insert_before(wrapper)
        lady_lab.decompose()
        men_lab.decompose()
        
        # Add pulse animation if not exists
        style_tag = soup.new_tag('style')
        style_tag.string = """
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 15px rgba(255,0,0,0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255,0,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 15px rgba(255,0,0,0.5); }
        }
        """
        soup.head.append(style_tag)
        
        with open('index.html', 'w') as f:
            f.write(str(soup))
        print("Updated")
    else:
        print("Failed to transform to cards")
else:
    print("Labs not found")

