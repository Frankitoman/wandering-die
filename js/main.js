// The Wandering Die — navegación y entradas al scrollear.
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 16);
    }, { passive: true });

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var target = document.getElementById(el.getAttribute('data-goto'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Entradas verticales, una sola vez, nunca laterales.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    function observe(root) {
      (root || document).querySelectorAll('[data-rise]:not(.is-in)').forEach(function (el) {
        io.observe(el);
      });
    }
    observe();

    // La grilla de clases y la lista de decisiones se llenan por JS después.
    var mo = new MutationObserver(function () { observe(); });
    ['classesGrid', 'diceList'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) mo.observe(node, { childList: true });
    });
  });
})();
