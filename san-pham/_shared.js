/* ================================================================
   NDECOR — SHARED SCRIPTS
   Dùng chung cho /san-pham.html và /san-pham/chi-tiet.html
   - Custom cursor (dot + ring follow)
   - Reveal on scroll (IntersectionObserver)
   ================================================================ */

(function(){
"use strict";

/* ---------- CUSTOM CURSOR ---------- */
const dotEl  = document.querySelector('.cursor-dot');
const ringEl = document.querySelector('.cursor-ring');

if(dotEl && ringEl){
  let mx = innerWidth/2,  my = innerHeight/2;
  let rx = mx,            ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dotEl.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function loop(){
    rx += (mx - rx) * .16;
    ry += (my - ry) * .16;
    ringEl.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', e => {
    const hoverEl = e.target.closest('[data-hover]');
    ringEl.classList.toggle('is-hover', !!hoverEl);
  });
}

/* ---------- REVEAL ON SCROLL ---------- */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('[data-reveal]');

if(reduce){
  reveals.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

  reveals.forEach(el => io.observe(el));
}

})();