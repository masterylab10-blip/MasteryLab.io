'use strict';
(() => {
 const section=document.querySelector('.lab-journey');if(!section)return;
 const chapters=[...section.querySelectorAll('.lab-journey-chapter')];
 const controls=[...section.querySelectorAll('[data-direction]')];
 const label=section.querySelector('.lab-journey-core span:not(.lab-logo-highlight)');
 const counter=section.querySelector('.lab-position');
 const desktop=matchMedia('(min-width:900px) and (prefers-reduced-motion:no-preference)');
 section.style.setProperty('--lab-count',chapters.length);
 let queued=false,current=-1;
 function update(){
  queued=false;section.classList.toggle('is-animated',desktop.matches);
  const distance=section.offsetHeight-innerHeight;
  const progress=desktop.matches?Math.max(0,Math.min(1,-section.getBoundingClientRect().top/Math.max(1,distance))):0;
  section.style.setProperty('--journey-progress',`${progress*100}%`);
  section.style.setProperty('--logo-edge-offset',String(-progress*100));
  const index=Math.min(chapters.length-1,Math.floor(progress*chapters.length));
  if(index===current&&desktop.matches)return;current=index;
  chapters.forEach((chapter,i)=>{
   const active=!desktop.matches||i<=index;chapter.classList.toggle('is-current',active);chapter.inert=!active;
   if(!active)chapter.setAttribute('aria-hidden','true');else chapter.removeAttribute('aria-hidden');
  });
  controls.forEach(button=>button.disabled=Number(button.dataset.direction)<0?index===0:index===chapters.length-1);
  counter.textContent=`${index+1} / ${chapters.length}`;
  label.textContent=desktop.matches?'The moments ahead':'Past. Present. What’s next.';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 controls.forEach(button=>button.addEventListener('click',()=>{
  const index=Math.max(0,Math.min(chapters.length-1,current+Number(button.dataset.direction)));
  const y=scrollY+section.getBoundingClientRect().top+(section.offsetHeight-innerHeight)*((index+.15)/chapters.length);
  scrollTo({top:y,behavior:'smooth'});
 }));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);desktop.addEventListener('change',()=>{current=-1;schedule();});update();
})();
