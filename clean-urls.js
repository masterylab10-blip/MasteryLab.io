'use strict';
(() => {
  const routes = new Set(['profile', 'education-journal', 'auth-simple', 'order-panamio', 'michael-mayra-2027', 'privacy-policy', 'registration-ladies-mastery', 'auth', 'application-received', 'ale-xidan', 'bachata-sensual-lab', 'bachata-dancers-lab', 'bachata-teachers-lab', 'auth-firebase', 'contact-thank-you', 'register', 'login', 'portal', 'registration-thank-you', 'ladies-mastery', 'registration-michael-mayra-vol2', 'feedback-7c9e2b', 'projects', 'michael-mayra-vol2', 'memories', 'dance-outfit', 'artists', 'man-lady-styling-lab', 'men-style-lab', 'what-is-masterylab', 'partners', 'terms-of-service', 'registration-isma-irene', 'registration-bachata-sensual', 'hotels', 'isma-irene', 'registration-men-styling']);
  const path = window.location.pathname;
  let target;
  if (path === '/index.html') target = '/';
  else if (path.endsWith('/index.html')) target = path.slice(0, -10);
  else if (path.endsWith('.html') && routes.has(path.slice(1, -5))) target = path.slice(0, -5) + '/';
  if (target && target !== path) window.location.replace(target + window.location.search + window.location.hash);
})();
