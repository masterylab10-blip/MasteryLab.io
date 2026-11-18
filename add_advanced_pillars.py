import re
from bs4 import BeautifulSoup

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Check if it already exists to avoid duplicates
if not soup.find(id='advanced-pillars'):
    pillars_html = """
    <section id="advanced-pillars" style="padding: 6rem 0; background: linear-gradient(180deg, #050505 0%, #111 100%); position: relative; overflow: hidden;">
        <!-- Glowing background orbs -->
        <div style="position: absolute; top: -10%; left: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,42,95,0.1) 0%, transparent 70%); filter: blur(40px); pointer-events: none;"></div>
        <div style="position: absolute; bottom: -10%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(230,175,21,0.1) 0%, transparent 70%); filter: blur(40px); pointer-events: none;"></div>
        
        <div class="container" style="position: relative; z-index: 2;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <span style="color: var(--color-primary); font-weight: 800; letter-spacing: 3px; text-transform: uppercase; font-size: 0.9rem;">The Curriculum</span>
                <h2 style="font-family: 'Anton'; font-size: 3.5rem; text-transform: uppercase; color: #fff; margin-top: 0.5rem; text-shadow: 0 10px 20px rgba(0,0,0,0.5);">Lab Pillars &amp; Benefits</h2>
                <div style="height: 3px; width: 80px; background: linear-gradient(90deg, #ff2a5f, var(--color-primary)); margin: 1.5rem auto 0;"></div>
            </div>

            <div class="adv-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
                <!-- 01 -->
                <div class="adv-card">
                    <div class="adv-num">01</div>
                    <div class="adv-content">
                        <div class="adv-icon">🔥</div>
                        <h3 class="adv-title">DOMINICAN ROOTS</h3>
                        <p class="adv-desc">Ground yourself in authentic origins. Master the true Dominican footwork, flow, and cultural expression with Ramon & Angela.</p>
                    </div>
                </div>
                <!-- 02 -->
                <div class="adv-card">
                    <div class="adv-num">02</div>
                    <div class="adv-content">
                        <div class="adv-icon">✨</div>
                        <h3 class="adv-title">SENSUAL DYNAMICS</h3>
                        <p class="adv-desc">Command attention with sophisticated body rolls, elegant lines, and pure sensuality taught by Gloria.</p>
                    </div>
                </div>
                <!-- 03 -->
                <div class="adv-card">
                    <div class="adv-num">03</div>
                    <div class="adv-content">
                        <div class="adv-icon">⚡</div>
                        <h3 class="adv-title">BACHATA FUSION</h3>
                        <p class="adv-desc">Blend modern urban techniques with traditional elements to create an explosive, distinctive style with Micka.</p>
                    </div>
                </div>
                <!-- 04 -->
                <div class="adv-card">
                    <div class="adv-num">04</div>
                    <div class="adv-content">
                        <div class="adv-icon">🧘</div>
                        <h3 class="adv-title">BODY CONTROL</h3>
                        <p class="adv-desc">Unlock absolute precision through core isolation, improving both your leading and following mechanics instantly.</p>
                    </div>
                </div>
                <!-- 05 -->
                <div class="adv-card">
                    <div class="adv-num">05</div>
                    <div class="adv-content">
                        <div class="adv-icon">👑</div>
                        <h3 class="adv-title">MASCULINE & FEMININE</h3>
                        <p class="adv-desc">Simultaneously develop commanding leader presence and deeply elegant follower styling in our dual-track system.</p>
                    </div>
                </div>
                <!-- 06 -->
                <div class="adv-card">
                    <div class="adv-num">06</div>
                    <div class="adv-content">
                        <div class="adv-icon">🥁</div>
                        <h3 class="adv-title">MUSICALITY</h3>
                        <p class="adv-desc">Translate complex rhythms and instrumentation directly into your solo expression and partnerwork flow.</p>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .adv-card {
                position: relative;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 24px;
                padding: 3rem 2.5rem;
                overflow: hidden;
                backdrop-filter: blur(20px);
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 1;
                cursor: pointer;
            }
            .adv-card::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 24px;
                padding: 2px;
                background: linear-gradient(135deg, rgba(230,175,21,0.5), rgba(255,42,95,0.5));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            .adv-card:hover {
                transform: translateY(-10px);
                background: rgba(255, 255, 255, 0.04);
                box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(230,175,21,0.1);
            }
            .adv-card:hover::before {
                opacity: 1;
            }
            .adv-num {
                position: absolute;
                top: -20px;
                right: -10px;
                font-family: 'Anton';
                font-size: 8rem;
                color: rgba(255, 255, 255, 0.03);
                line-height: 1;
                z-index: -1;
                transition: all 0.5s ease;
            }
            .adv-card:hover .adv-num {
                color: rgba(230,175,21,0.08);
                transform: scale(1.1) rotate(5deg);
            }
            .adv-content {
                position: relative;
                z-index: 2;
            }
            .adv-icon {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                filter: drop-shadow(0 0 10px rgba(230,175,21,0.4));
                transition: transform 0.4s ease;
            }
            .adv-card:hover .adv-icon {
                transform: scale(1.2) translateY(-5px);
            }
            .adv-title {
                font-family: 'Anton';
                font-size: 1.5rem;
                color: #fff;
                margin-bottom: 1rem;
                letter-spacing: 1px;
                text-transform: uppercase;
                background: linear-gradient(90deg, #fff, #ccc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .adv-desc {
                color: rgba(255,255,255,0.6);
                font-size: 0.95rem;
                line-height: 1.7;
                margin: 0;
                transition: color 0.3s ease;
            }
            .adv-card:hover .adv-desc {
                color: rgba(255,255,255,0.9);
            }
        </style>
    </section>
    """
    
    # Insert it right before the pricing wrapper (which has class="container" and contains "WHAT YOU GET WHEN YOU JOIN")
    pricing_wrapper = None
    for div in soup.find_all('div', class_='container'):
        if 'WHAT YOU GET WHEN YOU JOIN' in div.get_text():
            pricing_wrapper = div
            break
            
    if pricing_wrapper:
        pricing_wrapper.insert_before(BeautifulSoup(pillars_html, 'html.parser'))
    else:
        # Fallback to right before footer
        footer = soup.find('footer')
        if footer:
            footer.insert_before(BeautifulSoup(pillars_html, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Advanced Pillars injected")
