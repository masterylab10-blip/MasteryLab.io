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

    }

    // Form Submission (Standalone or Modal)
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                city: document.getElementById('city').value,
                role: document.getElementById('role').value,
                email: document.getElementById('email').value,
                whatsapp: document.getElementById('whatsapp').value
            };

            // DATA SAVING: Send to Google Sheets
            const googleSheetUrl = "https://script.google.com/macros/s/AKfycbxbleUuZYNKhQhW87bakoOiRSCKB2cW-AiH0dxnoq7J9y43Q8feTvY1Sji_9_wm_T8/exec";

            fetch(googleSheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                body: JSON.stringify(formData)
            }).then(() => {
                console.log('Data sent to sheet');
            }).catch(err => {
                console.error('Error sending to sheet:', err);
            });

            // REDIRECT TO STRIPE
            const stripeUrl = "https://buy.stripe.com/00wcN47fZ3F269rceD8og00";

            setTimeout(() => {
                window.location.href = stripeUrl;
            }, 1000);
        });
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
});
