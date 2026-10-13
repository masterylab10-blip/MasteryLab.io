'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[data-desktop-src],video[data-decorative]')];
  const updateVideo = () => videos.forEach(video => {
    if (motion.matches || navigator.connection?.saveData) { video.pause(); video.removeAttribute('autoplay'); return; }
    if (!video.dataset.desktopSrc) { video.play().catch(() => {}); return; }
    const source = matchMedia('(max-width: 767px)').matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    if (video.getAttribute('src') !== source) { video.src = source; video.load(); }
    video.play().catch(() => {});
  });
  motion.addEventListener('change', updateVideo); updateVideo();
  document.querySelectorAll('[id$="Modal"], [id$="modal"]').forEach(modal => {
    if (!modal.querySelector('input,button,textarea,select')) return;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    const title = modal.querySelector('h1,h2,h3');
    if (title) { title.id ||= modal.id+'-title'; modal.setAttribute('aria-labelledby', title.id); }
    else modal.setAttribute('aria-label', 'Registration');
    modal.tabIndex = -1;
    [...modal.querySelectorAll('button')].filter(button => ['×','✕','✖'].includes(button.textContent.trim())).forEach(button => { button.setAttribute('aria-label', 'Close dialog'); button.type = 'button'; });
    let lastFocus, wasOpen = false;
    const open = () => getComputedStyle(modal).display !== 'none' && !modal.hidden;
    const sync = () => {
      const isOpen = open();
      modal.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen && !wasOpen) {
        lastFocus = document.activeElement;
        (modal.querySelector('input:not([type="hidden"]),button,a[href],textarea,select') || modal).focus();
      }
      if (!isOpen && wasOpen && lastFocus?.isConnected) lastFocus.focus();
      wasOpen = isOpen;
    };
    new MutationObserver(sync).observe(modal, {attributes:true,attributeFilter:['style','hidden','class']}); sync();
    modal.addEventListener('keydown', event => {
      if (!open()) return;
      if (event.key === 'Escape') { event.preventDefault(); modal.style.display='none'; document.body.style.overflow=''; return; }
      if (event.key !== 'Tab') return;
      const elements = [...modal.querySelectorAll('a[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),select,textarea,[tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = elements[0], last = elements.at(-1);
      if (!first) {event.preventDefault();modal.focus();return;}
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {event.preventDefault();last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
    });
  });
});
