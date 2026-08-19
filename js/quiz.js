// The Wandering Die — classes grid + class-finder quiz logic
(function (global) {
  'use strict';

  var CLASSES = global.WD_CLASSES;
  var QUESTIONS = global.WD_QUIZ;
  var lang = function () { return global.i18n.getLang(); };
  var t = global.i18n.t;

  var state = { index: 0, answers: new Array(QUESTIONS.length).fill(null), result: null };

  function classById(id) {
    for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].id === id) return CLASSES[i];
    return null;
  }

  // ---- Classes preview grid ----
  function renderClassesGrid() {
    var grid = document.getElementById('classesGrid');
    if (!grid) return;
    var L = lang();
    grid.innerHTML = CLASSES.map(function (c) {
      var info = c.i18n[L];
      return '<div class="class-chip" data-reveal>' +
        '<span class="class-chip__icon">' + c.icon + '</span>' +
        '<span class="class-chip__name">' + info.name + '</span>' +
        '<span class="class-chip__tagline">' + info.tagline + '</span>' +
        '</div>';
    }).join('');
  }

  // ---- Quiz flow ----
  var els = {};

  function cacheEls() {
    els.intro = document.getElementById('quizIntro');
    els.play = document.getElementById('quizPlay');
    els.result = document.getElementById('quizResult');
    els.startBtn = document.getElementById('quizStartBtn');
    els.progress = document.getElementById('quizProgress');
    els.progressBar = document.getElementById('quizProgressBar');
    els.questionText = document.getElementById('quizQuestionText');
    els.options = document.getElementById('quizOptions');
    els.prevBtn = document.getElementById('quizPrevBtn');
    els.nextBtn = document.getElementById('quizNextBtn');
    els.retakeBtn = document.getElementById('quizRetakeBtn');
  }

  function showPanel(panel) {
    [els.intro, els.play, els.result].forEach(function (p) {
      if (p) p.hidden = (p !== panel);
    });
  }

  function startQuiz() {
    state.index = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    state.result = null;
    showPanel(els.play);
    renderQuestion();
  }

  function renderQuestion() {
    var L = lang();
    var q = QUESTIONS[state.index];
    els.questionText.textContent = q.i18n[L];
    els.progress.textContent = t('quiz_question_label', { current: state.index + 1, total: QUESTIONS.length });
    els.progressBar.style.width = (((state.index) / QUESTIONS.length) * 100) + '%';

    els.options.innerHTML = q.options.map(function (opt, i) {
      var selected = state.answers[state.index] === i;
      return '<button type="button" class="quiz-option' + (selected ? ' is-selected' : '') + '" data-option="' + i + '">' +
        '<span class="quiz-option__dot"></span>' + opt.i18n[L] + '</button>';
    }).join('');

    els.options.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.answers[state.index] = parseInt(btn.getAttribute('data-option'), 10);
        renderQuestion();
        if (state.index < QUESTIONS.length - 1) {
          setTimeout(function () { state.index++; renderQuestion(); }, 220);
        }
      });
    });

    els.prevBtn.disabled = state.index === 0;
    var isLast = state.index === QUESTIONS.length - 1;
    els.nextBtn.textContent = isLast ? t('quiz_see_result') : t('quiz_next');
    els.nextBtn.disabled = state.answers[state.index] === null;
  }

  function computeResult() {
    var scores = {};
    CLASSES.forEach(function (c) { scores[c.id] = 0; });
    state.answers.forEach(function (ansIdx, qIdx) {
      if (ansIdx === null) return;
      QUESTIONS[qIdx].options[ansIdx].classes.forEach(function (cid) { scores[cid]++; });
    });
    var max = Math.max.apply(null, Object.keys(scores).map(function (k) { return scores[k]; }));
    var tied = Object.keys(scores).filter(function (k) { return scores[k] === max; });
    if (tied.length === 1) return tied[0];
    for (var qi = state.answers.length - 1; qi >= 0; qi--) {
      var ansIdx = state.answers[qi];
      if (ansIdx === null) continue;
      var opt = QUESTIONS[qi].options[ansIdx];
      for (var i = 0; i < opt.classes.length; i++) {
        if (tied.indexOf(opt.classes[i]) !== -1) return opt.classes[i];
      }
    }
    return tied[0];
  }

  function renderResult() {
    var L = lang();
    var cls = classById(state.result);
    var info = cls.i18n[L];
    els.result.style.setProperty('--result-bg', 'url(' + cls.image + ')');
    document.getElementById('resultIcon').innerHTML = cls.icon;
    document.getElementById('resultKicker').textContent = t('result_kicker');
    document.getElementById('resultName').textContent = info.name;
    document.getElementById('resultTagline').textContent = info.tagline;
    document.getElementById('resultDesc').textContent = info.desc;
    document.getElementById('resultTraitsLabel').textContent = t('result_traits_label');
    document.getElementById('resultTraits').innerHTML = info.traits.map(function (tr) {
      return '<span class="trait-chip">' + tr + '</span>';
    }).join('');
    showPanel(els.result);
  }

  function init() {
    cacheEls();
    renderClassesGrid();
    if (!els.intro) return;
    showPanel(els.intro);
    els.startBtn.addEventListener('click', startQuiz);
    els.prevBtn.addEventListener('click', function () {
      if (state.index > 0) { state.index--; renderQuestion(); }
    });
    els.nextBtn.addEventListener('click', function () {
      if (state.answers[state.index] === null) return;
      if (state.index < QUESTIONS.length - 1) {
        state.index++;
        renderQuestion();
      } else {
        state.result = computeResult();
        renderResult();
      }
    });
    els.retakeBtn.addEventListener('click', startQuiz);

    global.i18n.onChange(function () {
      renderClassesGrid();
      if (els.play && !els.play.hidden) renderQuestion();
      if (els.result && !els.result.hidden) renderResult();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
