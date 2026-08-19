// The Wandering Die — class-finder quiz: 10 questions, points feed WD_CLASSES ids
(function (global) {
  'use strict';

  var QUIZ_QUESTIONS = [
    {
      i18n: { en: 'Your party hits a locked door. What do you do?', es: 'Tu grupo se topa con una puerta cerrada. ¿Qué hacés?', da: 'Din gruppe støder på en låst dør. Hvad gør du?' },
      options: [
        { classes: ['barbarian', 'fighter'], i18n: { en: 'Break it down with brute strength', es: 'La derribo a la fuerza', da: 'Slår den ned med ren styrke' } },
        { classes: ['rogue'], i18n: { en: 'Pick the lock without a sound', es: 'Fuerzo la cerradura sin hacer ruido', da: 'Dirker låsen op uden en lyd' } },
        { classes: ['bard'], i18n: { en: 'Talk my way past whoever guards it', es: 'Convenzo a quien la esté custodiando', da: 'Snakker mig forbi den, der vogter den' } },
        { classes: ['wizard', 'sorcerer'], i18n: { en: 'Unlock it with a spell', es: 'La abro con un hechizo', da: 'Åbner den med en besværgelse' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'Find another way in through nature', es: 'Busco otra entrada por la naturaleza', da: 'Finder en anden vej ind gennem naturen' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'Ask for guidance and trust the answer', es: 'Pido guía y confío en la respuesta', da: 'Beder om vejledning og stoler på svaret' } }
      ]
    },
    {
      i18n: { en: 'Pick your role once combat breaks out.', es: 'Elegí tu rol cuando estalla el combate.', da: 'Vælg din rolle, når kampen bryder ud.' },
      options: [
        { classes: ['fighter', 'paladin', 'barbarian'], i18n: { en: 'Front line, taking every hit', es: 'Primera línea, aguantando todos los golpes', da: 'Forreste linje, tager alle slagene' } },
        { classes: ['ranger', 'sorcerer', 'wizard'], i18n: { en: 'Ranged damage from a safe distance', es: 'Daño a distancia, desde lejos y a salvo', da: 'Skade på afstand, sikkert fra bagved' } },
        { classes: ['rogue', 'monk'], i18n: { en: 'Slip in close for a decisive strike', es: 'Me acerco sigilosamente para un golpe decisivo', da: 'Snig mig ind til et afgørende slag' } },
        { classes: ['cleric', 'bard'], i18n: { en: 'Keep everyone else alive', es: 'Mantengo con vida a todos los demás', da: 'Holder alle andre i live' } },
        { classes: ['wizard', 'druid', 'warlock'], i18n: { en: 'Control the field with spells and summons', es: 'Controlo el campo con hechizos e invocaciones', da: 'Kontrollerer slagmarken med besværgelser og påkaldelser' } }
      ]
    },
    {
      i18n: { en: 'Where do you feel most at home?', es: '¿Dónde te sentís más en tu ambiente?', da: 'Hvor føler du dig mest hjemme?' },
      options: [
        { classes: ['fighter', 'barbarian'], i18n: { en: 'A war camp before the dawn', es: 'Un campamento de guerra antes del amanecer', da: 'En krigslejr før daggry' } },
        { classes: ['wizard'], i18n: { en: 'An ancient, dust-filled library', es: 'Una biblioteca antigua llena de polvo', da: 'Et gammelt, støvfyldt bibliotek' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'A quiet temple at dusk', es: 'Un templo silencioso al atardecer', da: 'Et stille tempel ved solnedgang' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'Deep in an untouched forest', es: 'En lo profundo de un bosque virgen', da: 'Dybt i en urørt skov' } },
        { classes: ['bard', 'rogue'], i18n: { en: 'A crowded tavern in the city streets', es: 'Una taberna abarrotada en las calles de la ciudad', da: 'En overfyldt kro i byens gader' } },
        { classes: ['warlock'], i18n: { en: 'Somewhere the shadows feel like company', es: 'En algún lugar donde las sombras hacen compañía', da: 'Et sted hvor skyggerne føles som selskab' } },
        { classes: ['monk'], i18n: { en: 'A silent monastery on a mountain', es: 'Un monasterio silencioso en la montaña', da: 'Et stille kloster på et bjerg' } }
      ]
    },
    {
      i18n: { en: "What's the story that drives you forward?", es: '¿Qué historia te impulsa a seguir adelante?', da: 'Hvilken historie driver dig fremad?' },
      options: [
        { classes: ['paladin', 'cleric', 'fighter'], i18n: { en: 'I protect the people who can\'t protect themselves', es: 'Protejo a quienes no pueden protegerse solos', da: 'Jeg beskytter dem, der ikke kan beskytte sig selv' } },
        { classes: ['barbarian', 'ranger', 'sorcerer'], i18n: { en: 'I answer to no one but myself', es: 'No le respondo a nadie más que a mí mismo/a', da: 'Jeg svarer kun til mig selv' } },
        { classes: ['wizard', 'monk'], i18n: { en: 'I chase mastery, one truth at a time', es: 'Persigo la maestría, una verdad a la vez', da: 'Jeg jagter mesterskab, én sandhed ad gangen' } },
        { classes: ['bard', 'rogue'], i18n: { en: 'I want a story worth telling', es: 'Quiero una historia que valga la pena contar', da: 'Jeg vil have en historie, det er værd at fortælle' } },
        { classes: ['warlock', 'sorcerer'], i18n: { en: 'Power, whatever it costs me', es: 'Poder, cueste lo que cueste', da: 'Magt, uanset hvad det koster mig' } },
        { classes: ['druid'], i18n: { en: 'Balance, even if the world resists it', es: 'Equilibrio, aunque el mundo se resista', da: 'Balance, selv hvis verden gør modstand' } }
      ]
    },
    {
      i18n: { en: 'Choose the weapon that feels like an extension of you.', es: 'Elegí el arma que sentís como una extensión tuya.', da: 'Vælg det våben, der føles som en forlængelse af dig.' },
      options: [
        { classes: ['barbarian', 'fighter'], i18n: { en: 'A heavy greatsword or axe', es: 'Una espadona o hacha pesada', da: 'Et tungt sværd eller en økse' } },
        { classes: ['ranger'], i18n: { en: 'A longbow', es: 'Un arco largo', da: 'En langbue' } },
        { classes: ['rogue', 'monk'], i18n: { en: 'A pair of daggers, or just my fists', es: 'Un par de dagas, o directamente mis puños', da: 'Et par dolke, eller bare mine næver' } },
        { classes: ['wizard', 'sorcerer'], i18n: { en: 'A staff or wand humming with power', es: 'Un bastón o vara que zumba con poder', da: 'En stav eller tryllestav, der summer af kraft' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'A holy symbol and a sturdy mace', es: 'Un símbolo sagrado y una maza resistente', da: 'Et helligt symbol og en solid stridskølle' } },
        { classes: ['bard'], i18n: { en: 'An instrument that doubles as a weapon of the mind', es: 'Un instrumento que también es un arma de la mente', da: 'Et instrument der også er et sindets våben' } },
        { classes: ['warlock'], i18n: { en: 'A pact weapon I barely understand', es: 'Un arma de pacto que apenas comprendo', da: 'Et pagtvåben jeg knap forstår' } }
      ]
    },
    {
      i18n: { en: 'How does magic move through you, if at all?', es: '¿Cómo fluye la magia en vos, si es que lo hace?', da: 'Hvordan bevæger magi sig igennem dig, hvis overhovedet?' },
      options: [
        { classes: ['fighter', 'barbarian', 'rogue', 'ranger'], i18n: { en: "It doesn't — my skill is physical, earned through practice", es: 'No fluye: mi habilidad es física, ganada con práctica', da: 'Det gør den ikke — mine evner er fysiske, øvet ind' } },
        { classes: ['sorcerer'], i18n: { en: "It's innate, part of my blood", es: 'Es innata, parte de mi sangre', da: 'Den er medfødt, en del af mit blod' } },
        { classes: ['wizard'], i18n: { en: "I studied it for years, formula by formula", es: 'La estudié durante años, fórmula por fórmula', da: 'Jeg studerede den i årevis, formel for formel' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'A god grants it to me', es: 'Un dios me la concede', da: 'En gud skænker mig den' } },
        { classes: ['warlock'], i18n: { en: 'I bargained for it with something greater than me', es: 'La negocié con algo más grande que yo', da: 'Jeg forhandlede mig til den med noget større end mig' } },
        { classes: ['druid'], i18n: { en: 'I draw it straight from nature itself', es: 'La saco directamente de la naturaleza misma', da: 'Jeg trækker den direkte fra selve naturen' } },
        { classes: ['bard'], i18n: { en: "It rides on my words and music", es: 'Viaja en mis palabras y en mi música', da: 'Den rejser på mine ord og min musik' } },
        { classes: ['monk'], i18n: { en: "It's inner discipline, no spells needed", es: 'Es disciplina interior, sin necesidad de hechizos', da: 'Det er indre disciplin, ingen besværgelser nødvendige' } }
      ]
    },
    {
      i18n: { en: 'A tense negotiation is underway. What do you do?', es: 'Hay una negociación tensa en curso. ¿Qué hacés?', da: 'En anspændt forhandling er i gang. Hvad gør du?' },
      options: [
        { classes: ['bard'], i18n: { en: 'Charm the room until they forget to say no', es: 'Encanto la sala hasta que se olvidan de decir que no', da: 'Charmerer lokalet, til de glemmer at sige nej' } },
        { classes: ['barbarian', 'fighter'], i18n: { en: 'Make it clear what happens if talks fail', es: 'Dejo claro qué pasa si la negociación fracasa', da: 'Gør det klart, hvad der sker, hvis forhandlingen fejler' } },
        { classes: ['rogue'], i18n: { en: 'Quietly read the room for the real leverage', es: 'Leo la sala en silencio para hallar la verdadera ventaja', da: 'Aflæser stille lokalet for den reelle gevinst' } },
        { classes: ['cleric', 'druid', 'wizard'], i18n: { en: 'Offer calm, well-reasoned counsel', es: 'Ofrezco un consejo calmo y bien razonado', da: 'Tilbyder rolig, velovervejet rådgivning' } },
        { classes: ['ranger', 'monk'], i18n: { en: 'Stay quiet and let my presence speak', es: 'Me quedo en silencio y dejo que mi presencia hable', da: 'Forbliver tavs og lader min tilstedeværelse tale' } },
        { classes: ['paladin'], i18n: { en: 'State exactly what I believe, plainly and without flinching', es: 'Digo exactamente lo que creo, claro y sin titubear', da: 'Siger præcis hvad jeg tror på, ligeud og uden at vige' } },
        { classes: ['warlock', 'sorcerer'], i18n: { en: 'Steer it subtly toward the outcome I already decided', es: 'La dirijo con sutileza hacia el resultado que ya decidí', da: 'Styrer det diskret mod det udfald, jeg allerede har besluttet' } }
      ]
    },
    {
      i18n: { en: 'Which principle guides you when the rules get grey?', es: '¿Qué principio te guía cuando las reglas se ponen grises?', da: 'Hvilket princip guider dig, når reglerne bliver grå?' },
      options: [
        { classes: ['paladin', 'monk'], i18n: { en: 'Honor and order, no matter the cost', es: 'Honor y orden, cueste lo que cueste', da: 'Ære og orden, uanset prisen' } },
        { classes: ['barbarian', 'sorcerer', 'ranger'], i18n: { en: 'Freedom above every rule', es: 'La libertad por encima de cualquier regla', da: 'Frihed over enhver regel' } },
        { classes: ['rogue', 'warlock'], i18n: { en: 'Whatever actually gets the job done', es: 'Lo que realmente resuelva el problema', da: 'Hvad der faktisk får jobbet gjort' } },
        { classes: ['druid'], i18n: { en: 'Balance — nothing tips too far either way', es: 'Equilibrio: que nada se incline demasiado hacia ningún lado', da: 'Balance — intet vipper for langt til nogen side' } },
        { classes: ['cleric', 'bard'], i18n: { en: 'Compassion for whoever is in front of me', es: 'Compasión por quien tenga enfrente', da: 'Medfølelse for den, der står foran mig' } },
        { classes: ['wizard', 'fighter'], i18n: { en: 'Calculated pragmatism — plan, then act', es: 'Pragmatismo calculado: primero planeo, después actúo', da: 'Kalkuleret pragmatisme — planlæg, så handl' } }
      ]
    },
    {
      i18n: { en: 'Pick the companion you\'d trust at your side.', es: 'Elegí al compañero en quien confiarías a tu lado.', da: 'Vælg den ledsager, du ville stole på ved din side.' },
      options: [
        { classes: ['paladin', 'fighter'], i18n: { en: 'A loyal warhorse, trained for battle', es: 'Un caballo de guerra leal, entrenado para el combate', da: 'En loyal krigshest, trænet til kamp' } },
        { classes: ['ranger', 'druid'], i18n: { en: 'A wild animal companion who trusts no one else', es: 'Un animal salvaje que no confía en nadie más', da: 'En vild dyreledsager, der ikke stoler på andre' } },
        { classes: ['rogue', 'warlock', 'monk'], i18n: { en: 'No one — I work best alone', es: 'Nadie: trabajo mejor solo/a', da: 'Ingen — jeg arbejder bedst alene' } },
        { classes: ['bard', 'cleric'], i18n: { en: 'The found family my party has become', es: 'La familia elegida en la que se convirtió mi grupo', da: 'Den fundne familie, min gruppe er blevet' } },
        { classes: ['sorcerer', 'wizard'], i18n: { en: 'A small familiar spirit that whispers secrets', es: 'Un pequeño espíritu familiar que susurra secretos', da: 'En lille åndsfamiliar, der hvisker hemmeligheder' } }
      ]
    },
    {
      i18n: { en: 'What legacy do you want people to remember?', es: '¿Qué legado querés que la gente recuerde?', da: 'Hvilken arv vil du have, folk husker?' },
      options: [
        { classes: ['bard', 'rogue'], i18n: { en: 'A story so good it gets told for generations', es: 'Una historia tan buena que se cuenta por generaciones', da: 'En historie så god, den bliver fortalt i generationer' } },
        { classes: ['paladin', 'fighter'], i18n: { en: 'A kingdom that stayed standing because of me', es: 'Un reino que siguió en pie gracias a mí', da: 'Et kongerige der forblev stående på grund af mig' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'A wilderness that was left untouched', es: 'Una naturaleza que quedó intacta', da: 'En vildmark der forblev urørt' } },
        { classes: ['wizard', 'warlock'], i18n: { en: 'Forbidden knowledge finally unlocked', es: 'Un conocimiento prohibido finalmente desbloqueado', da: 'Forbudt viden endelig låst op' } },
        { classes: ['barbarian', 'sorcerer'], i18n: { en: 'Raw power that people still fear', es: 'Un poder crudo que la gente todavía teme', da: 'Rå kraft som folk stadig frygter' } },
        { classes: ['monk', 'cleric'], i18n: { en: 'A peace I found and helped others find too', es: 'Una paz que encontré y ayudé a otros a encontrar también', da: 'En fred jeg fandt og hjalp andre med at finde' } }
      ]
    }
  ];

  global.WD_QUIZ = QUIZ_QUESTIONS;
})(window);
