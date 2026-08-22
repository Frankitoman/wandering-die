// The Wandering Die — persistent world backdrop: crossfades the active
// photoreal layer as the reader travels between sections. Never hard-cuts:
// only one layer's opacity ever changes at a time, and the previous one
// holds until the new one is fully up.
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var world = document.getElementById('bgWorld');
    if (!world) return;
    var layers = {};
    world.querySelectorAll('.bg-world__layer').forEach(function (el) {
      layers[el.getAttribute('data-layer')] = el;
    });

    var scenes = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
    if (!scenes.length) return;

    var current = 'hero';
    function activate(name) {
      if (name === current || !layers[name]) return;
      current = name;
      Object.keys(layers).forEach(function (key) {
        layers[key].classList.toggle('is-active', key === name);
      });
    }

    var io = new IntersectionObserver(function (entries) {
      // Pick whichever observed section currently covers the most of the
      // viewport — this is what keeps the backdrop from flickering when two
      // sections are both partly on screen during a fast scroll.
      var best = null;
      entries.forEach(function (entry) {
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      });
      if (best && best.isIntersecting) {
        activate(best.target.getAttribute('data-scene'));
      }
    }, { threshold: [0.15, 0.3, 0.5, 0.7, 0.9] });

    scenes.forEach(function (el) { io.observe(el); });
  });
})();
