// The Wandering Die — galería de las doce clases (con ficha de combate) y el test.
(function (global) {
  'use strict';

  var CLASSES = global.WD_CLASSES;
  var QUESTIONS = global.WD_QUIZ;

  function byId(id) {
    for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].id === id) return CLASSES[i];
    return null;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Ficha de combate compartida por el modal de clase y el resultado del test.
  function statBlock(c) {
    var rows = [
      ['Rol', c.rol], ['Ataque', c.ataque], ['Magia', c.magia],
      ['Alcance', c.alcance], ['Armas', c.armas], ['Armadura', c.armadura], ['Dado de golpe', c.dado]
    ];
    return '<dl class="stats">' + rows.map(function (r) {
      return '<div class="stats__row"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  function traitChips(c) {
    return '<ul class="chips">' + c.traits.map(function (t) {
      return '<li class="chips__item">' + esc(t) + '</li>';
    }).join('') + '</ul>';
  }

  // ---------------------------------------------------------------- galería
  function renderGrid() {
    var grid = document.getElementById('classesGrid');
    if (!grid) return;
    grid.innerHTML = CLASSES.map(function (c, i) {
      return '<article class="class-card" data-class="' + c.id + '" data-rise tabindex="0" role="button" ' +
        'aria-label="Ver la ficha de ' + esc(c.name) + '" style="--i:' + (i % 6) + '">' +
        '<div class="class-card__art"><img src="' + c.image + '" alt="" loading="lazy" width="600" height="800"></div>' +
        '<div class="class-card__body">' +
        '<span class="class-card__icon" aria-hidden="true">' + c.icon + '</span>' +
        '<h3 class="class-card__name">' + esc(c.name) + '</h3>' +
        '<p class="class-card__tagline">' + esc(c.tagline) + '</p>' +
        '<p class="class-card__meta">' + esc(c.magia === 'Ninguna' ? 'Sin magia' : 'Usa magia') +
        ' · ' + esc(c.alcance.split('—')[0].trim()) + '</p>' +
        '</div></article>';
    }).join('');
  }

  // ---------------------------------------------------------------- modal
  var modal, modalBody, lastFocus = null;

  function openClass(id) {
    var c = byId(id);
    if (!c || !modal) return;
    modalBody.innerHTML =
      '<div class="sheet__art"><img src="' + c.image + '" alt="Ilustración de ' + esc(c.name) + '" width="600" height="800"></div>' +
      '<div class="sheet__text">' +
      '<span class="sheet__icon" aria-hidden="true">' + c.icon + '</span>' +
      '<h3 class="sheet__name" id="classSheetTitle">' + esc(c.name) + '</h3>' +
      '<p class="sheet__tagline">' + esc(c.tagline) + '</p>' +
      '<p class="sheet__desc">' + esc(c.desc) + '</p>' +
      statBlock(c) + traitChips(c) +
      '</div>';
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var closeBtn = modal.querySelector('.sheet__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeClass() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindGrid() {
    var grid = document.getElementById('classesGrid');
    modal = document.getElementById('classSheet');
    modalBody = document.getElementById('classSheetBody');
    if (!grid || !modal) return;

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.class-card');
      if (card) openClass(card.getAttribute('data-class'));
    });
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('.class-card');
      if (card) { e.preventDefault(); openClass(card.getAttribute('data-class')); }
    });
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeClass();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeClass();
    });
  }

  // ---------------------------------------------------------------- test
  var state = { index: 0, answers: [], result: null };
  var els = {};

  function cache() {
    els.intro = document.getElementById('quizIntro');
    els.play = document.getElementById('quizPlay');
    els.result = document.getElementById('quizResult');
    els.start = document.getElementById('quizStartBtn');
    els.bar = document.getElementById('quizBar');
    els.step = document.getElementById('quizStep');
    els.question = document.getElementById('quizQuestion');
    els.options = document.getElementById('quizOptions');
    els.prev = document.getElementById('quizPrevBtn');
    els.retake = document.getElementById('quizRetakeBtn');
    els.resultBody = document.getElementById('quizResultBody');
  }

  function show(panel) {
    [els.intro, els.play, els.result].forEach(function (p) { if (p) p.hidden = (p !== panel); });
  }

  function start() {
    state.index = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    state.result = null;
    show(els.play);
    renderQuestion();
  }

  function renderQuestion() {
    var q = QUESTIONS[state.index];
    els.step.textContent = 'Pregunta ' + (state.index + 1) + ' de ' + QUESTIONS.length;
    els.bar.style.width = ((state.index / QUESTIONS.length) * 100) + '%';
    els.question.textContent = q.q;
    els.options.innerHTML = q.options.map(function (o, i) {
      var on = state.answers[state.index] === i;
      return '<button type="button" class="option' + (on ? ' is-on' : '') + '" data-i="' + i + '">' +
        '<span class="option__mark" aria-hidden="true"></span>' +
        '<span class="option__text">' + esc(o.t) + '</span></button>';
    }).join('');
    els.prev.disabled = state.index === 0;
    // La pregunta entra desde arriba, no desde el costado.
    els.play.classList.remove('is-in');
    void els.play.offsetWidth;
    els.play.classList.add('is-in');
  }

  function answer(i) {
    state.answers[state.index] = i;
    // Elegir avanza solo: el test no pide confirmar dos veces la misma decisión.
    var opts = els.options.querySelectorAll('.option');
    for (var k = 0; k < opts.length; k++) opts[k].classList.toggle('is-on', k === i);
    setTimeout(function () {
      if (state.index < QUESTIONS.length - 1) { state.index++; renderQuestion(); }
      else finish();
    }, 260);
  }

  function finish() {
    var scores = {};
    CLASSES.forEach(function (c) { scores[c.id] = 0; });
    state.answers.forEach(function (ai, qi) {
      if (ai == null) return;
      QUESTIONS[qi].options[ai].c.forEach(function (id) {
        if (id in scores) scores[id]++;
      });
    });
    var max = -1, winners = [];
    Object.keys(scores).forEach(function (id) {
      if (scores[id] > max) { max = scores[id]; winners = [id]; }
      else if (scores[id] === max) winners.push(id);
    });
    // Empate: gana la clase que apareció en la respuesta más reciente.
    if (winners.length > 1) {
      outer: for (var qi = state.answers.length - 1; qi >= 0; qi--) {
        var ai = state.answers[qi];
        if (ai == null) continue;
        var cs = QUESTIONS[qi].options[ai].c;
        for (var j = 0; j < cs.length; j++) {
          if (winners.indexOf(cs[j]) !== -1) { winners = [cs[j]]; break outer; }
        }
      }
    }
    state.result = winners[0];
    renderResult();
  }

  function renderResult() {
    var c = byId(state.result);
    els.bar.style.width = '100%';
    els.resultBody.innerHTML =
      '<div class="result__art"><img src="' + c.image + '" alt="Ilustración de ' + esc(c.name) + '" width="600" height="800"></div>' +
      '<div class="result__text">' +
      '<p class="result__kicker">Tu clase</p>' +
      '<h3 class="result__name">' + esc(c.name) + '</h3>' +
      '<p class="result__tagline">' + esc(c.tagline) + '</p>' +
      '<p class="result__desc">' + esc(c.desc) + '</p>' +
      statBlock(c) + traitChips(c) +
      '</div>';
    show(els.result);
  }

  function bindQuiz() {
    cache();
    if (!els.intro) return;
    show(els.intro);
    els.start.addEventListener('click', start);
    els.retake.addEventListener('click', start);
    els.prev.addEventListener('click', function () {
      if (state.index > 0) { state.index--; renderQuestion(); }
    });
    els.options.addEventListener('click', function (e) {
      var btn = e.target.closest('.option');
      if (btn) answer(parseInt(btn.getAttribute('data-i'), 10));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderGrid();
    bindGrid();
    bindQuiz();
  });
})(window);
