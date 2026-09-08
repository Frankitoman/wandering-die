// The Wandering Die — Destiny Dice.
//
// El flujo está invertido respecto de la versión anterior: antes se sorteaba un
// número y la animación lo obedecía. Ahora se tira el dado en la simulación
// física, y recién cuando se frena se lee qué salió. Nadie sabe el resultado
// antes que el dado, incluido este archivo.
(function (global) {
  'use strict';

  var CATEGORIES = global.WD_DICE_CATEGORIES;
  var SCENARIOS = global.WD_DICE_SCENARIOS;

  // Heurística local para estimar la dificultad de una decisión escrita a mano.
  // No hay backend ni IA acá: son palabras que suben o bajan la vara.
  var DIFICIL = ['renunciar', 'mudar', 'mudanza', 'romper', 'divorcio', 'casarme', 'matrimonio',
    'invertir', 'riesgo', 'trabajo', 'carrera', 'dinero', 'plata', 'deuda', 'para siempre',
    'importante', 'miedo', 'confesar', 'amor', 'pareja', 'dejar', 'irme', 'emigrar'];
  var FACIL = ['pelicula', 'película', 'serie', 'comer', 'cafe', 'café', 'siesta', 'salir',
    'caminar', 'descanso', 'juego', 'musica', 'música', 'snack', 'rapido', 'rápido', 'hoy'];

  function estimateDC(text) {
    var low = text.toLowerCase();
    var dc = 10;
    DIFICIL.forEach(function (w) { if (low.indexOf(w) !== -1) dc += 2; });
    FACIL.forEach(function (w) { if (low.indexOf(w) !== -1) dc -= 2; });
    if (text.trim().length > 60) dc += 2;
    if (text.trim().length < 15) dc -= 1;
    return Math.max(5, Math.min(20, dc));
  }

  var els = {};
  var activeCategory = 'all';
  var current = null;       // { key, label, dc, low[], high[] }
  var threeReady = false;
  var lastVariant = {};

  function pick(list, key) {
    if (list.length === 1) return list[0];
    var i;
    do { i = Math.floor(Math.random() * list.length); } while (i === lastVariant[key]);
    lastVariant[key] = i;
    return list[i];
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function cache() {
    els.filters = document.getElementById('diceFilters');
    els.list = document.getElementById('diceList');
    els.stage = document.getElementById('diceStage');
    els.prompt = document.getElementById('dicePrompt');
    els.again = document.getElementById('diceAgain');
    els.canvas = document.getElementById('diceCanvas');
    els.rollBtn = document.getElementById('diceRollBtn');
    els.result = document.getElementById('diceResult');
    els.value = document.getElementById('diceValue');
    els.verdict = document.getElementById('diceVerdict');
    els.outcome = document.getElementById('diceOutcome');
    els.input = document.getElementById('diceInput');
    els.customBtn = document.getElementById('diceCustomBtn');
  }

  function renderFilters() {
    var html = ['<button type="button" class="filter is-on" data-cat="all">Todas</button>'];
    CATEGORIES.forEach(function (c) {
      html.push('<button type="button" class="filter" data-cat="' + c.id + '">' + esc(c.name) + '</button>');
    });
    els.filters.innerHTML = html.join('');
  }

  function renderList() {
    var items = SCENARIOS.filter(function (s) {
      return activeCategory === 'all' || s.category === activeCategory;
    });
    // La dificultad no se muestra en ningún lado: sigue estando en los datos
    // porque es lo que decide si la tirada sale bien o mal, pero enseñarla
    // convierte una consulta al destino en una planilla de reglas.
    els.list.innerHTML = items.map(function (s) {
      return '<button type="button" class="decision" data-idx="' + SCENARIOS.indexOf(s) + '">' +
        '<span class="decision__text">' + esc(s.label) + '</span></button>';
    }).join('');
  }

  function selectScenario(key, label, dc, low, high) {
    current = { key: key, label: label, dc: dc, low: low, high: high };
    els.prompt.textContent = label;
    els.result.hidden = true;
    els.again.hidden = true;
    els.stage.hidden = false;
    els.rollBtn.hidden = false;
    els.rollBtn.disabled = false;
    els.rollBtn.textContent = 'Tirar el dado';
    // La bandeja arranca oculta, así que hasta este momento el lienzo del dado
    // medía 0×0 y el render salía a la resolución de respaldo. Recién ahora
    // tiene tamaño de verdad: sin este ajuste el dado se ve borroso.
    if (global.WD3D && global.WD3D.resize) global.WD3D.resize();
    els.stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function roll() {
    if (!current || els.rollBtn.disabled) return;
    els.rollBtn.disabled = true;
    els.rollBtn.textContent = 'Rodando…';
    els.result.hidden = true;

    // El dado 3D puede estar todavía construyéndose (espera a que cargue la
    // tipografía de los numerales): se reintenta una vez y, si igual no está
    // disponible, la tirada se resuelve sin él. Nadie se queda con el botón trabado.
    if (tryRoll()) return;
    setTimeout(function () {
      if (tryRoll()) return;
      showResult(1 + Math.floor(Math.random() * 20));
    }, 500);
  }

  function tryRoll() {
    return !!(threeReady && global.WD3D && global.WD3D.roll(showResult));
  }

  function showResult(value) {
    var success = value >= current.dc;
    els.value.textContent = value;
    els.value.className = 'roll__value' + (value === 20 ? ' is-crit' : value === 1 ? ' is-fumble' : '');
    els.verdict.textContent = value === 20 ? '¡Éxito crítico!'
      : value === 1 ? 'Pifia'
      : success ? 'Superás la dificultad' : 'No llegás';
    els.outcome.textContent = pick(success ? current.high : current.low, current.key + (success ? '_h' : '_l'));
    els.result.hidden = false;
    // Una tirada por decisión: el botón desaparece. Si el dado se pudiera tirar
    // de nuevo hasta que salga lo que uno quiere, no estaría decidiendo nada.
    els.rollBtn.hidden = true;
    els.again.hidden = false;
  }

  function submitCustom() {
    var text = els.input.value.trim();
    if (!text) return;
    var dc = estimateDC(text);
    selectScenario('custom', text, dc,
      ['El dado dice que no. Dejalo pasar por ahora.',
       'No esta vez. Guardalo para otro momento.',
       'La respuesta es no, y está bien.'],
      ['El dado dice que sí. Andá.',
       'Dale, es que sí. Hacelo.',
       'Sí. No lo pienses más.']);
  }

  function setupDie() {
    function tryInit() {
      if (threeReady) return;
      if (global.WD3D && els.canvas && global.WD3D.init(els.canvas)) threeReady = true;
      else if (els.stage) els.stage.classList.add('is-flat');
    }
    if (global.WD3D) tryInit();
    else {
      global.addEventListener('wd3d-ready', tryInit, { once: true });
      setTimeout(function () { if (!threeReady && els.stage) els.stage.classList.add('is-flat'); }, 3500);
    }
  }

  function init() {
    cache();
    if (!els.filters) return;
    renderFilters();
    renderList();
    setupDie();

    els.filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      activeCategory = btn.getAttribute('data-cat');
      els.filters.querySelectorAll('.filter').forEach(function (b) {
        b.classList.toggle('is-on', b === btn);
      });
      renderList();
    });

    els.list.addEventListener('click', function (e) {
      var btn = e.target.closest('.decision');
      if (!btn) return;
      var s = SCENARIOS[parseInt(btn.getAttribute('data-idx'), 10)];
      selectScenario('s' + btn.getAttribute('data-idx'), s.label, s.dc, s.low, s.high);
    });

    els.rollBtn.addEventListener('click', roll);
    els.customBtn.addEventListener('click', submitCustom);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitCustom();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
