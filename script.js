document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#') return;
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
            history.replaceState(null, '', hash);
        });
    });
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        navLinks.id ||= 'site-navigation';
        mobileBtn.setAttribute('aria-controls', navLinks.id);
        mobileBtn.setAttribute('aria-expanded', 'false');
        const closeMenu = () => { navLinks.classList.remove('is-open'); mobileBtn.setAttribute('aria-expanded', 'false'); };
        mobileBtn.addEventListener('click', () => {
            const open = navLinks.classList.toggle('is-open');
            mobileBtn.setAttribute('aria-expanded', String(open));
        });
        navLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {closeMenu(); mobileBtn.focus();} });
        matchMedia('(min-width: 1280px)').addEventListener('change', closeMenu);
    }
    const modal = document.getElementById('regModal');
    if (modal) {
        document.querySelectorAll('a[href="#book"]').forEach(button => button.addEventListener('click', event => {
            event.preventDefault(); modal.style.display = 'flex';
        }));
        const close = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', event => { if (event.target === modal) close(); });
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


});
