// The Wandering Die — Destiny Dice: category picker, d20 roll, custom-decision DC heuristic
(function (global) {
  'use strict';

  var CATEGORIES = global.WD_DICE_CATEGORIES;
  var SCENARIOS = global.WD_DICE_SCENARIOS;
  var lang = function () { return global.i18n.getLang(); };
  var t = global.i18n.t;

  var HIGH_DC_WORDS = [
    'renunciar', 'quit', 'opsige', 'mudar', 'move', 'flytte', 'romper', 'break up', 'slå op',
    'matrimonio', 'marriage', 'ægteskab', 'divorcio', 'divorce', 'skilsmisse', 'invertir', 'invest', 'investere',
    'riesgo', 'risk', 'risiko', 'trabajo', 'job', 'career', 'carrera', 'karriere', 'dinero', 'money', 'penge',
    'para siempre', 'forever', 'for altid', 'mudanza', 'gran', 'grande', 'big', 'stor', 'importante', 'important', 'vigtig',
    'miedo', 'fear', 'frygt', 'confesar', 'confess', 'tilstå', 'amor', 'love', 'kærlighed', 'pareja', 'partner'
  ];
  var LOW_DC_WORDS = [
    'pelicula', 'movie', 'film', 'comer', 'eat', 'spise', 'cafe', 'coffee', 'kaffe', 'siesta', 'nap', 'lur',
    'salir', 'go out', 'gå ud', 'rapido', 'quick', 'hurtig', 'serie', 'series', 'snack', 'caminar', 'walk', 'gå',
    'descanso', 'break', 'pause', 'juego', 'game', 'spil', 'musica', 'music', 'musik'
  ];

  function estimateDC(text) {
    var lower = text.toLowerCase();
    var dc = 10;
    HIGH_DC_WORDS.forEach(function (w) { if (lower.indexOf(w) !== -1) dc += 2; });
    LOW_DC_WORDS.forEach(function (w) { if (lower.indexOf(w) !== -1) dc -= 2; });
    if (text.trim().length > 60) dc += 2;
    if (text.trim().length < 15) dc -= 1;
    return Math.max(5, Math.min(20, dc));
  }

  var els = {};
  var activeCategory = 'all';
  var current = null; // { label, dc, low, high }
  var threeActive = false;

  function cacheEls() {
    els.filters = document.getElementById('diceCategoryFilters');
    els.list = document.getElementById('diceScenarioList');
    els.stage = document.getElementById('diceStage');
    els.stagePrompt = document.getElementById('diceStagePrompt');
    els.die = document.getElementById('diceD20');
    els.dieCanvas = document.getElementById('diceD20Canvas');
    els.dieNumber = document.getElementById('diceD20Number');
    els.rollBtn = document.getElementById('diceRollBtn');
    els.resultArea = document.getElementById('diceResultArea');
    els.rollNumber = document.getElementById('diceRollNumber');
    els.outcomeLow = document.getElementById('diceOutcomeLow');
    els.outcomeHigh = document.getElementById('diceOutcomeHigh');
    els.againBtn = document.getElementById('diceAgainBtn');
    els.customInput = document.getElementById('diceCustomInput');
    els.customBtn = document.getElementById('diceCustomBtn');
    els.customNote = document.getElementById('diceCustomDcNote');
  }

  function renderFilters() {
    var L = lang();
    var chips = ['<button type="button" class="dice-filter' + (activeCategory === 'all' ? ' is-active' : '') + '" data-cat="all">' + t('dice_filter_all') + '</button>'];
    CATEGORIES.forEach(function (c) {
      chips.push('<button type="button" class="dice-filter' + (activeCategory === c.id ? ' is-active' : '') + '" data-cat="' + c.id + '">' + c.i18n[L] + '</button>');
    });
    els.filters.innerHTML = chips.join('');
    els.filters.querySelectorAll('.dice-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCategory = btn.getAttribute('data-cat');
        renderFilters();
        renderList();
      });
    });
  }

  function renderList() {
    var L = lang();
    var items = SCENARIOS.filter(function (s) { return activeCategory === 'all' || s.category === activeCategory; });
    els.list.innerHTML = items.map(function (s, i) {
      return '<button type="button" class="dice-scenario" data-idx="' + SCENARIOS.indexOf(s) + '">' + s.i18n[L].label + '</button>';
    }).join('');
    els.list.querySelectorAll('.dice-scenario').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var s = SCENARIOS[parseInt(btn.getAttribute('data-idx'), 10)];
        selectScenario(s.i18n[lang()].label, s.dc, s.i18n[lang()].low, s.i18n[lang()].high);
      });
    });
  }

  function selectScenario(label, dc, low, high) {
    current = { label: label, dc: dc, low: low, high: high };
    els.stagePrompt.textContent = label;
    els.resultArea.hidden = true;
    els.stage.hidden = false;
    els.stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function rollDie() {
    if (!current || els.rollBtn.disabled) return;
    els.rollBtn.disabled = true;
    els.resultArea.hidden = true;

    if (threeActive) {
      global.WD3D.startRoll();
    } else {
      els.die.classList.add('is-rolling');
    }

    var ticks = 0;
    var maxTicks = 14;
    var iv = setInterval(function () {
      els.dieNumber.textContent = String(1 + Math.floor(Math.random() * 20));
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(iv);
        var finalRoll = 1 + Math.floor(Math.random() * 20);
        els.dieNumber.textContent = String(finalRoll);
        if (!threeActive) {
          els.die.classList.remove('is-rolling');
          els.die.classList.add('is-landed');
          setTimeout(function () { els.die.classList.remove('is-landed'); }, 500);
        }
        showRollResult(finalRoll);
        els.rollBtn.disabled = false;
      }
    }, 70);
  }

  function showRollResult(roll) {
    els.rollNumber.textContent = t('dice_roll_result', { roll: roll });
    var success = roll >= current.dc;
    els.outcomeLow.textContent = current.low;
    els.outcomeHigh.textContent = current.high;
    els.outcomeLow.classList.toggle('is-chosen', !success);
    els.outcomeHigh.classList.toggle('is-chosen', success);
    els.resultArea.hidden = false;
  }

  function submitCustom() {
    var text = els.customInput.value.trim();
    if (!text) return;
    var dc = estimateDC(text);
    els.customNote.hidden = false;
    els.customNote.textContent = t('dice_custom_dc_detected');
    selectScenario(text, dc, t('dice_custom_low'), t('dice_custom_high'));
  }

  function setupDie() {
    function tryInit() {
      if (threeActive) return;
      if (global.WD3D && els.dieCanvas && global.WD3D.init(els.dieCanvas)) {
        threeActive = true;
      } else {
        els.die.classList.add('d20--fallback');
      }
    }
    if (global.WD3D) {
      tryInit();
    } else {
      global.addEventListener('wd3d-ready', tryInit, { once: true });
      setTimeout(function () {
        if (!threeActive) els.die.classList.add('d20--fallback');
      }, 2500);
    }
  }

  function init() {
    cacheEls();
    if (!els.filters) return;
    setupDie();
    renderFilters();
    renderList();
    els.rollBtn.addEventListener('click', rollDie);
    els.againBtn.addEventListener('click', function () { els.resultArea.hidden = true; });
    els.customBtn.addEventListener('click', submitCustom);
    els.customInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitCustom();
    });

    global.i18n.onChange(function () {
      renderFilters();
      renderList();
      if (current) {
        els.stage.hidden = true;
        els.resultArea.hidden = true;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
