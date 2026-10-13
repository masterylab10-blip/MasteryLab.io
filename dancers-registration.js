'use strict';
window.DancersRegistration = (() => {
  const receiver = 'https://script.google.com/macros/s/AKfycbxqC3P4HnDN4mciabiBoxaUfYOEtRyQZT2RDB1H-4vvrpsNda1QCymGk9FJ2KcT_jY2/exec';
  const tickets = {
    couple:'https://buy.stripe.com/3cIbJ3aWi3G4abw26CdEs0Y',
    solo:'https://buy.stripe.com/aFa4gBaWi1xW97sdPkdEs0X'
  };
  let form, select, reference;
  function partnerFields() {
    const couple = select.value === 'couple';
    form.querySelector('[data-partner-heading]').hidden=!couple;
    form.querySelectorAll('.partner-field').forEach(field => {
      field.hidden = !couple;
      const input = field.querySelector('input, select'); input.disabled = !couple;
      input.required = couple;
    });
  }
  function choose(ticket) {
    if (!tickets[ticket] || !form) return;
    select.value = ticket; partnerFields();
    form.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
    select.focus({preventScroll:true});
  }
  document.addEventListener('DOMContentLoaded', () => {
    form = document.getElementById('dancersRegistration'); if (!form) return;
    select = form.querySelector('[name="ticket"]'); select.addEventListener('change', partnerFields); partnerFields();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const danceRole=form.querySelector('[name="dance_role"]'), partnerRole=form.querySelector('[name="partner_dance_role"]');
      partnerRole.setCustomValidity(select.value==='couple' && danceRole.value===partnerRole.value ? 'Couple tickets need one Leader and one Follower.' : '');
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]'); if (button.disabled) return;
      reference ||= crypto.randomUUID();
      const data = new URLSearchParams(new FormData(form));
      if (select.value === 'couple') data.set('partner_name', `${data.get('partner_first_name')} ${data.get('partner_last_name')}`);
      data.set('service','dancers'); data.set('submission_id', reference); data.set('event', 'Bachata Sensual Dancers Lab Vol. 1 — 6–7 February 2027');
      button.dataset.idleLabel = 'CONTINUE TO STRIPE →'; button.disabled = true; button.textContent='SAVING REGISTRATION…';
      try {
        if (receiver.startsWith('__')) throw new Error('Receiver setup pending');
        await SiteForms.submit(receiver, {body:data,requireArchive:true});
        const checkout = new URL(tickets[select.value]);
        checkout.searchParams.set('client_reference_id', reference);
        checkout.searchParams.set('prefilled_email', data.get('email'));
        window.location.assign(checkout.href);
      } catch(error) { SiteForms.error(form, button); }
    });
  });
  return {choose};
})();
