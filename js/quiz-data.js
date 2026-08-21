// The Wandering Die — class-finder quiz: 10 questions, points feed WD_CLASSES ids
(function (global) {
  'use strict';

  var QUIZ_QUESTIONS = [
    {
      i18n: { en: "Something important in your life just got complicated. What's your first move?", es: 'Se te complica algo importante en tu vida. ¿Cuál es tu primer movimiento?', da: 'Noget vigtigt i dit liv er lige blevet kompliceret. Hvad er dit første træk?' },
      options: [
        { classes: ['barbarian', 'fighter'], i18n: { en: 'Push through it head-on, no matter how hard it gets', es: 'Lo encaro de frente, por más difícil que se ponga', da: 'Går lige på og hårdt, uanset hvor svært det bliver' } },
        { classes: ['rogue'], i18n: { en: 'Find a quiet, clever workaround nobody else thought of', es: 'Busco una solución astuta que nadie más pensó', da: 'Finder en snedig genvej, ingen andre tænkte på' } },
        { classes: ['bard'], i18n: { en: 'Talk to the right person and get them on my side', es: 'Hablo con la persona indicada y la sumo a mi lado', da: 'Snakker med den rette person og får dem med mig' } },
        { classes: ['wizard', 'sorcerer'], i18n: { en: 'Research it properly until I find the smart fix', es: 'Lo investigo a fondo hasta encontrar la solución inteligente', da: 'Undersøger det grundigt, til jeg finder den smarte løsning' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'Step away, get some air, and let a different path appear', es: 'Me alejo, tomo aire y dejo que aparezca otro camino', da: 'Tager en pause, trækker vejret, og lader en anden vej dukke op' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'Ask someone I trust for advice and follow it', es: 'Le pido consejo a alguien de confianza y lo sigo', da: 'Beder en, jeg stoler på, om råd og følger det' } }
      ]
    },
    {
      i18n: { en: 'In your friend group, what role do you naturally end up playing?', es: 'En tu grupo de amigos, ¿qué rol terminás cumpliendo naturalmente?', da: 'I din vennegruppe, hvilken rolle ender du naturligt med at spille?' },
      options: [
        { classes: ['fighter', 'paladin', 'barbarian'], i18n: { en: "The one who steps up first when there's a problem", es: 'El/la que se pone al frente apenas hay un problema', da: 'Den, der træder til først, når der er et problem' } },
        { classes: ['ranger', 'sorcerer', 'wizard'], i18n: { en: 'The one who watches from a bit of a distance and gives sharp opinions', es: 'El/la que observa un poco desde afuera y opina con precisión', da: 'Den, der iagttager lidt på afstand og kommer med skarpe meninger' } },
        { classes: ['rogue', 'monk'], i18n: { en: 'The one who fixes it fast, quietly, and moves on', es: 'El/la que lo soluciona rápido, en silencio, y sigue de largo', da: 'Den, der ordner det hurtigt og stille og går videre' } },
        { classes: ['cleric', 'bard'], i18n: { en: "The one making sure everyone's actually having a good time", es: 'El/la que se asegura de que todos la estén pasando bien de verdad', da: 'Den, der sørger for, at alle rent faktisk har det sjovt' } },
        { classes: ['wizard', 'druid', 'warlock'], i18n: { en: 'The one quietly organizing the plan behind the scenes', es: 'El/la que organiza el plan en silencio, detrás de escena', da: 'Den, der stille organiserer planen bag kulisserne' } }
      ]
    },
    {
      i18n: { en: 'Where do you feel most like yourself?', es: '¿Dónde te sentís más vos mismo/a?', da: 'Hvor føler du dig mest som dig selv?' },
      options: [
        { classes: ['fighter', 'barbarian'], i18n: { en: 'At the gym or training, early, before anyone else shows up', es: 'En el gimnasio o entrenando, temprano, antes de que llegue nadie', da: 'I fitnesscentret eller til træning, tidligt, før andre dukker op' } },
        { classes: ['wizard'], i18n: { en: 'Surrounded by books, notes, and something to figure out', es: 'Rodeado/a de libros, apuntes y algo para descifrar', da: 'Omgivet af bøger, noter og noget at finde ud af' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'Somewhere quiet where I can just breathe and think', es: 'En algún lugar tranquilo donde pueda respirar y pensar', da: 'Et stille sted, hvor jeg bare kan trække vejret og tænke' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'Outdoors, away from screens and noise', es: 'Al aire libre, lejos de las pantallas y el ruido', da: 'Udendørs, væk fra skærme og støj' } },
        { classes: ['bard', 'rogue'], i18n: { en: 'A bar full of people, music, and conversation', es: 'Un bar lleno de gente, música y charla', da: 'En bar fuld af mennesker, musik og snak' } },
        { classes: ['warlock'], i18n: { en: 'Alone at night with my own thoughts', es: 'Solo/a de noche, con mis propios pensamientos', da: 'Alene om natten med mine egne tanker' } },
        { classes: ['monk'], i18n: { en: 'In the middle of a routine — running, training, anything repetitive', es: 'En medio de una rutina: corriendo, entrenando, algo repetitivo', da: 'Midt i en rutine — løb, træning, noget gentagende' } }
      ]
    },
    {
      i18n: { en: 'What actually gets you out of bed every day?', es: '¿Qué es lo que realmente te hace levantarte todos los días?', da: 'Hvad får dig egentlig op af sengen hver dag?' },
      options: [
        { classes: ['paladin', 'cleric', 'fighter'], i18n: { en: 'Taking care of the people I love', es: 'Cuidar a la gente que quiero', da: 'At tage mig af dem, jeg elsker' } },
        { classes: ['barbarian', 'ranger', 'sorcerer'], i18n: { en: 'Not answering to anyone but myself', es: 'No responderle a nadie más que a mí mismo/a', da: 'Ikke at skulle stå til regnskab for andre end mig selv' } },
        { classes: ['wizard', 'monk'], i18n: { en: 'Getting a little better or a little smarter than yesterday', es: 'Ser un poco mejor o un poco más sabio/a que ayer', da: 'At blive lidt bedre eller klogere end i går' } },
        { classes: ['bard', 'rogue'], i18n: { en: 'Living stuff worth telling people about later', es: 'Vivir cosas que después valga la pena contar', da: 'At opleve ting, det er værd at fortælle om bagefter' } },
        { classes: ['warlock', 'sorcerer'], i18n: { en: 'Getting where I want to go, whatever it takes', es: 'Llegar a donde quiero llegar, cueste lo que cueste', da: 'At nå derhen, jeg vil hen, uanset hvad det kræver' } },
        { classes: ['druid'], i18n: { en: 'Keeping some kind of balance in a chaotic life', es: 'Mantener algo de equilibrio en una vida caótica', da: 'At holde en form for balance i et kaotisk liv' } }
      ]
    },
    {
      i18n: { en: "You're starving and can order literally anything. What are you getting?", es: 'Tenés un hambre feroz y podés pedir lo que quieras. ¿Qué pedís?', da: 'Du er skrupsulten og kan bestille hvad som helst. Hvad bestiller du?' },
      options: [
        { classes: ['barbarian', 'fighter'], i18n: { en: 'A massive, heavy plate — the biggest thing on the menu', es: 'Un plato enorme y contundente, lo más grande del menú', da: 'En kæmpe, tung tallerken — den største ting på menuen' } },
        { classes: ['ranger'], i18n: { en: 'Something simple and practical I can eat on the go', es: 'Algo simple y práctico que pueda comer mientras camino', da: 'Noget simpelt og praktisk, jeg kan spise på farten' } },
        { classes: ['rogue', 'monk'], i18n: { en: 'Good street food, fast and no fuss', es: 'Buena comida callejera, rápida y sin vueltas', da: 'Godt gadekøkken, hurtigt og uden ceremoni' } },
        { classes: ['wizard', 'sorcerer'], i18n: { en: "Something elaborate I've never tried before", es: 'Algo elaborado que nunca probé antes', da: 'Noget indviklet, jeg aldrig har prøvet før' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'Homemade food, like the kind my family makes', es: 'Comida casera, como la que hace mi familia', da: 'Hjemmelavet mad, ligesom den min familie laver' } },
        { classes: ['bard'], i18n: { en: 'A big spread to share at a long table with friends', es: 'Una mesa larga llena de platos para compartir con amigos', da: 'Et stort bord fyldt med retter at dele med venner' } },
        { classes: ['warlock'], i18n: { en: 'Some weird combination nobody else would order', es: 'Una combinación rara que nadie más pediría', da: 'En mærkelig kombination, ingen andre ville bestille' } }
      ]
    },
    {
      i18n: { en: "Where do you think your biggest strength actually comes from?", es: '¿De dónde creés que viene tu mayor fortaleza?', da: 'Hvor tror du, din største styrke egentlig kommer fra?' },
      options: [
        { classes: ['fighter', 'barbarian', 'rogue', 'ranger'], i18n: { en: 'Practice — I earned it the hard way, over and over', es: 'De la práctica: la gané a fuerza de repetirlo una y otra vez', da: 'Øvelse — jeg har tjent den på den hårde måde, igen og igen' } },
        { classes: ['sorcerer'], i18n: { en: "It's just always been part of who I am", es: 'Siempre fue parte de quién soy', da: 'Det har bare altid været en del af, hvem jeg er' } },
        { classes: ['wizard'], i18n: { en: 'Studying it obsessively until I understood it cold', es: 'Estudiarlo obsesivamente hasta entenderlo a la perfección', da: 'At studere det besat, til jeg forstod det til bunds' } },
        { classes: ['cleric', 'paladin'], i18n: { en: 'My values — something I believe in more than myself', es: 'Mis valores: algo en lo que creo más que en mí mismo/a', da: 'Mine værdier — noget jeg tror på mere end mig selv' } },
        { classes: ['warlock'], i18n: { en: 'A hard experience that completely changed me', es: 'Una experiencia dura que me cambió por completo', da: 'En hård oplevelse, der forandrede mig fuldstændig' } },
        { classes: ['druid'], i18n: { en: 'Staying connected to nature and slowing down', es: 'Mantenerme conectado/a con la naturaleza y bajar un cambio', da: 'At holde forbindelsen til naturen og sænke tempoet' } },
        { classes: ['bard'], i18n: { en: 'How I express myself, in words or in art', es: 'Cómo me expreso, con palabras o con arte', da: 'Måden jeg udtrykker mig på, i ord eller kunst' } },
        { classes: ['monk'], i18n: { en: 'Discipline — showing up for myself every single day', es: 'La disciplina: aparecer para mí mismo/a todos los días', da: 'Disciplin — at møde op for mig selv hver eneste dag' } }
      ]
    },
    {
      i18n: { en: "There's a tense argument going on in your friend group. What do you do?", es: 'Hay una discusión tensa en tu grupo de amigos. ¿Qué hacés?', da: 'Der er en anspændt diskussion i din vennegruppe. Hvad gør du?' },
      options: [
        { classes: ['bard'], i18n: { en: 'Crack a joke and lighten the mood until it cools down', es: 'Tiro un chiste y aliviano el ambiente hasta que se calma', da: 'Kommer med en joke og letter stemningen, til det falder til ro' } },
        { classes: ['barbarian', 'fighter'], i18n: { en: 'Say bluntly what everyone else is avoiding saying', es: 'Digo directamente lo que todos evitan decir', da: 'Siger direkte det, alle andre undgår at sige' } },
        { classes: ['rogue'], i18n: { en: 'Stay quiet and quietly figure out who actually has a point', es: 'Me quedo callado/a y descifro en silencio quién tiene razón', da: 'Holder mund og finder stille ud af, hvem der egentlig har ret' } },
        { classes: ['cleric', 'druid', 'wizard'], i18n: { en: 'Offer a calm, reasoned take once things settle a bit', es: 'Doy una opinión calma y razonada cuando las cosas se calman un poco', da: 'Kommer med en rolig, velovervejet holdning, når det falder lidt til ro' } },
        { classes: ['ranger', 'monk'], i18n: { en: 'Stay out of it — my not picking sides says enough', es: 'Me mantengo al margen: no tomar partido ya dice bastante', da: 'Holder mig ude af det — at jeg ikke tager parti siger nok' } },
        { classes: ['paladin'], i18n: { en: 'Say exactly what I think, plainly, even if it stings', es: 'Digo exactamente lo que pienso, claro y sin filtro, aunque duela', da: 'Siger præcis hvad jeg mener, ligeud, selv hvis det gør ondt' } },
        { classes: ['warlock', 'sorcerer'], i18n: { en: 'Steer the conversation gently toward the outcome I want', es: 'Guío la conversación con sutileza hacia lo que quiero', da: 'Styrer samtalen forsigtigt mod det udfald, jeg vil have' } }
      ]
    },
    {
      i18n: { en: "What guides you when it's genuinely unclear what the right call is?", es: '¿Qué te guía cuando no está claro cuál es la decisión correcta?', da: 'Hvad guider dig, når det er reelt uklart, hvad det rigtige valg er?' },
      options: [
        { classes: ['paladin', 'monk'], i18n: { en: 'Doing things properly, no matter the cost', es: 'Hacer las cosas bien, cueste lo que cueste', da: 'At gøre tingene ordentligt, uanset prisen' } },
        { classes: ['barbarian', 'sorcerer', 'ranger'], i18n: { en: 'My own freedom to choose, over anyone else\'s rules', es: 'Mi libertad de elegir, por encima de las reglas de cualquiera', da: 'Min egen frihed til at vælge, over andres regler' } },
        { classes: ['rogue', 'warlock'], i18n: { en: 'Whatever actually works, even if it bends the rules a bit', es: 'Lo que realmente funcione, aunque estire un poco las reglas', da: 'Hvad der faktisk virker, selv hvis det bøjer reglerne lidt' } },
        { classes: ['druid'], i18n: { en: 'Balance — not letting anything tip too far in one direction', es: 'El equilibrio: que nada se incline demasiado hacia un lado', da: 'Balance — intet må vippe for langt til den ene side' } },
        { classes: ['cleric', 'bard'], i18n: { en: 'Empathy for whoever is affected by the decision', es: 'La empatía por quien se ve afectado/a por la decisión', da: 'Empati for den, der bliver berørt af beslutningen' } },
        { classes: ['wizard', 'fighter'], i18n: { en: 'Thinking it through carefully before doing anything', es: 'Pensarlo bien antes de hacer cualquier cosa', da: 'At tænke det grundigt igennem, før jeg gør noget' } }
      ]
    },
    {
      i18n: { en: 'Who or what do you turn to when you actually need support?', es: '¿A quién o a qué recurrís cuando de verdad necesitás apoyo?', da: 'Hvem eller hvad søger du hen til, når du virkelig har brug for støtte?' },
      options: [
        { classes: ['paladin', 'fighter'], i18n: { en: "That one friend I've trusted for years and never doubted", es: 'Ese amigo o amiga de años en quien confío ciegamente', da: 'Den ven, jeg har stolet på i årevis og aldrig tvivlet på' } },
        { classes: ['ranger', 'druid'], i18n: { en: 'My pet, or just time alone outdoors', es: 'Mi mascota, o simplemente tiempo a solas al aire libre', da: 'Mit kæledyr, eller bare tid alene udendørs' } },
        { classes: ['rogue', 'warlock', 'monk'], i18n: { en: "No one — I'd rather work through it on my own", es: 'A nadie: prefiero resolverlo por mi cuenta', da: 'Ingen — jeg vil hellere arbejde mig igennem det alene' } },
        { classes: ['bard', 'cleric'], i18n: { en: 'My friend group — they\'re basically my second family', es: 'Mi grupo de amigos: son básicamente mi segunda familia', da: 'Min vennegruppe — de er praktisk talt min anden familie' } },
        { classes: ['sorcerer', 'wizard'], i18n: { en: 'Researching it myself until it makes sense', es: 'Investigarlo yo mismo/a hasta que tenga sentido', da: 'At undersøge det selv, til det giver mening' } }
      ]
    },
    {
      i18n: { en: 'What do you want people to remember about you?', es: '¿Qué querés que la gente recuerde de vos?', da: 'Hvad vil du have, folk husker om dig?' },
      options: [
        { classes: ['bard', 'rogue'], i18n: { en: 'The stories and moments that are still fun to tell later', es: 'Las anécdotas y momentos que siguen siendo divertidos de contar', da: 'De historier og øjeblikke, der stadig er sjove at fortælle bagefter' } },
        { classes: ['paladin', 'fighter'], i18n: { en: 'That I was someone people could actually count on', es: 'Que fui alguien con quien la gente realmente podía contar', da: 'At jeg var en, folk faktisk kunne regne med' } },
        { classes: ['druid', 'ranger'], i18n: { en: 'That I took care of the people and places around me', es: 'Que cuidé a la gente y los lugares que me rodeaban', da: 'At jeg passede på de mennesker og steder, der omgav mig' } },
        { classes: ['wizard', 'warlock'], i18n: { en: 'That I figured out something nobody else had', es: 'Que descubrí algo que nadie más había descubierto', da: 'At jeg fandt ud af noget, ingen andre havde' } },
        { classes: ['barbarian', 'sorcerer'], i18n: { en: "That I left a mark — people didn't forget me", es: 'Que dejé una marca: la gente no se olvidó de mí', da: 'At jeg satte mit præg — folk glemte mig ikke' } },
        { classes: ['monk', 'cleric'], i18n: { en: 'That I found some peace, and helped others find theirs too', es: 'Que encontré algo de paz, y ayudé a otros a encontrar la suya', da: 'At jeg fandt en form for fred og hjalp andre med at finde deres' } }
      ]
    }
  ];

  global.WD_QUIZ = QUIZ_QUESTIONS;
})(window);
