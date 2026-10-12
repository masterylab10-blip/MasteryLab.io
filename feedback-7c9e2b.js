'use strict';
(() => {
  const labs = {
    mm: { title: 'Michael & Mayra Lab', date: '23–24 May 2026', artists: 'Michael & Mayra', image: 'media/michael-mayra-covers-medium.webp' },
    styling: { title: 'Men & Lady Styling Lab', date: '12–13 September 2026', artists: 'Micka, Angela Mariano & Xidan', image: 'media/feedback-styling-2026.png' }
  };
  const form = document.getElementById('feedback-form');
  const steps = [...form.querySelectorAll('.step')];
  const next = document.getElementById('next');
  const back = document.getElementById('back');
  const submit = document.getElementById('submit');
  const status = document.getElementById('form-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = 0;
  let selectedLab = '';
  let sending = false;
  let completed = false;
  let furthestStep = 0;
  let ratingId = 0;
  const teachingAnswers = new Map();
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  function makeChips(containerId, name, values) {
    const container = document.getElementById(containerId);
    container.innerHTML = values.map(value => `<label><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><span>${escapeHtml(value)}</span></label>`).join('');
  }
  makeChips('emotion-options', 'Emotions', ['Inspired', 'Connected', 'Confident', 'Challenged', 'Joyful', 'Supported', 'Overwhelmed', 'Disappointed', 'Still processing']);
  makeChips('style-options', 'Future lab interests', ['Bachata Sensual', 'Dominican Bachata', 'Bachata Fusion', 'Men Styling', 'Lady Styling', 'Partnerwork & connection', 'Musicality', 'Footwork', 'Body movement', 'Teacher training', 'Other / my own idea']);
  makeChips('format-options', 'Preferred formats', ['Weekend immersion', 'One-day intensive', 'Small-group Lab', 'Regular sessions', 'Practice & social']);
  function initRating(container, name, question, saved = '') {
    const id = `rating-${++ratingId}`;
    container.classList.add('rating');
    container.innerHTML = `<div class="rating-top"><label for="${id}">${escapeHtml(question)}</label><output id="${id}-output" for="${id}" aria-live="polite">—<small>/10</small></output></div><input class="range" type="range" id="${id}" min="1" max="10" step="1" value="5" aria-describedby="${id}-hint"><input type="hidden" name="${escapeHtml(name)}" value=""><div class="range-labels"><span>1 · Not at all / needs improvement</span><span>10 · Absolutely / excellent</span></div><p class="rating-hint" id="${id}-hint">Move the slider to rate, or leave it unanswered.</p><button type="button" class="clear-rating" hidden>Clear rating</button>`;
    const slider = container.querySelector('.range');
    const hidden = container.querySelector('input[type="hidden"]');
    const output = container.querySelector('output');
    const clear = container.querySelector('.clear-rating');
    function update(value) {
      hidden.value = value ? `${value}/10` : '';
      container.classList.toggle('rated', Boolean(value));
      output.innerHTML = `${value || '—'}<small>/10</small>`;
      clear.hidden = !value;
      slider.style.background = value ? `linear-gradient(to right, var(--red) ${((Number(value)-1)/9)*100}%, var(--line) ${((Number(value)-1)/9)*100}%)` : '';
      slider.setAttribute('aria-valuetext', value ? `${value} out of 10` : 'Not rated. Use arrow keys or move the slider to choose a rating.');
      if (name === 'Teaching and artist energy') teachingAnswers.set(selectedLab, value);
    }
    slider.addEventListener('input', () => update(slider.value));
    // A click on the middle thumb can select 5 without firing input.
    slider.addEventListener('pointerup', () => update(slider.value));
    slider.addEventListener('keydown', event => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) {
        requestAnimationFrame(() => update(slider.value));
      }
    });
    clear.addEventListener('click', () => { slider.value = '5'; update(''); });
    if (saved) slider.value = saved;
    update(saved);
  }
  form.querySelectorAll('[data-rating]').forEach(container => initRating(container, container.dataset.rating, container.dataset.question));
  function updateLab(value) {
    if (!labs[value]) return;
    const changed = selectedLab !== value;
    selectedLab = value;
    const lab = labs[value];
    const image = document.getElementById('story-image');
    image.src = lab.image;
    document.querySelector('.story-photo').classList.toggle('styling-photo', value === 'styling');
    image.alt = lab.title;
    document.getElementById('story-lab').textContent = lab.title.toUpperCase();
    document.getElementById('artist-intro').textContent = value === 'mm'
      ? 'Michael & Mayra brought their technique and energy to the Lab. Tell us what resonated with you.'
      : 'From Dominican roots to sensual flow and styling — tell us about the teaching and energy throughout your Lab.';
    if (changed) {
      initRating(document.getElementById('teaching-rating'), 'Teaching and artist energy',
        value === 'mm' ? 'How would you rate the teaching and energy of Michael & Mayra?' : 'How would you rate the teaching and energy at the Men & Lady Styling Lab?',
        teachingAnswers.get(value) || '');
    }
    updateReview();
  }
  form.querySelectorAll('input[name="lab"]').forEach(input => {
    input.addEventListener('change', () => { updateLab(input.value); showStep(1); });
    // Selecting the same Lab again after going back also opens its questions.
    input.addEventListener('click', () => {
      if (step === 0 && selectedLab === input.value) { updateLab(input.value); showStep(1); }
    });
  });
  const identityFields = document.getElementById('identity-fields');
  const nameInput = document.getElementById('respondent-name');
  const emailInput = document.getElementById('respondent-email');
  const reply = document.getElementById('want-reply');
  function updateIdentity() {
    const named = form.querySelector('input[name="identity"]:checked').value === 'named';
    identityFields.hidden = !named;
    nameInput.disabled = !named;
    nameInput.required = named;
    reply.disabled = !named;
    if (!named) {
      // Erase identifying fields when the visitor switches back to anonymous.
      nameInput.value = '';
      emailInput.value = '';
      reply.checked = false;
    }
    emailInput.disabled = !named || !reply.checked;
    emailInput.required = named && reply.checked;
    if (!reply.checked) emailInput.value = '';
    document.getElementById('email-field').hidden = emailInput.disabled;
    updateReview();
  }
  form.querySelectorAll('input[name="identity"]').forEach(input => input.addEventListener('change', updateIdentity));
  reply.addEventListener('change', updateIdentity);
  nameInput.addEventListener('input', updateReview);
  function buildPayload() {
    const raw = new FormData(form);
    const payload = {};
    for (const [key, value] of raw.entries()) {
      if (['lab', 'identity', 'name', 'email', '_subject'].includes(key)) continue;
      const cleaned = String(value).trim();
      if (!cleaned && key !== '_honey') continue;
      payload[key] = payload[key] ? `${payload[key]}, ${cleaned}` : cleaned;
    }
    const lab = labs[selectedLab];
    payload.Lab = lab.title;
    payload['Event dates'] = lab.date;
    payload['Lab artists'] = lab.artists;
    payload._subject = `MasteryLab feedback · ${lab.title}`;
    payload.Identity = raw.get('identity') === 'named' ? 'Named' : 'Anonymous';
    if (payload.Identity === 'Named') {
      payload.Name = String(raw.get('name') || '').trim();
      if (reply.checked && !emailInput.disabled) payload.email = emailInput.value.trim();
    }
    payload['Permission to contact'] = payload.email ? 'Yes, about this feedback' : 'No';
    payload['Feedback consent'] = 'Agreed to share with the MasteryLab team for improving future experiences';
    return payload;
  }
  function updateReview() {
    document.getElementById('review-lab').textContent = labs[selectedLab]?.title || 'Your Lab';
    const named = form.querySelector('input[name="identity"]:checked').value === 'named';
    document.getElementById('review-identity').textContent = named ? `Shared as ${nameInput.value.trim() || 'your name'} with Neo & Rosy.` : 'Sent anonymously to Neo & Rosy. No name or email included.';
    const summary = document.getElementById('answer-summary');
    if (!summary.hidden && selectedLab) {
      const payload = buildPayload();
      const dl = document.createElement('dl');
      for (const [key, value] of Object.entries(payload)) {
        if (key.startsWith('_') || key === 'Feedback consent') continue;
        const dt = document.createElement('dt'); const dd = document.createElement('dd');
        dt.textContent = key; dd.textContent = value;
        dl.append(dt, dd);
      }
      summary.replaceChildren(dl);
    }
  }
  document.getElementById('review-button').addEventListener('click', event => {
    const summary = document.getElementById('answer-summary');
    summary.hidden = !summary.hidden;
    event.currentTarget.textContent = summary.hidden ? 'Review my answers ↗' : 'Hide review ↑';
    event.currentTarget.setAttribute('aria-expanded', String(!summary.hidden));
    updateReview();
  });
  function validateStep() {
    status.textContent = '';
    if (step === 0 && !selectedLab) {
      status.textContent = 'Choose the Lab you attended to begin.';
      form.querySelector('input[name="lab"]').focus();
      return false;
    }
    if (step === steps.length - 1) {
      const invalid = [nameInput, emailInput, document.getElementById('consent')].find(input => !input.disabled && !input.checkValidity());
      if (invalid) {
        status.textContent = invalid.id === 'consent' ? 'Please agree to share your feedback before sending.' : invalid.id === 'respondent-name' ? 'Enter your name, or choose “Stay anonymous”.' : 'Enter a valid email address, or turn off the reply option.';
        invalid.focus(); invalid.reportValidity();
        return false;
      }
      if (!nameInput.disabled && !nameInput.value.trim()) { status.textContent = 'Enter your name, or choose “Stay anonymous”.'; nameInput.focus(); return false; }
    }
    return true;
  }
  const dots = document.querySelector('.step-dots');
  steps.forEach((section, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'step-dot'; button.textContent = section.dataset.title;
    button.addEventListener('click', () => { if (!sending && (index <= furthestStep || validateStep())) showStep(index); });
    dots.append(button);
  });
  function showStep(index, focus = true) {
    step = index;
    document.body.dataset.step = String(index);
    furthestStep = Math.max(furthestStep, index);
    steps.forEach((section, i) => { section.hidden = i !== index; });
    [...dots.children].forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.classList.toggle('complete', i < index);
      if (i === index) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
    });
    document.getElementById('step-label').textContent = `${String(index+1).padStart(2,'0')} / ${steps[index].dataset.title.toUpperCase()}`;
    document.getElementById('step-count').textContent = `${index+1} OF ${steps.length}`;
    document.getElementById('progress-fill').style.width = `${((index+1)/steps.length)*100}%`;
    document.querySelector('.form-nav').hidden = index === 0;
    back.hidden = index === 0; next.hidden = index === 0 || index === steps.length-1; submit.hidden = index !== steps.length-1;
    next.innerHTML = 'Continue <span>→</span>';
    document.getElementById('nav-note').textContent = index === 0 ? 'YOUR WORDS MAKE A DIFFERENCE' : 'EVERY ANSWER IS OPTIONAL';
    status.textContent = '';
    if (index === steps.length-1) updateReview();
    if (focus) {
      const heading = steps[index].querySelector('h1, h2');
      heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});
      document.querySelector('.journey').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
    }
  }
  next.addEventListener('click', () => { if (!sending && validateStep()) showStep(Math.min(step+1,steps.length-1)); });
  back.addEventListener('click', () => { if (!sending) showStep(Math.max(step-1,0)); });
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type !== 'range') event.preventDefault();
  });
  function setSending(value) {
    sending = value;
    next.disabled = value; back.disabled = value; submit.disabled = value;
    [...dots.children].forEach(button => {button.disabled = value;});
    form.setAttribute('aria-busy',String(value));
    submit.innerHTML = value ? 'Sending… <span>♡</span>' : 'Send with love <span>♡</span>';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || completed) return;
    if (step !== steps.length-1) { if (validateStep()) showStep(step+1); return; }
    if (!selectedLab) { showStep(0); validateStep(); return; }
    if (!validateStep()) return;
    if (form.querySelector('input[name="_honey"]').value) return;
    const payload = buildPayload();
    const hasFeedback = Object.keys(payload).some(key => !key.startsWith('_') && !['Lab','Event dates','Lab artists','Identity','Name','email','Permission to contact','Feedback consent'].includes(key));
    if (!hasFeedback) { status.textContent = 'Please add at least one rating or written answer before sending.'; return; }
    setSending(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),30000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/masterylab1.0@gmail.com', {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload), signal:controller.signal
      });
      const result = await response.json();
      // Never show a completion screen for activation or verification responses.
      if (/activat|verify|confirm.*email/i.test(String(result.message || ''))) {
        status.textContent = 'The form service needs the MasteryLab team to activate email delivery. Your answers are still here. Please let Neo & Rosy know and try again once activation is complete.';
        return;
      }
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission not confirmed');
      completed = true;
      document.body.dataset.step = 'complete';
      form.hidden = true;
      dots.hidden = true;
      document.getElementById('thank-you').hidden = false;
      document.getElementById('step-label').textContent = 'WITH LOVE / THANK YOU';
      document.getElementById('step-count').textContent = 'SUBMITTED';
      document.getElementById('thanks-title').focus({preventScroll:true});
      document.querySelector('.journey').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
      form.reset();
    } catch(error) {
      status.textContent = error.name === 'AbortError' ? 'The service took too long to confirm. Your answers are still here. Please try again; an earlier request may have reached the team.' : 'We couldn’t confirm your submission. Your answers are still here. Check your connection and try again.';
    } finally { clearTimeout(timeout); setSending(false); }
  });
  document.getElementById('another').addEventListener('click', () => { window.location.href = window.location.pathname; });
  updateIdentity();
  showStep(0,false);
  const initialLab = new URLSearchParams(window.location.search).get('lab');
  if (labs[initialLab]) {
    form.querySelector(`input[name="lab"][value="${initialLab}"]`).checked = true;
    updateLab(initialLab);
    showStep(1, false);
  }
})();
