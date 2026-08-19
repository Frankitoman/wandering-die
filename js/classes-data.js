// The Wandering Die — D&D class definitions (icons, images, i18n content)
(function (global) {
  'use strict';

  var ICONS = {
    barbarian: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 L15 9"/><path d="M14 4c2.2-.6 4.4.2 5.6 1.4S21 8.8 20.4 11c-2 .6-4.2 0-5.7-1.5S13.4 6 14 4Z"/><path d="M5 19l-1.5 1.5"/></svg>',
    bard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l10-2v13"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="16" r="2.2"/></svg>',
    cleric: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M8 11h8"/></svg>',
    druid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4-2-7-6-7-11 5 0 9 2 9 7 0-5 4-7 9-7 0 5-3 9-7 11"/><path d="M12 21V10"/></svg>',
    fighter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 17.5 17 7l1.5-3.5L20 5l-3.5 1.5L6.5 17.5Z"/><path d="M6.5 17.5 4 20M13 10l3 3"/></svg>',
    monk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" opacity="0.35"/><circle cx="12" cy="12" r="3"/></svg>',
    paladin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="M12 8v7M9 11.5h6"/></svg>',
    ranger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3c6 1 10 5 11 11-6-1-10-5-11-11Z"/><path d="M17 14 4 21M17 14l1 4M17 14l-4-1"/></svg>',
    rogue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13l-3-3M12 16l3-3"/><path d="M9.5 16.5 12 21l2.5-4.5"/></svg>',
    sorcerer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/></svg>',
    warlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 21 19H3L12 3Z"/><circle cx="12" cy="14.5" r="2.6"/></svg>',
    wizard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19 12 4l8 15Z"/><circle cx="12" cy="2.4" r="1"/><path d="M9 19h6"/></svg>'
  };

  var CLASSES = [
    { id: 'barbarian', icon: ICONS.barbarian, image: 'assets/images/classes/barbarian.jpg',
      i18n: {
        en: { name: 'Barbarian', tagline: 'Fury given form', desc: 'You channel raw rage into unstoppable strength, tearing through anything that stands between you and victory.', traits: ['Reckless', 'Powerful', 'Instinctive', 'Unbreakable'] },
        es: { name: 'Bárbaro/a', tagline: 'La furia hecha forma', desc: 'Canalizás una rabia primitiva en una fuerza imparable, arrasando con todo lo que se interponga en tu camino.', traits: ['Temerario', 'Poderoso', 'Instintivo', 'Inquebrantable'] },
        da: { name: 'Barbarian', tagline: 'Raseri i skikkelse', desc: 'Du kanaliserer rå vrede til ustoppelig styrke og braser gennem alt, der står mellem dig og sejr.', traits: ['Vovet', 'Mægtig', 'Instinktiv', 'Ubrydelig'] }
      } },
    { id: 'bard', icon: ICONS.bard, image: 'assets/images/classes/bard.jpg',
      i18n: {
        en: { name: 'Bard', tagline: 'Magic woven in song', desc: 'Your words and music bend reality itself — you inspire allies, unravel enemies, and turn every room into your stage.', traits: ['Charismatic', 'Versatile', 'Witty', 'Inspiring'] },
        es: { name: 'Bardo/a', tagline: 'Magia tejida en canción', desc: 'Tus palabras y tu música doblan la realidad: inspirás aliados, desarmás enemigos y convertís cada sala en tu escenario.', traits: ['Carismático', 'Versátil', 'Ingenioso', 'Inspirador'] },
        da: { name: 'Bard', tagline: 'Magi vævet i sang', desc: 'Dine ord og din musik bøjer selve virkeligheden — du inspirerer allierede, afvæbner fjender og gør ethvert rum til din scene.', traits: ['Karismatisk', 'Alsidig', 'Vittig', 'Inspirerende'] }
      } },
    { id: 'cleric', icon: ICONS.cleric, image: 'assets/images/classes/cleric.jpg',
      i18n: {
        en: { name: 'Cleric', tagline: 'The divine made manifest', desc: "A god's power flows through you — you heal the broken, smite the wicked, and carry faith like a shield.", traits: ['Devout', 'Resilient', 'Protective', 'Wise'] },
        es: { name: 'Clérigo/a', tagline: 'Lo divino hecho carne', desc: 'El poder de un dios fluye a través tuyo: curás lo roto, castigás a los malvados y llevás la fe como escudo.', traits: ['Devoto', 'Resiliente', 'Protector', 'Sabio'] },
        da: { name: 'Cleric', tagline: 'Det guddommelige manifesteret', desc: 'En guds kraft strømmer igennem dig — du helbreder de sårede, straffer de onde og bærer troen som et skjold.', traits: ['Fromme', 'Robust', 'Beskyttende', 'Vís'] }
      } },
    { id: 'druid', icon: ICONS.druid, image: 'assets/images/classes/druid.jpg',
      i18n: {
        en: { name: 'Druid', tagline: "Nature's shifting will", desc: 'You speak the old language of root and storm, shifting shape and calling on the wild to fight at your side.', traits: ['Primal', 'Adaptive', 'Protective', 'Untamed'] },
        es: { name: 'Druida', tagline: 'La voluntad cambiante de la naturaleza', desc: 'Hablás el idioma antiguo de la raíz y la tormenta, cambiás de forma y llamás a lo salvaje para que pelee a tu lado.', traits: ['Primal', 'Adaptable', 'Protector', 'Indomable'] },
        da: { name: 'Druid', tagline: 'Naturens skiftende vilje', desc: 'Du taler rodens og stormens gamle sprog, skifter skikkelse og kalder det vilde til kamp ved din side.', traits: ['Primal', 'Tilpasningsdygtig', 'Beskyttende', 'Utæmmet'] }
      } },
    { id: 'fighter', icon: ICONS.fighter, image: 'assets/images/classes/fighter.jpg',
      i18n: {
        en: { name: 'Fighter', tagline: 'Steel, discipline, victory', desc: 'Trained to master any weapon and outlast any foe, you turn preparation and grit into battlefield dominance.', traits: ['Disciplined', 'Relentless', 'Tactical', 'Steadfast'] },
        es: { name: 'Guerrero/a', tagline: 'Acero, disciplina, victoria', desc: 'Entrenado/a para dominar cualquier arma y resistir a cualquier rival, convertís la preparación y el coraje en dominio del campo de batalla.', traits: ['Disciplinado', 'Incansable', 'Táctico', 'Firme'] },
        da: { name: 'Fighter', tagline: 'Stål, disciplin, sejr', desc: 'Trænet i at mestre ethvert våben og overleve enhver fjende, forvandler du forberedelse og vilje til herredømme på slagmarken.', traits: ['Disciplineret', 'Ustandselig', 'Taktisk', 'Standhaftig'] }
      } },
    { id: 'monk', icon: ICONS.monk, image: 'assets/images/classes/monk.jpg',
      i18n: {
        en: { name: 'Monk', tagline: 'Body as weapon, mind as shield', desc: "Through relentless discipline you've turned your own body into a weapon and your spirit into an unshakable calm.", traits: ['Disciplined', 'Swift', 'Focused', 'Serene'] },
        es: { name: 'Monje', tagline: 'El cuerpo como arma, la mente como escudo', desc: 'Con disciplina implacable convertiste tu propio cuerpo en un arma y tu espíritu en una calma inquebrantable.', traits: ['Disciplinado', 'Veloz', 'Concentrado', 'Sereno'] },
        da: { name: 'Monk', tagline: 'Kroppen som våben, sindet som skjold', desc: 'Gennem ubønhørlig disciplin har du gjort din egen krop til et våben og dit sind til uforstyrrelig ro.', traits: ['Disciplineret', 'Hurtig', 'Fokuseret', 'Rolig'] }
      } },
    { id: 'paladin', icon: ICONS.paladin, image: 'assets/images/classes/paladin.jpg',
      i18n: {
        en: { name: 'Paladin', tagline: 'An oath that cannot break', desc: 'Bound by a sacred vow, you stand as a living shield for the innocent — your conviction is as sharp as your blade.', traits: ['Honorable', 'Devoted', 'Fearless', 'Just'] },
        es: { name: 'Paladín', tagline: 'Un juramento inquebrantable', desc: 'Atado/a a un voto sagrado, sos un escudo viviente para los inocentes: tu convicción es tan filosa como tu espada.', traits: ['Honorable', 'Devoto', 'Intrépido', 'Justo'] },
        da: { name: 'Paladin', tagline: 'En ed, der ikke kan brydes', desc: 'Bundet af et helligt løfte står du som et levende skjold for de uskyldige — din overbevisning er lige så skarp som dit sværd.', traits: ['Ærefuld', 'Hengiven', 'Frygtløs', 'Retfærdig'] }
      } },
    { id: 'ranger', icon: ICONS.ranger, image: 'assets/images/classes/ranger.jpg',
      i18n: {
        en: { name: 'Ranger', tagline: "The wild's silent guardian", desc: 'Half hunter, half wanderer, you read the land like a map and strike from the shadows the forest gives you.', traits: ['Perceptive', 'Independent', 'Precise', 'Resourceful'] },
        es: { name: 'Explorador/a', tagline: 'El guardián silencioso de lo salvaje', desc: 'Mitad cazador, mitad viajero, leés el terreno como un mapa y golpeás desde las sombras que el bosque te regala.', traits: ['Perceptivo', 'Independiente', 'Preciso', 'Ingenioso'] },
        da: { name: 'Ranger', tagline: 'Vildmarkens tavse vogter', desc: 'Halvt jæger, halvt vandrer, læser du landskabet som et kort og slår til fra skyggerne, skoven giver dig.', traits: ['Opmærksom', 'Uafhængig', 'Præcis', 'Opfindsom'] }
      } },
    { id: 'rogue', icon: ICONS.rogue, image: 'assets/images/classes/rogue.jpg',
      i18n: {
        en: { name: 'Rogue', tagline: 'One step ahead, always', desc: 'Quick hands, quicker wit — you find the gap in every plan and the exit in every trap.', traits: ['Cunning', 'Agile', 'Independent', 'Opportunistic'] },
        es: { name: 'Pícaro/a', tagline: 'Siempre un paso adelante', desc: 'Manos rápidas, mente más rápida todavía: encontrás la grieta en cada plan y la salida en cada trampa.', traits: ['Astuto', 'Ágil', 'Independiente', 'Oportunista'] },
        da: { name: 'Rogue', tagline: 'Altid et skridt foran', desc: 'Hurtige hænder, hurtigere kvikt hoved — du finder hullet i enhver plan og udgangen i enhver fælde.', traits: ['Snu', 'Adræt', 'Uafhængig', 'Opportunistisk'] }
      } },
    { id: 'sorcerer', icon: ICONS.sorcerer, image: 'assets/images/classes/sorcerer.jpg',
      i18n: {
        en: { name: 'Sorcerer', tagline: 'Magic in the blood', desc: 'Power was never taught to you — it was born in you, wild and unpredictable, waiting to be unleashed.', traits: ['Innate', 'Passionate', 'Unpredictable', 'Bold'] },
        es: { name: 'Hechicero/a', tagline: 'Magia en la sangre', desc: 'El poder nunca te lo enseñaron: nació en vos, salvaje e impredecible, esperando ser liberado.', traits: ['Innato', 'Apasionado', 'Impredecible', 'Audaz'] },
        da: { name: 'Sorcerer', tagline: 'Magi i blodet', desc: 'Kraften blev aldrig lært dig — den blev født i dig, vild og uforudsigelig, ventende på at blive sluppet løs.', traits: ['Medfødt', 'Lidenskabelig', 'Uforudsigelig', 'Dristig'] }
      } },
    { id: 'warlock', icon: ICONS.warlock, image: 'assets/images/classes/warlock.jpg',
      i18n: {
        en: { name: 'Warlock', tagline: 'Power bought, not earned', desc: 'You struck a bargain with something vast and unknowable — its power is yours, but so is its price.', traits: ['Cunning', 'Bound', 'Ambitious', 'Otherworldly'] },
        es: { name: 'Brujo/a', tagline: 'Poder comprado, no ganado', desc: 'Hiciste un pacto con algo vasto e incognoscible: su poder es tuyo, pero también lo es su precio.', traits: ['Astuto', 'Atado', 'Ambicioso', 'Sobrenatural'] },
        da: { name: 'Warlock', tagline: 'Magt der er købt, ikke tjent', desc: 'Du indgik en pagt med noget umådeligt og ukendeligt — dets kraft er din, men det er prisen også.', traits: ['Snu', 'Bundet', 'Ambitiøs', 'Overjordisk'] }
      } },
    { id: 'wizard', icon: ICONS.wizard, image: 'assets/images/classes/wizard.jpg',
      i18n: {
        en: { name: 'Wizard', tagline: 'Knowledge is the ultimate weapon', desc: "Years buried in ancient tomes have given you mastery over reality's rules — and how to bend every one of them.", traits: ['Studious', 'Precise', 'Strategic', 'Curious'] },
        es: { name: 'Mago/a', tagline: 'El conocimiento es el arma definitiva', desc: 'Años enterrado/a en tomos antiguos te dieron dominio sobre las reglas de la realidad, y sabés exactamente cómo doblarlas.', traits: ['Estudioso', 'Preciso', 'Estratégico', 'Curioso'] },
        da: { name: 'Wizard', tagline: 'Viden er det ultimative våben', desc: 'År begravet i gamle bind har givet dig herredømme over virkelighedens regler — og hvordan man bøjer hver eneste af dem.', traits: ['Studerende', 'Præcis', 'Strategisk', 'Nysgerrig'] }
      } }
  ];

  global.WD_CLASSES = CLASSES;
})(window);
