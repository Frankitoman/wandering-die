// The Wandering Die — i18n engine (ES default, EN, DA)
(function (global) {
  'use strict';

  var STORAGE_KEY = 'wd_lang';
  var SUPPORTED = ['es', 'en', 'da'];
  var DEFAULT_LANG = 'es';

  var DICT = {
    es: {
      brand: 'The Wandering Die',
      nav_classes: 'Clases',
      nav_quiz: 'Encontrá tu clase',
      nav_dice: 'Destiny Dice',
      hero_kicker: 'Una herramienta para aventureros indecisos',
      hero_title: 'Encontrá tu clase. Dejá que el destino decida el resto.',
      hero_lead: 'Respondé 10 preguntas y descubrí qué clase de D&D te representa. Después, cuando la vida real te deje sin saber qué hacer, tirá el Destiny Dice.',
      hero_cta_quiz: 'Empezar el quiz',
      hero_cta_dice: 'Ir al Destiny Dice',
      classes_title: 'Los doce caminos',
      classes_lead: 'Cada clase de D&D 5e representa una forma distinta de enfrentar el mundo. Una de ellas es la tuya.',
      quiz_title: 'Encontrá tu clase',
      quiz_lead: '10 preguntas, sin respuestas correctas ni incorrectas. Elegí lo que más se parezca a vos.',
      quiz_start: 'Empezar',
      quiz_question_label: 'Pregunta {current} de {total}',
      quiz_prev: 'Anterior',
      quiz_next: 'Siguiente',
      quiz_see_result: 'Ver resultado',
      quiz_retake: 'Repetir el quiz',
      result_kicker: 'Tu clase es',
      result_traits_label: 'Rasgos',
      result_lead: 'Basado en tus respuestas, así es como enfrentás el mundo.',
      dice_title: 'Destiny Dice',
      dice_lead: 'Un d20 para las decisiones de todos los días. Elegí una categoría o escribí tu propia duda — el dado, y su DC, se encargan del resto.',
      dice_filter_all: 'Todas',
      dice_pick_prompt: 'Elegí una decisión para tirar el dado',
      dice_roll_button: 'Tirar el dado',
      dice_rolling: 'Rodando...',
      dice_custom_title: 'O escribí tu propia decisión',
      dice_custom_placeholder: 'Ej: "¿Debería animarme a cambiar de trabajo?"',
      dice_custom_button: 'Consultar al destino',
      dice_custom_dc_detected: 'El destino ya sabe qué tan difícil es esto. Tirá el dado para descubrirlo.',
      dice_custom_low: 'Frená y esperá el momento',
      dice_custom_high: 'Animate y avanzá',
      footer_tagline: 'Una herramienta hecha por y para aventureros indecisos.',
      footer_made: 'Diseñado y construido por',
      footer_back_home: 'Volver al portfolio'
    },
    en: {
      brand: 'The Wandering Die',
      nav_classes: 'Classes',
      nav_quiz: 'Find your class',
      nav_dice: 'Destiny Dice',
      hero_kicker: 'A tool for indecisive adventurers',
      hero_title: 'Find your class. Let fate handle the rest.',
      hero_lead: "Answer 10 questions and discover which D&D class you truly are. Then, when real life leaves you stuck, roll the Destiny Dice.",
      hero_cta_quiz: 'Start the quiz',
      hero_cta_dice: 'Go to the Destiny Dice',
      classes_title: 'The twelve paths',
      classes_lead: 'Every D&D 5e class is a different way of meeting the world. One of them is yours.',
      quiz_title: 'Find your class',
      quiz_lead: "10 questions, no right or wrong answers. Pick whatever feels most like you.",
      quiz_start: 'Start',
      quiz_question_label: 'Question {current} of {total}',
      quiz_prev: 'Back',
      quiz_next: 'Next',
      quiz_see_result: 'See result',
      quiz_retake: 'Retake the quiz',
      result_kicker: 'Your class is',
      result_traits_label: 'Traits',
      result_lead: "Based on your answers, this is how you meet the world.",
      dice_title: 'Destiny Dice',
      dice_lead: "A d20 for everyday decisions. Pick a category or write your own dilemma — the die, and its DC, handle the rest.",
      dice_filter_all: 'All',
      dice_pick_prompt: 'Pick a decision to roll for',
      dice_roll_button: 'Roll the die',
      dice_rolling: 'Rolling...',
      dice_custom_title: 'Or write your own decision',
      dice_custom_placeholder: 'e.g. "Should I go for that career change?"',
      dice_custom_button: 'Consult fate',
      dice_custom_dc_detected: 'Fate already knows how hard this one is. Roll to find out.',
      dice_custom_low: 'Hold back and wait',
      dice_custom_high: 'Go for it',
      footer_tagline: 'A tool made by and for indecisive adventurers.',
      footer_made: 'Designed and built by',
      footer_back_home: 'Back to the portfolio'
    },
    da: {
      brand: 'The Wandering Die',
      nav_classes: 'Klasser',
      nav_quiz: 'Find din klasse',
      nav_dice: 'Destiny Dice',
      hero_kicker: 'Et værktøj til ubeslutsomme eventyrere',
      hero_title: 'Find din klasse. Lad skæbnen klare resten.',
      hero_lead: 'Svar på 10 spørgsmål og find ud af, hvilken D&D-klasse du egentlig er. Og når det virkelige liv efterlader dig i tvivl, så kast Destiny Dice.',
      hero_cta_quiz: 'Start quizzen',
      hero_cta_dice: 'Gå til Destiny Dice',
      classes_title: 'De tolv veje',
      classes_lead: 'Hver D&D 5e-klasse er en anden måde at møde verden på. Én af dem er din.',
      quiz_title: 'Find din klasse',
      quiz_lead: '10 spørgsmål, ingen rigtige eller forkerte svar. Vælg det, der føles mest som dig.',
      quiz_start: 'Start',
      quiz_question_label: 'Spørgsmål {current} af {total}',
      quiz_prev: 'Tilbage',
      quiz_next: 'Næste',
      quiz_see_result: 'Se resultat',
      quiz_retake: 'Tag quizzen igen',
      result_kicker: 'Din klasse er',
      result_traits_label: 'Egenskaber',
      result_lead: 'Baseret på dine svar, sådan møder du verden.',
      dice_title: 'Destiny Dice',
      dice_lead: 'En d20 til hverdagens beslutninger. Vælg en kategori, eller skriv dit eget dilemma — terningen, og dens DC, klarer resten.',
      dice_filter_all: 'Alle',
      dice_pick_prompt: 'Vælg en beslutning at kaste for',
      dice_roll_button: 'Kast terningen',
      dice_rolling: 'Ruller...',
      dice_custom_title: 'Eller skriv din egen beslutning',
      dice_custom_placeholder: 'F.eks. "Skal jeg skifte karriere?"',
      dice_custom_button: 'Spørg skæbnen',
      dice_custom_dc_detected: 'Skæbnen kender allerede sværhedsgraden. Kast terningen for at finde ud af det.',
      dice_custom_low: 'Vent og hold igen',
      dice_custom_high: 'Kast dig ud i det',
      footer_tagline: 'Et værktøj lavet af og til ubeslutsomme eventyrere.',
      footer_made: 'Designet og bygget af',
      footer_back_home: 'Tilbage til porteføljen'
    }
  };

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = (global.navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(nav) !== -1) return nav;
    return DEFAULT_LANG;
  }

  var currentLang = detectLang();
  var listeners = [];

  function t(key, vars) {
    var str = (DICT[currentLang] && DICT[currentLang][key]) || (DICT[DEFAULT_LANG] && DICT[DEFAULT_LANG][key]) || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace('{' + k + '}', vars[k]);
      });
    }
    return str;
  }

  function getLang() { return currentLang; }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyToDOM();
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) { listeners.push(fn); }

  function applyToDOM(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    if (!root) {
      document.documentElement.setAttribute('lang', currentLang);
      scope.querySelectorAll('[data-lang-option]').forEach(function (el) {
        el.classList.toggle('is-active', el.getAttribute('data-lang-option') === currentLang);
      });
    }
  }

  global.i18n = { t: t, getLang: getLang, setLang: setLang, applyToDOM: applyToDOM, onChange: onChange, SUPPORTED: SUPPORTED };
})(window);
