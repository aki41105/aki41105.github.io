// Classical redesign — scroll reveal + small niceties. No dependencies.
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach ? els.forEach(function (el) { el.classList.add('is-visible'); }) : null;
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var delay = parseFloat(e.target.getAttribute('data-reveal-delay') || '0');
      e.target.style.transitionDelay = delay + 's';
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();
