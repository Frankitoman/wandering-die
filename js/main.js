// The Wandering Die — nav, mobile menu, reveal-on-scroll, language switcher
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    window.i18n.applyToDOM();

    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });

    var burger = document.getElementById('navBurger');
    var mobileMenu = document.getElementById('navMobile');
    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      mobileMenu.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          mobileMenu.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    document.querySelectorAll('[data-lang-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.i18n.setLang(btn.getAttribute('data-lang-option'));
      });
    });

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var target = document.getElementById(el.getAttribute('data-goto'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    function observeReveals(root) {
      (root || document).querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
        revealIO.observe(el);
      });
    }
    observeReveals();

    var mo = new MutationObserver(function () { observeReveals(); });
    ['classesGrid', 'diceScenarioList'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) mo.observe(node, { childList: true });
    });
  });
})();
