/* Registration transport: redirects require a positive receiver acknowledgement. */
'use strict';
window.SiteForms = (() => {
  const pending = new Map();
  async function submit(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let body = options.body;
    if (typeof body === 'string' && options.headers?.['Content-Type'] === 'application/json') {
      body = new URLSearchParams(Object.entries(JSON.parse(body)).map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')]));
    }
    // Reuse one reference for a failed attempt; email fallback does not claim a Sheet save.
    if (body instanceof URLSearchParams || body instanceof FormData) {
      if (!body.has('submission_id')) body.set('submission_id', crypto.randomUUID());
      if (!body.has('page')) body.set('page', window.location.pathname);
    }
    try {
      const response = await fetch(url, {method: 'POST', body, mode: 'cors', credentials: 'omit', signal: controller.signal});
      if (!response.ok) throw new Error('The receiver is unavailable.');
      const result = await response.json();
      if (!(result.result === 'success' || result.status === 'success' || result.success === true || result.success === 'true')) throw new Error('The receiver did not confirm your submission.');
      return result;
    } catch (failure) {
      if (options.requireArchive) throw failure;
      const emailBody = options.form ? new FormData(options.form) : new FormData();
      if (body instanceof URLSearchParams || body instanceof FormData) {
        for (const [key,value] of body) if (!['_next','_captcha','_autoresponse'].includes(key)) emailBody.append(key,value);
      }
      emailBody.set('_subject', 'MasteryLab submission — '+window.location.pathname+' — '+(emailBody.get('submission_id') || ''));
      emailBody.set('_captcha', 'false');
      emailBody.set('Archive status', 'Original Sheet receiver unavailable; submission delivered by email.');
      const response = await fetch('https://formsubmit.co/ajax/masterylab1.0@gmail.com', {method:'POST',body:emailBody,signal:controller.signal});
      if (!response.ok) throw failure;
      const receipt = await response.json();
      if (!(receipt.success === true || receipt.success === 'true')) throw failure;
      return {result:'success',delivery:'email',archive:false,submissionId:emailBody.get('submission_id')};
    } finally { clearTimeout(timeout); }
  }
  function error(form, button) {
    let message = form.querySelector('.submission-error');
    if (!message) {
      message = document.createElement('p'); message.className = 'submission-error';
      message.setAttribute('role', 'alert'); form.append(message);
    }
    message.textContent = 'We could not confirm your submission. Your entries are still here. Please contact masterylab1.0@gmail.com before retrying, to avoid a duplicate.';
    if (button) { button.disabled = false; button.style.opacity = '1'; button.textContent = button.dataset.idleLabel || 'Try again'; }
    return message;
  }
  async function dual(form, url, data, button) {
    if (pending.has(form)) return pending.get(form);
    const task = (async () => {
      const idle = button?.textContent;
      if (button) { button.dataset.idleLabel = idle; button.disabled = true; button.textContent = 'Sending…'; }
      const previous = form.querySelector('.submission-error'); if (previous) previous.remove();
      try {
        const receipt = await submit(url, {body: data, form});
        if (receipt.delivery === 'email') {
          const destination = form.querySelector('[name="_next"]')?.value;
          if (destination) window.location.assign(destination);
          else {button.textContent='RECEIVED';form.reset();}
          return;
        }
        // Native FormSubmit delivers the email and displays its own confirmed result.
        HTMLFormElement.prototype.submit.call(form);
      } catch (failure) { error(form, button); }
      finally { pending.delete(form); }
    })();
    pending.set(form, task); return task;
  }
  return {submit, error, dual};
})();
