'use strict';
(() => {
  const notice = document.querySelector('.abo-announcement');
  if (!notice) return;
  const key = 'masterylab-2027-abos-dismissed';
  try { notice.hidden = sessionStorage.getItem(key) === 'yes'; } catch {}
  notice.querySelector('.abo-dismiss').addEventListener('click', () => {
    notice.hidden = true;
    try { sessionStorage.setItem(key, 'yes'); } catch {}
  });
})();
