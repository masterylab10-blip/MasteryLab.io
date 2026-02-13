document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Logo Click Behavior: Smooth Scroll to Top if on Home Page
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function (e) {
            const currentPath = window.location.pathname;
            // If the current path is exactly '/registration-bachata-sensual', redirect to the version without .html
            if (currentPath === '/registration-bachata-sensual') {
                window.location.href = '/registration-bachata-sensual';
                return; // Stop further execution
            }
            const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');

            if (isHomePage) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Mobile Menu Toggle (Simple version)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.flexDirection = 'column';
                navLinks.style.background = 'rgba(10, 10, 15, 0.95)';
                navLinks.style.padding = '2rem';
            }
        });
    }

    // Modal Logic
    const modal = document.getElementById('regModal');
    const openBtns = document.querySelectorAll('a[href="#book"]');
    const closeBtn = document.getElementById('closeModal');
    const regForm = document.getElementById('regForm');

    if (modal) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Form Submission (Only for index.html modal form)
        if (regForm) {
            regForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const formData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    city: document.getElementById('city').value,
                    role: document.getElementById('role').value,
                    email: document.getElementById('email').value,
                    whatsapp: document.getElementById('whatsapp').value
                };

                // 1. DATA SAVING: Send to Google Sheets (Silent Background)
                const googleSheetUrl = "https://script.google.com/macros/s/AKfycbxbleUuZYNKhQhW87bakoOiRSCKB2cW-AiH0dxnoq7J9y43Q8feTvY1Sji_9_wm_T8/exec";

                fetch(googleSheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    body: JSON.stringify(formData),
                    keepalive: true
                });

                // 2. EMAIL & REDIRECT: Trigger Native FormSubmit (Visual Foreground)
                setTimeout(() => {
                    this.submit();
                }, 300);
            });
        }
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add visible class styling dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Scrollspy for Homepage Side Nav
    const sideNavLinks = document.querySelectorAll('.side-nav a');
    const sections = document.querySelectorAll('section.hero-link, section.track-section');

    if (sideNavLinks.length > 0 && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    sideNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.target === id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Language Switcher Logic
    const langBtn = document.querySelector('.lang-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLangSpan = document.querySelector('.current-lang');

    // Dictionary of translations
    const translations = {
        en: {
            register: "Register Now",
            backHome: "Back to Home",
            whatIs: "What is MasteryLab?",
            readMore: "More Info",
            apply: "Apply for MyM Lab",
            contact: "Get In Touch",
            partners: "Our Partners",
            heroTitle: "MasteryLab"
        },
        de: {
            register: "Jetzt Anmelden",
            backHome: "Zurück zur Startseite",
            whatIs: "Was ist MasteryLab?",
            readMore: "Mehr Infos",
            apply: "Anmelden für MyM Lab",
            contact: "Kontaktieren Sie uns",
            partners: "Unsere Partner",
            heroTitle: "MasteryLab"
        },
        fr: {
            register: "S'inscrire",
            backHome: "Retour à l'accueil",
            whatIs: "Qu'est-ce que MasteryLab?",
            readMore: "Plus d'infos",
            apply: "Postuler pour MyM Lab",
            contact: "Contactez-nous",
            partners: "Nos Partenaires",
            heroTitle: "MasteryLab"
        },
        it: {
            register: "Registrati Ora",
            backHome: "Torna alla Home",
            whatIs: "Cos'è MasteryLab?",
            readMore: "Maggiori Info",
            apply: "Candidati per MyM Lab",
            contact: "Contattaci",
            partners: "I Nostri Partner",
            heroTitle: "MasteryLab"
        },
        es: {
            register: "Regístrate Ahora",
            backHome: "Volver al Inicio",
            whatIs: "¿Qué es MasteryLab?",
            readMore: "Más Información",
            apply: "Aplicar para MyM Lab",
            contact: "Contáctanos",
            partners: "Nuestros Socios",
            heroTitle: "MasteryLab"
        }
    };

    if (langBtn && langDropdown) {
        // Toggle dropdown on click (mobile friendly)
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.style.visibility = langDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
            langDropdown.style.opacity = langDropdown.style.opacity === '1' ? '0' : '1';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langDropdown.style.visibility = 'hidden';
            langDropdown.style.opacity = '0';
        });

        // Language Selection
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');

                // Update active state
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Update button text
                currentLangSpan.textContent = lang.toUpperCase();

                // Apply translations
                updateLanguage(lang);

                // Save preference
                localStorage.setItem('masterylab_lang', lang);
            });
        });

        // Load saved language
        const savedLang = localStorage.getItem('masterylab_lang');
        if (savedLang) {
            const savedOption = document.querySelector(`.lang-option[data-lang="${savedLang}"]`);
            if (savedOption) savedOption.click();
        }
    }


    function updateLanguage(lang) {
        const t = translations[lang];
        if (!t) return;

        // Example Text Updates (Add more data-i18n attributes in HTML to scale this)
        document.querySelectorAll('.nav-btn-primary').forEach(el => el.textContent = t.register);
        document.querySelectorAll('.nav-btn-outline').forEach(el => {
            if (el.href.includes('what-is-masterylab')) el.textContent = t.whatIs;
        });
        // Selectors for specific sections to demonstrate change
        const contactHeader = document.querySelector('#contact .text-futuristic');
        if (contactHeader) contactHeader.setAttribute('data-text', t.contact.toUpperCase());
        if (contactHeader) contactHeader.textContent = t.contact;

        const partnerHeader = document.querySelector('#partners h2');
        if (partnerHeader) partnerHeader.textContent = t.partners;
    }

    // =========================================
    // TASK 1: GLOBAL PRICING COMPONENT (Injector)
    // =========================================
    function injectPricingComponent() {
        // Only on Bachata pages (Sensual, Teachers, Dancers)
        if (!window.location.href.includes('bachata-') && !window.location.href.includes('registration-bachata')) return;

        // broader selector for both buttons and overview cards
        const bookButtons = document.querySelectorAll('.btn-book-now, a[href*="registration-bachata"]');
        const overviewSection = document.querySelector('#training-tracks .grid-2');

        const pricingHTML = `
        <div class="pricing-component" style="justify-content: center;">
            <div class="pricing-col" style="border-color: rgba(214, 0, 28, 0.4); max-width: 800px; margin: 0 auto; flex: none; width: 100%; text-align: center;">
                <div style="font-size: 4rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--color-primary); font-family: 'Anton', sans-serif;">250 CHF</div>
                <h3 style="margin-bottom: 2rem; font-size: 3rem; line-height: 1;">WHAT YOU GET with this price</h3>
                <ul class="pricing-features" style="display: inline-block; text-align: left; font-size: 1.3rem;">
                    <li style="margin-bottom: 1rem;">Multiple Hours of High-Level Education with main artists</li>
                    <li style="margin-bottom: 1rem;">Spain-Level Training Material</li>
                    <li style="margin-bottom: 1rem;">Follow-Up Program Between Labs</li>
                    <li style="margin-bottom: 1rem;">Professional Media (High-Quality Video)</li>
                    <li style="margin-bottom: 1rem;">50% Discount on Party Tickets</li>
                    <li style="margin-bottom: 1rem;">High-Quality Dance Background (Stand Out in Today’s Scene)</li>
                    <li style="margin-bottom: 1rem;">Access to Professional Dance Community</li>
                    <li style="color: var(--color-primary); margin-bottom: 1rem;">Certification Included (after completing full 3-part program)</li>
                </ul>
            </div>
        </div>
        `;

        // Case 1: Overview Page - Insert before the grid of cards
        if (overviewSection && !overviewSection.parentElement.querySelector('.pricing-component')) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = pricingHTML;
            // Add some specific styling for the overview
            const inner = wrapper.querySelector('.pricing-component');
            if (inner) {
                inner.style.maxWidth = '900px';
                inner.style.margin = '0 auto 4rem auto';
            }
            overviewSection.parentNode.insertBefore(wrapper, overviewSection);
        }

        // Case 2: Booking Buttons (Sub-pages)
        if (bookButtons.length === 0) return;

        bookButtons.forEach(btn => {
            // Fix: Ensure data-text is set for CSS animations to prevent glitch
            if (!btn.getAttribute('data-text')) {
                btn.setAttribute('data-text', btn.textContent.trim());
            }

            // Find container
            const container = btn.closest('div');

            if (container) {
                // Try to find the schedule card in the same parent container or nearby
                // The structure implies: schedule-card IS A SIBLING of the div containing the button?
                // Looking at HTML: the button is inside <div style="text-align: center; margin-top: 2rem;">
                // And that div is a sibling of <div class="schedule-card ...">
                // So we need to go up one level to find the schedule card.

                const parentOfButtonDiv = container.parentElement;
                const scheduleCard = parentOfButtonDiv ? parentOfButtonDiv.querySelector('.schedule-card') : null;

                const wrapper = document.createElement('div');
                wrapper.innerHTML = pricingHTML;

                if (scheduleCard) {
                    // Insert AFTER schedule card
                    scheduleCard.parentNode.insertBefore(wrapper, scheduleCard.nextSibling);
                } else {
                    // Fallback: Insert before the button container
                    container.parentNode.insertBefore(wrapper, container);
                }
            }
        });
    }
    injectPricingComponent();

    // =========================================
    // TASK 2: DYNAMIC PRICING (M&M)
    // =========================================
    function injectDynamicPricingMOM() {
        // Only on Michael & Mayra page
        const isMMPage = window.location.href.includes('michael-mayra') && !window.location.href.includes('registration-');
        if (!isMMPage) return;

        const ctaBtn = document.querySelector('.btn-cta-inviting');
        if (!ctaBtn) return;

        // Mock Data
        const totalEarlyBird = 10;
        const sold = 4; // Mock logic: "First 10 tickets"
        const remaining = totalEarlyBird - sold;
        const price = remaining > 0 ? "200 CHF" : "220 CHF";
        const tierName = remaining > 0 ? "Early Bird Tier" : "Standard Tier";
        const fillPercent = (sold / totalEarlyBird) * 100;

        const dynamicHTML = `
        <div class="mm-pricing-status">
            <div class="mm-spots-remaining">${tierName}: Only ${remaining} Spots Left!</div>
            <div class="mm-price-tag">${price}</div>
            <div class="mm-progress-bar">
                <div class="mm-progress-fill" style="width: ${fillPercent}%"></div>
            </div>
            <p style="color: #aaa; font-size: 0.9rem; margin-top: 0.5rem;">Sellout imminent.</p>
        </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = dynamicHTML;

        // Insert after Technical Pillars section if it exists, otherwise fallback to CTA
        const pillarsSection = document.querySelector('.bio-pillars-container');
        if (pillarsSection) {
            pillarsSection.parentNode.insertBefore(wrapper, pillarsSection.nextSibling);
            // Add consistent spacing to match layout (same distance to ticket)
            wrapper.style.marginBottom = '6rem';
            wrapper.style.marginTop = '6rem';
        } else {
            const parent = ctaBtn.parentElement;
            parent.insertBefore(wrapper, ctaBtn);
        }
    }
    injectDynamicPricingMOM();

    // =========================================
    // TASK 5: EDUCATION JOURNAL NAV (Injector)
    // =========================================
    function injectEducationJournalLink() {
        // Only inject on Home Page
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');
        if (!isHomePage) return;

        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            // Check if already exists
            if (navLinks.innerHTML.includes('education-journal')) return;

            const journalLink = document.createElement('a');
            journalLink.href = 'education-journal.html';
            journalLink.className = 'nav-btn-outline ticket-shape';
            journalLink.textContent = 'EDUCATION JOURNAL'; // Uppercase to match style
            journalLink.style.marginLeft = '1rem';
            journalLink.style.borderColor = 'rgba(255,255,255,0.3)';

            // Insert adjacent to "What is MasteryLab" (nav-btn-outline)
            const whatIsLink = navLinks.querySelector('a[href*="what-is-masterylab"]');

            if (whatIsLink) {
                navLinks.insertBefore(journalLink, whatIsLink.nextSibling);
            } else {
                navLinks.appendChild(journalLink);
            }
        }
    }
    injectEducationJournalLink();

});
