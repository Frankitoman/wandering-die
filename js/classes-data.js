// The Wandering Die — las doce clases de D&D 5e, con ficha de combate.
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
    {
      id: 'barbarian', icon: ICONS.barbarian, image: 'assets/images/classes/barbarian.webp',
      name: 'Bárbaro', tagline: 'La furia hecha forma',
      desc: 'Entrás en una furia que te vuelve más difícil de matar y más difícil de frenar. No planeás la pelea: la atravesás. Mientras el resto busca el ángulo, vos ya estás encima.',
      rol: 'Tanque de primera línea',
      ataque: 'Cuerpo a cuerpo, golpes pesados',
      magia: 'Ninguna',
      alcance: 'Corto — pegado al enemigo',
      armas: 'Hacha a dos manos, gran espada, martillo',
      armadura: 'Ligera o ninguna; aguanta a puro cuero',
      dado: 'd12 — el más alto del juego',
      traits: ['Temerario', 'Resistente', 'Instintivo', 'Imparable']
    },
    {
      id: 'bard', icon: ICONS.bard, image: 'assets/images/classes/bard.webp',
      name: 'Bardo', tagline: 'Magia tejida en canción',
      desc: 'Tu magia sale de la actuación: una palabra justa, una melodía, una mentira bien contada. Inspirás a los tuyos, desarmás a los otros y casi siempre encontrás una salida que no requiere pelear.',
      rol: 'Apoyo y control social',
      ataque: 'Hechizos y conjuros de apoyo',
      magia: 'Sí — arcana, por carisma',
      alcance: 'Medio a largo',
      armas: 'Estoque, daga, ballesta ligera',
      armadura: 'Ligera',
      dado: 'd8',
      traits: ['Carismático', 'Versátil', 'Ingenioso', 'Inspirador']
    },
    {
      id: 'cleric', icon: ICONS.cleric, image: 'assets/images/classes/cleric.webp',
      name: 'Clérigo', tagline: 'Lo divino hecho carne',
      desc: 'Canalizás el poder de una deidad. Curás heridas que deberían ser mortales, sostenés al grupo cuando todo se cae, y cuando hace falta pegás con el peso de algo mucho más grande que vos.',
      rol: 'Sanador y sostén del grupo',
      ataque: 'Mixto — hechizos y arma contundente',
      magia: 'Sí — divina, por sabiduría',
      alcance: 'Medio',
      armas: 'Maza, martillo de guerra, escudo',
      armadura: 'Media o pesada, según el dominio',
      dado: 'd8',
      traits: ['Devoto', 'Protector', 'Sereno', 'Firme']
    },
    {
      id: 'druid', icon: ICONS.druid, image: 'assets/images/classes/druid.webp',
      name: 'Druida', tagline: 'La voluntad cambiante de la naturaleza',
      desc: 'Hablás el idioma del mundo salvaje y él te responde. Te transformás en bestia, llamás a la tormenta, hacés crecer raíces donde había piedra. Tu poder no es tuyo: se lo pedís prestado al bosque.',
      rol: 'Versátil — control, sanación y forma salvaje',
      ataque: 'Hechizos elementales y forma salvaje',
      magia: 'Sí — natural, por sabiduría',
      alcance: 'Medio a largo',
      armas: 'Bastón, hoz, cimitarra',
      armadura: 'Ligera o media, nunca de metal',
      dado: 'd8',
      traits: ['Salvaje', 'Adaptable', 'Paciente', 'Impredecible']
    },
    {
      id: 'fighter', icon: ICONS.fighter, image: 'assets/images/classes/fighter.webp',
      name: 'Guerrero', tagline: 'Acero, disciplina, victoria',
      desc: 'No tenés magia ni pactos ni dioses: tenés oficio. Sabés más de armas y de armaduras que nadie en la mesa, atacás más veces por turno que cualquiera, y estás de pie cuando todos los demás ya no.',
      rol: 'Combatiente puro, primera o segunda línea',
      ataque: 'Cuerpo a cuerpo o a distancia — el que elijas',
      magia: 'Ninguna (salvo el arquetipo Caballero Arcano)',
      alcance: 'Corto o largo, según el estilo',
      armas: 'Todas. Espada y escudo, gran espada, arco largo',
      armadura: 'Pesada — la mejor que consigas',
      dado: 'd10',
      traits: ['Disciplinado', 'Preciso', 'Confiable', 'Incansable']
    },
    {
      id: 'monk', icon: ICONS.monk, image: 'assets/images/classes/monk.webp',
      name: 'Monje', tagline: 'El cuerpo como arma, la mente como escudo',
      desc: 'Convertiste tu cuerpo en el arma. Golpeás varias veces en el tiempo que otro tarda en levantar la espada, corrés por paredes, caés sin romperte y desviás flechas con la mano abierta.',
      rol: 'Escaramuzador veloz',
      ataque: 'Ráfagas de golpes desarmados',
      magia: 'No — ki, energía interior',
      alcance: 'Corto, con movilidad enorme',
      armas: 'Manos, bastón, dardos, nunchakus',
      armadura: 'Ninguna — la esquiva es la armadura',
      dado: 'd8',
      traits: ['Ágil', 'Concentrado', 'Veloz', 'Autosuficiente']
    },
    {
      id: 'paladin', icon: ICONS.paladin, image: 'assets/images/classes/paladin.webp',
      name: 'Paladín', tagline: 'Un juramento inquebrantable',
      desc: 'Hiciste un juramento y ese juramento te da poder. Pegás con castigo divino, curás con las manos, y tu sola presencia hace que a los que están cerca les cueste menos ser valientes.',
      rol: 'Tanque con daño explosivo y aura de apoyo',
      ataque: 'Cuerpo a cuerpo con castigo divino',
      magia: 'Sí — divina, por carisma',
      alcance: 'Corto',
      armas: 'Espada larga, martillo, escudo',
      armadura: 'Pesada',
      dado: 'd10',
      traits: ['Justo', 'Valiente', 'Leal', 'Imponente']
    },
    {
      id: 'ranger', icon: ICONS.ranger, image: 'assets/images/classes/ranger.webp',
      name: 'Explorador', tagline: 'El guardián silencioso de lo salvaje',
      desc: 'Conocés el terreno mejor que quien vive en él. Rastreás, emboscás, disparás desde donde nadie te ve, y tenés un vínculo con lo salvaje que la gente de ciudad nunca va a entender del todo.',
      rol: 'Daño a distancia y exploración',
      ataque: 'A distancia, con arco',
      magia: 'Sí — natural, poca y práctica',
      alcance: 'Largo',
      armas: 'Arco largo, dos espadas cortas',
      armadura: 'Media',
      dado: 'd10',
      traits: ['Observador', 'Autónomo', 'Certero', 'Silencioso']
    },
    {
      id: 'rogue', icon: ICONS.rogue, image: 'assets/images/classes/rogue.webp',
      name: 'Pícaro', tagline: 'Siempre un paso adelante',
      desc: 'No ganás por fuerza: ganás porque llegaste antes y sabías algo que el otro no. Un solo golpe bien puesto hace más daño que tres mal puestos, y la mitad de los problemas los resolvés sin que nadie sepa que estuviste ahí.',
      rol: 'Daño concentrado y utilidad fuera del combate',
      ataque: 'Ataque furtivo — un golpe, mucho daño',
      magia: 'Ninguna (salvo el arquetipo Embaucador Arcano)',
      alcance: 'Corto o medio',
      armas: 'Dagas, espada corta, ballesta de mano',
      armadura: 'Ligera',
      dado: 'd8',
      traits: ['Astuto', 'Rápido', 'Oportunista', 'Escurridizo']
    },
    {
      id: 'sorcerer', icon: ICONS.sorcerer, image: 'assets/images/classes/sorcerer.webp',
      name: 'Hechicero', tagline: 'Magia en la sangre',
      desc: 'No estudiaste para esto: naciste así. La magia te sale de adentro y podés torcerla sobre la marcha — acelerarla, duplicarla, lanzarla en silencio. Menos hechizos que un mago, pero mucho más control sobre cada uno.',
      rol: 'Daño mágico y flexibilidad',
      ataque: 'Hechizos ofensivos, mucho daño de área',
      magia: 'Sí — arcana innata, por carisma',
      alcance: 'Largo',
      armas: 'Daga, bastón (casi decorativos)',
      armadura: 'Ninguna',
      dado: 'd6 — el más frágil del juego',
      traits: ['Intenso', 'Innato', 'Explosivo', 'Indomable']
    },
    {
      id: 'warlock', icon: ICONS.warlock, image: 'assets/images/classes/warlock.webp',
      name: 'Brujo', tagline: 'Poder comprado, no ganado',
      desc: 'Hiciste un pacto con algo viejo y poderoso, y ese algo te presta poder a cambio de cosas que preferís no detallar. Pocos hechizos, pero siempre cargados al máximo y recuperados con un descanso corto.',
      rol: 'Daño sostenido con magia de pacto',
      ataque: 'Descarga sobrenatural, a distancia',
      magia: 'Sí — de pacto, por carisma',
      alcance: 'Largo',
      armas: 'Daga, o la que otorgue el pacto',
      armadura: 'Ligera',
      dado: 'd8',
      traits: ['Ambicioso', 'Misterioso', 'Pragmático', 'Comprometido']
    },
    {
      id: 'wizard', icon: ICONS.wizard, image: 'assets/images/classes/wizard.webp',
      name: 'Mago', tagline: 'El conocimiento es el arma definitiva',
      desc: 'Todo lo que podés hacer lo aprendiste, lo anotaste y lo podés volver a hacer. Tenés un hechizo para cada problema y el problema es elegir cuál. Frágil como el papel, decisivo como nadie.',
      rol: 'Control del campo de batalla y daño de área',
      ataque: 'Hechizos preparados, gran variedad',
      magia: 'Sí — arcana estudiada, por inteligencia',
      alcance: 'Largo',
      armas: 'Bastón, daga (rara vez los usa)',
      armadura: 'Ninguna',
      dado: 'd6 — el más frágil del juego',
      traits: ['Metódico', 'Curioso', 'Preparado', 'Decisivo']
    }
  ];

  global.WD_CLASSES = CLASSES;
})(window);
