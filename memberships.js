'use strict';
(async function () {
 const form=document.getElementById('membership-builder'); if(!form)return;
 const el=id=>document.getElementById('membership-'+id);
 try {
  const responses=await Promise.all(['/data/memberships.json','/data/events.json'].map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw new Error('Configuration unavailable');
  const [config,events]=await Promise.all(responses.map(r=>r.json()));
  const labs=events.filter(event=>!event.id.startsWith('teachers-'));
  const selected=new Set();
  const money=n=>'CHF '+new Intl.NumberFormat('de-CH').format(n);
  let current='flex';
  const isCouple=()=>form.querySelector('[name=membership_booking]:checked').value==='couple';
  const discountFor=()=>config.plans[current].coupleDiscountPerPerson;
  const total=()=>isCouple()?2*(config.plans[current].price-(discountFor()||0)):config.plans[current].price;
  for(const lab of labs){
   const label=document.createElement('label');label.className='membership-lab';
   const input=document.createElement('input');input.type='checkbox';input.value=lab.id;input.name='membership_lab';
   const body=document.createElement('span');
   for(const [tag,value] of [['small',lab.dateLabel],['strong',lab.title],['span',lab.artists]]){const node=document.createElement(tag);node.textContent=value;body.append(node);}
   label.append(input,body);el('labs').append(label);
   input.addEventListener('change',()=>{if(input.checked)selected.add(lab.id);else selected.delete(lab.id);update();});
  }
  function update(){
   const plan=config.plans[current];
   el('selection-help').textContent=current==='unlimited'?'All announced included Labs are selected for your full season.':'Choose '+plan.count+' Labs for '+plan.name.replace('MASTERY ','Mastery ')+'.';
   for(const input of el('labs').querySelectorAll('input')){input.checked=selected.has(input.value);input.disabled=current==='unlimited'||(!input.checked&&selected.size>=plan.count);}
   el('count').textContent=selected.size+' of '+plan.count+' Labs selected'+(current==='unlimited'&&labs.length<plan.count?' · package allowance pending confirmation':'');
   el('summary-name').textContent=plan.name;
   const couple=isCouple(),discount=discountFor();
   el('summary-label').textContent=couple?'Yearly package · 2 people':'Yearly package · 1 person';
   el('summary-price').textContent=money(total());
   const schedule=el('payment-schedule');
   if(schedule){
    const split=el('payment').value==='instalments';
    const first=Math.round(total()*100/2)/100;
    const firstLab=labs.filter(l=>selected.has(l.id)&&l.startDate).sort((a,b)=>a.startDate.localeCompare(b.startDate))[0];
    const due=firstLab?'before '+new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(firstLab.startDate+'T00:00:00Z'))+' (your first selected Lab)':'before your first selected Lab';
    schedule.textContent=split?'First payment at checkout: '+money(first)+'. Second payment: '+money(total()-first)+'. Due '+due+'.':'Pay '+money(total())+' in full at checkout. No second payment.';
   }
   el('couple-breakdown').textContent=couple?(discount==null?'Couple discount to be confirmed. Shown total is for two individual packages.':money(plan.price-discount)+' per person · each saves '+money(discount)+' extra ('+money(discount*2)+' saved together).'):'';
   el('summary-saving').textContent=isCouple()?'Couple saving: '+money((discountFor()||0)*2)+' total compared with two individual packages.':'Individual yearly package';
   el('summary-labs').replaceChildren();
   for(const lab of labs.filter(l=>selected.has(l.id))){const li=document.createElement('li');li.textContent=lab.title+' · '+lab.dateLabel;el('summary-labs').append(li);}
   if(!selected.size){const li=document.createElement('li');li.textContent='Your selected Labs will appear here.';el('summary-labs').append(li);}
   el('summary-addon').textContent='';
   el('copy-status').textContent='';
  }
  form.addEventListener('change',event=>{if(event.target.name==='membership'){
   current=event.target.value;const count=config.plans[current].count;
   if(current==='unlimited'){selected.clear();labs.forEach(l=>selected.add(l.id));}
   else while(selected.size>count)selected.delete([...selected].at(-1));
  }update();});
  el('copy').addEventListener('click',async()=>{
   const plan=config.plans[current];
   const text=[plan.name+' · '+config.season,(isCouple()?'Couple · 2 people':'Individual · 1 person'),money(total())+' yearly package',el('couple-breakdown').textContent,...labs.filter(l=>selected.has(l.id)).map(l=>l.title+' · '+l.dateLabel),el('summary-addon').textContent,el('payment').selectedOptions[0].textContent,el('payment-schedule')?.textContent||'','Draft selection only. Subject to final four-lab package terms and booking confirmation.'].join('\n');
   try{await navigator.clipboard.writeText(text);el('copy-status').textContent='Selection copied. No booking or payment has been made.';}catch{el('copy-status').textContent='Copy unavailable. You can select and copy the summary above.';}
  });
  update();
 } catch(error){el('selection-help').textContent='Lab selection could not load. Refresh the page to try again.';el('copy').disabled=true;}
})();
