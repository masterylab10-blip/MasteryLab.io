from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

if not soup.find(id='schedule'):
    dates_html = """
    <!-- Dates, Schedule & Location -->
    <div class="bio-section-divider"></div>
    <section class="bio-schedule-section" id="schedule" style="padding-top: 4rem;">
        <div class="container">
            <h2 style="text-align: center; font-family: 'Anton'; font-size: 3rem; text-transform: uppercase; margin-bottom: 3rem;">
                DATES &amp; LOCATION
            </h2>
            <div class="grid-2 bio-schedule-grid">
                <!-- Schedule Card -->
                <div class="schedule-info">
                    <div class="bio-info-card">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🗓️</div>
                        <h3 style="font-family: 'Anton'; font-size: 2rem; color: var(--color-primary); margin-bottom: 1rem; text-transform: uppercase;">
                            Dates &amp; Schedule
                        </h3>
                        <div style="height: 2px; width: 60px; background: var(--color-primary); margin: 0 auto 1.5rem;"></div>
                        <p style="font-size: 1.3rem; color: #fff; font-weight: 600; margin-bottom: 0.5rem;">
                            26-27 JUNE 2027
                        </p>
                        <p style="font-size: 1rem; color: var(--color-text-muted); line-height: 1.6;">
                            Detailed timetable is coming soon. Stay tuned for updates!
                        </p>
                    </div>
                </div>
                <!-- Location Card -->
                <div class="location-info">
                    <div class="bio-info-card">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📍</div>
                        <h3 style="font-family: 'Anton'; font-size: 2rem; color: var(--color-primary); margin-bottom: 1rem; text-transform: uppercase;">
                            Location
                        </h3>
                        <div style="height: 2px; width: 60px; background: var(--color-primary); margin: 0 auto 1.5rem;"></div>
                        <p style="font-size: 1.3rem; color: #fff; font-weight: 600; margin-bottom: 0.5rem;">
                            Area4 Dance Center
                        </p>
                        <p style="font-size: 1rem; color: var(--color-text-muted); line-height: 1.6;">
                            Mellingerstrasse 2, 5400 Baden
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    """

    # We want to insert it after the advanced-pillars section if possible
    pillars = soup.find(id='advanced-pillars')
    if pillars:
        pillars.insert_after(BeautifulSoup(dates_html, 'html.parser'))
    else:
        # Fallback to before pricing
        pricing = None
        for div in soup.find_all('div', class_='container'):
            if 'WHAT YOU GET WHEN YOU JOIN' in div.get_text():
                pricing = div
                break
        
        if pricing:
            pricing.insert_before(BeautifulSoup(dates_html, 'html.parser'))

    with open('man-lady-styling-lab.html', 'w') as f:
        f.write(str(soup))
    print("Dates added")
else:
    print("Dates already exist")
