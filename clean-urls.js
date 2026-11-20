'use strict';
(() => {
  const routes = new Set(["passes","profile","education-journal","auth-simple","order-panamio","michael-mayra-2027","privacy-policy","registration-ladies-mastery","auth","application-received","ale-xidan","bachata-sensual-lab","bachata-dancers-lab","bachata-teachers-lab","auth-firebase","contact-thank-you","register","login","portal","registration-thank-you","ladies-mastery","projects","michael-mayra-vol2","memories","dance-outfit","artists","man-lady-styling-lab","men-style-lab","what-is-masterylab","partners","terms-of-service","registration-isma-irene","registration-bachata-sensual","hotels","isma-irene","michael-mayra-show-team-2027","michael-mayra-technique-vol2-2027","registration-men-styling"]);
  const cleanPath = (value) => {
    if (!value || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:')) return value;
    let url;
    try { url = new URL(value, window.location.href); } catch { return value; }
    if (url.origin !== window.location.origin) return value;
    let path = url.pathname;
    if (path === '/index.html') path = '/';
    else if (path.endsWith('/index.html')) path = path.slice(0, -10);
    else if (path.endsWith('.html') && routes.has(path.slice(1, -5))) path = path.slice(0, -5) + '/';
    if (path === url.pathname) return value;
    return path + url.search + url.hash;
  };
  const normalizeLinks = () => document.querySelectorAll('a[href], form[action]').forEach((element) => {
    const attr = element.hasAttribute('href') ? 'href' : 'action';
    const cleaned = cleanPath(element.getAttribute(attr));
    if (cleaned !== element.getAttribute(attr)) element.setAttribute(attr, cleaned);
  });
  const current = cleanPath(window.location.pathname + window.location.search + window.location.hash);
  if (current !== window.location.pathname + window.location.search + window.location.hash) window.location.replace(current);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeLinks, {once:true});
  else normalizeLinks();
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const cleaned = cleanPath(link.getAttribute('href'));
    if (cleaned !== link.getAttribute('href')) link.setAttribute('href', cleaned);
  }, true);
})();