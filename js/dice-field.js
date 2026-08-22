// The Wandering Die — signature move: a field of background dice that behave
// like they are actually resting on a surface the reader can disturb. On a
// fine pointer they tilt toward the cursor, damped, as if catching light off
// its passage. On touch, or under reduced motion, they hold a slow idle
// drift instead of chasing a pointer that does not exist.
(function () {
  'use strict';

  var SHAPES = {
    d20: '<polygon points="50,4 92,28 92,72 50,96 8,72 8,28"/><polygon points="50,4 50,40 8,28"/><polygon points="50,4 50,40 92,28"/><polygon points="50,40 8,28 8,72 50,60"/><polygon points="50,40 92,28 92,72 50,60"/><polygon points="50,60 8,72 50,96"/><polygon points="50,60 92,72 50,96"/>',
    d12: '<polygon points="50,3 93,26 93,74 50,97 7,74 7,26"/><path d="M50,3 L50,26 M93,26 L50,26 M93,74 L67,60 M50,97 L67,60 M7,74 L33,60 M7,26 L33,60 M50,26 L67,60 M50,26 L33,60"/>',
    d10: '<polygon points="50,4 78,32 68,96 32,96 22,32"/><path d="M50,4 L50,50 M22,32 L50,50 L78,32 M32,96 L50,50 L68,96"/>',
    d8: '<polygon points="50,5 85,50 50,95 15,50"/><path d="M15,50 L85,50 M50,5 L50,95"/>',
    d6: '<polygon points="50,8 88,28 50,48 12,28"/><polygon points="12,28 50,48 50,92 12,72"/><polygon points="88,28 50,48 50,92 88,72"/>',
    d4: '<polygon points="50,10 88,82 12,82"/><polygon points="50,45 69,82 31,82"/><path d="M50,10 L50,45 M12,82 L31,82 M88,82 L69,82"/>'
  };

  var LAYOUT = [
    { shape: 'd20', left: 6,  top: 16, size: 74, rot: -8,  depth: 0.9 },
    { shape: 'd6',  left: 16, top: 68, size: 46, rot: 14,  depth: 0.5 },
    { shape: 'd8',  left: 27, top: 12, size: 40, rot: 22,  depth: 0.4 },
    { shape: 'd12', left: 38, top: 78, size: 58, rot: -6,  depth: 0.7 },
    { shape: 'd10', left: 61, top: 8,  size: 50, rot: 10,  depth: 0.55 },
    { shape: 'd4',  left: 72, top: 62, size: 42, rot: -18, depth: 0.45 },
    { shape: 'd20', left: 84, top: 20, size: 62, rot: 6,   depth: 0.8 },
    { shape: 'd6',  left: 91, top: 74, size: 38, rot: -12, depth: 0.4 },
    { shape: 'd8',  left: 48, top: 42, size: 34, rot: 30,  depth: 0.3 }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var field = document.getElementById('diceField');
    if (!field) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    var dice = LAYOUT.map(function (cfg, i) {
      var el = document.createElement('div');
      el.className = 'dice-field__die';
      el.style.left = cfg.left + '%';
      el.style.top = cfg.top + '%';
      el.style.width = cfg.size + 'px';
      el.style.height = cfg.size + 'px';
      el.innerHTML = '<svg viewBox="0 0 100 100" fill="url(#dfGrad)" stroke="currentColor" stroke-width="1.1">' + SHAPES[cfg.shape] + '</svg>';
      field.appendChild(el);
      return { el: el, cfg: cfg, phase: (i / LAYOUT.length) * Math.PI * 2 };
    });

    if (reduced) {
      dice.forEach(function (d) {
        d.el.style.transform = 'rotate(' + d.cfg.rot + 'deg)';
      });
      return;
    }

    var target = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };

    window.addEventListener('pointermove', function (e) {
      if (!fine.matches) return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function frame(t) {
      requestAnimationFrame(frame);
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      var seconds = t / 1000;

      dice.forEach(function (d) {
        var depth = d.cfg.depth;
        var rotY = pos.x * 16 * depth;
        var rotX = -pos.y * 16 * depth;
        var tx = pos.x * 14 * depth;
        var ty = pos.y * 10 * depth;

        if (!fine.matches) {
          // Idle drift for touch: a slow independent sway per die.
          rotY = Math.sin(seconds * 0.25 + d.phase) * 6 * depth;
          rotX = Math.cos(seconds * 0.2 + d.phase) * 4 * depth;
          tx = 0; ty = 0;
        }

        d.el.style.transform =
          'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) ' +
          'rotate(' + d.cfg.rot + 'deg) ' +
          'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      });
    }
    requestAnimationFrame(frame);
  });
})();
