from bs4 import BeautifulSoup
import re

with open('index.html', 'r') as f:
    index_soup = BeautifulSoup(f, 'html.parser')

men_lab = index_soup.find('section', id='men-lab')
if men_lab:
    new_ticket_html = """
        <!-- Lab Details Section: Man-Lady Styling Lab -->
        <section class="lab-section" id="man-lady-styling">
            <div class="container lab-content">
                <div class="lab-image">
                    <a href="man-lady-styling-lab.html">
                        <img alt="Man-Lady Styling Lab" loading="lazy" src="media/dominican-sensual-cover.jpg" style="width:100%; border-radius: 12px;"/>
                    </a>
                </div>
                <div class="lab-info">
                    <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Dominican & Sensual</span>
                    <h2>MAN-LADY STYLING LAB</h2>
                    <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">26-27 JUNE</h3>
                    <p>
                        Explore Sensual and Fusion Menstyle with Micka & Gloria, and Dominican Men-Lady Style with Ramon & Angela.
                    </p>
                    <a class="btn btn-outline ticket-shape" href="man-lady-styling-lab.html">More Info</a>
                </div>
            </div>
        </section>
    """
    new_ticket = BeautifulSoup(new_ticket_html, 'html.parser')
    
    # Check if we already inserted it
    if not index_soup.find('section', id='man-lady-styling'):
        men_lab.insert_after(new_ticket)

with open('index.html', 'w') as f:
    f.write(str(index_soup))

print("index.html updated")
