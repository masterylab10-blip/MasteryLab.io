with open('index.html', 'r') as f:
    content = f.read()

target = """<<<<<<< Updated upstream
=======
                <div class="lab-info">
                    <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Solo
                        Expression</span>
                    <h2>MEN STYLE LAB</h2>
                    <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">Refine
                        Your Presence</h3>
                    <p>
                        Dedicated training for leaders focusing on body control, footwork, and masculine styling
                        elements.
                        Elevate your dance with confidence and precision.
                    </p>
                    <a class="btn btn-outline ticket-shape" href="registration-men-styling">Register Now</a>
                </div>
>>>>>>> Stashed changes
                <div class="lab-image">
                    <a href="men-style-lab">
                        <img alt="Men Style Dance Lab with Micka" loading="lazy" src="media/menstyle_lab_cover.webp" />
                    </a>
                </div>
                <div class="lab-info">
                    <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Solo Expression</span>
                    <h2>MEN STYLE LAB</h2>
                    <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">With Micka</h3>
                    <p>
                        Dedicated training for leaders focusing on body control, footwork, and masculine styling
                        elements. Stand out on the dance floor with a style and smooth footwork groove.
                    </p>
                    <a class="btn btn-outline ticket-shape" href="men-style-lab">More Info</a>
                </div>"""

replacement = """                <div class="lab-image">
                    <a href="men-style-lab">
                        <img alt="Men Style Dance Lab with Micka" loading="lazy" src="media/menstyle_lab_cover.webp" />
                    </a>
                </div>
                <div class="lab-info">
                    <span class="text-primary text-uppercase" style="letter-spacing: 2px; font-weight: 700;">Solo
                        Expression</span>
                    <h2>MEN STYLE LAB</h2>
                    <h3 style="color: #fff; margin-bottom: 1rem; font-family: 'Outfit'; text-transform: none;">Refine
                        Your Presence</h3>
                    <p>
                        Dedicated training for leaders focusing on body control, footwork, and masculine styling
                        elements.
                        Elevate your dance with confidence and precision.
                    </p>
                    <a class="btn btn-outline ticket-shape" href="registration-men-styling">Register Now</a>
                </div>"""

new_content = content.replace(target, replacement)
if content == new_content:
    print("Target not found!")
else:
    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Replaced successfully!")
