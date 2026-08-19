// The Wandering Die — Destiny Dice: preset decision bank, organized by category
(function (global) {
  'use strict';

  var CATEGORIES = [
    { id: 'social', i18n: { en: 'Social', es: 'Social', da: 'Socialt' } },
    { id: 'leisure', i18n: { en: 'Leisure', es: 'Ocio', da: 'Fritid' } },
    { id: 'food', i18n: { en: 'Food', es: 'Comida', da: 'Mad' } },
    { id: 'risk', i18n: { en: 'Adventure', es: 'Aventura', da: 'Eventyr' } },
    { id: 'work', i18n: { en: 'Work', es: 'Trabajo', da: 'Arbejde' } },
    { id: 'wellbeing', i18n: { en: 'Wellbeing', es: 'Bienestar', da: 'Trivsel' } }
  ];

  var SCENARIOS = [
    // Social
    { category: 'social', dc: 10, i18n: {
      en: { label: "Not sure whether to go out tonight?", low: 'Stay home and watch a movie', high: 'Go out and grab a drink with friends' },
      es: { label: '¿No sabés si salir esta noche?', low: 'Quedate en casa mirando una película', high: 'Salí a tomar algo con amigos' },
      da: { label: 'Ved du ikke, om du skal ud i aften?', low: 'Bliv hjemme og se en film', high: 'Gå ud og få en drink med venner' } } },
    { category: 'social', dc: 13, i18n: {
      en: { label: "Invited to a party where you know no one?", low: 'Send a polite excuse and stay in', high: 'Go anyway and introduce yourself' },
      es: { label: '¿Te invitaron a una fiesta donde no conocés a nadie?', low: 'Mandá una excusa amable y quedate tranquilo', high: 'Andá igual y presentate' },
      da: { label: 'Inviteret til en fest, hvor du ikke kender nogen?', low: 'Send en høflig undskyldning og bliv hjemme', high: 'Tag alligevel af sted og præsentér dig selv' } } },
    { category: 'social', dc: 12, i18n: {
      en: { label: 'Need to break the ice with someone new?', low: 'Ask a genuine question about their day', high: 'Crack a terrible joke and see what happens' },
      es: { label: '¿Tenés que romper el hielo con alguien nuevo?', low: 'Preguntale algo genuino sobre su día', high: 'Tirale un chiste malísimo y ver qué pasa' },
      da: { label: 'Skal du bryde isen med en ny person?', low: 'Spørg ægte ind til deres dag', high: 'Fyr en forfærdelig vittighed af og se, hvad der sker' } } },
    { category: 'social', dc: 14, i18n: {
      en: { label: "Can't decide whether to send that message?", low: 'Wait until tomorrow to send it', high: 'Send it right now, no overthinking' },
      es: { label: '¿No sabés si mandar ese mensaje?', low: 'Esperá hasta mañana para mandarlo', high: 'Mandalo ya mismo, sin darle más vueltas' },
      da: { label: 'Kan du ikke beslutte, om du skal sende den besked?', low: 'Vent til i morgen med at sende den', high: 'Send den lige nu, uden at tænke mere over det' } } },
    // Leisure
    { category: 'leisure', dc: 10, i18n: {
      en: { label: "Don't know what to watch tonight?", low: 'Something that makes you think — a documentary or drama', high: 'A light, easy comedy' },
      es: { label: '¿No sabés qué ver esta noche?', low: 'Algo que te haga pensar, un documental o drama', high: 'Una comedia liviana y fácil' },
      da: { label: 'Ved ikke, hvad du skal se i aften?', low: 'Noget der får dig til at tænke — en dokumentar eller drama', high: 'En let, nem komedie' } } },
    { category: 'leisure', dc: 11, i18n: {
      en: { label: 'A free afternoon and no plans?', low: 'Stay in and read', high: 'Go for a walk with no destination' },
      es: { label: '¿Tenés una tarde libre sin planes?', low: 'Quedate leyendo en casa', high: 'Salí a caminar sin rumbo' },
      da: { label: 'En fri eftermiddag uden planer?', low: 'Bliv hjemme og læs', high: 'Gå en tur uden mål' } } },
    { category: 'leisure', dc: 9, i18n: {
      en: { label: "Torn about starting that new show?", low: 'Save it for the weekend', high: 'Start it tonight' },
      es: { label: '¿Dudás si arrancar esa serie nueva?', low: 'Dejala para el finde', high: 'Arrancala esta noche' },
      da: { label: 'I tvivl om at starte den nye serie?', low: 'Gem den til weekenden', high: 'Start den i aften' } } },
    { category: 'leisure', dc: 12, i18n: {
      en: { label: 'Weekend indecision?', low: 'Stay home and recharge, no plans', high: 'Plan a short getaway' },
      es: { label: '¿Indecisión de fin de semana?', low: 'Quedate en casa recargando pilas, sin planes', high: 'Planeá una escapada corta' },
      da: { label: 'Weekend-usikkerhed?', low: 'Bliv hjemme og oplad, ingen planer', high: 'Planlæg en kort udflugt' } } },
    // Food
    { category: 'food', dc: 10, i18n: {
      en: { label: "Can't decide what to eat today?", low: 'Cook something with what you already have', high: 'Order in' },
      es: { label: '¿No sabés qué comer hoy?', low: 'Cociná algo con lo que ya tenés en casa', high: 'Pedí algo de comida' },
      da: { label: 'Kan du ikke beslutte, hvad du skal spise i dag?', low: 'Lav mad med det, du allerede har', high: 'Bestil noget mad' } } },
    { category: 'food', dc: 13, i18n: {
      en: { label: 'Craving something but hesitating?', low: 'Wait until tomorrow', high: 'Treat yourself, you earned it' },
      es: { label: '¿Tenés antojo pero dudás?', low: 'Esperá hasta mañana', high: 'Date el gusto, te lo ganaste' },
      da: { label: 'Har du lyst til noget, men tøver?', low: 'Vent til i morgen', high: 'Forkæl dig selv, du har fortjent det' } } },
    { category: 'food', dc: 11, i18n: {
      en: { label: 'New restaurant or the usual spot?', low: 'The usual spot, you know it works', high: 'Try the new place' },
      es: { label: '¿Restaurante nuevo o el de siempre?', low: 'El de siempre, sabés que funciona', high: 'Probá el lugar nuevo' },
      da: { label: 'Ny restaurant eller det sædvanlige sted?', low: 'Det sædvanlige sted, du ved det virker', high: 'Prøv det nye sted' } } },
    { category: 'food', dc: 8, i18n: {
      en: { label: 'Debating a second helping?', low: 'Leave it there', high: 'Go for seconds' },
      es: { label: '¿Dudás si repetir el plato?', low: 'Dejalo ahí nomás', high: 'Repetí sin culpa' },
      da: { label: 'Overvejer du en portion mere?', low: 'Lad det være', high: 'Tag en portion mere' } } },
    // Adventure / risk
    { category: 'risk', dc: 15, i18n: {
      en: { label: "Someone's offering you something you've never tried?", low: 'Save it for another time', high: 'Go for it' },
      es: { label: '¿Te ofrecen probar algo que nunca hiciste?', low: 'Dejalo para otra ocasión', high: 'Animate y probalo' },
      da: { label: 'Nogen tilbyder dig noget, du aldrig har prøvet?', low: 'Gem det til en anden gang', high: 'Kast dig ud i det' } } },
    { category: 'risk', dc: 10, i18n: {
      en: { label: 'The long scenic road or the short one?', low: 'The short one, you\'re already running late', high: 'The long one, the view is worth it' },
      es: { label: '¿El camino largo y lindo o el corto?', low: 'El corto, ya se te hizo tarde', high: 'El largo, el paisaje vale la pena' },
      da: { label: 'Den lange smukke vej eller den korte?', low: 'Den korte, du er allerede sent på den', high: 'Den lange, udsigten er det værd' } } },
    { category: 'risk', dc: 16, i18n: {
      en: { label: 'A spontaneous trip lands in your lap?', low: 'Stay and plan it properly for later', high: 'Hop on, no second-guessing' },
      es: { label: '¿Te proponen un viaje improvisado?', low: 'Quedate y planealo mejor para después', high: 'Subite sin pensarlo dos veces' },
      da: { label: 'En spontan tur falder dig i skødet?', low: 'Bliv hjemme og planlæg den ordentligt senere', high: 'Hop på, uden at tænke to gange' } } },
    { category: 'risk', dc: 14, i18n: {
      en: { label: "Not sure whether to speak up in that meeting?", low: 'Wait for a better moment', high: 'Raise your hand and say it' },
      es: { label: '¿No sabés si hablar en esa reunión?', low: 'Esperá tu momento', high: 'Levantá la mano y decilo' },
      da: { label: 'Usikker på, om du skal sige noget til det møde?', low: 'Vent på et bedre tidspunkt', high: 'Ræk hånden op og sig det' } } },
    // Work
    { category: 'work', dc: 9, i18n: {
      en: { label: "Not sure where to start your day?", low: 'Start with something quick to build momentum', high: 'Tackle the hardest task first' },
      es: { label: '¿No sabés por dónde empezar el día?', low: 'Arrancá con algo rápido para agarrar impulso', high: 'Arrancá con la tarea más difícil' },
      da: { label: 'Usikker på, hvor du skal starte din dag?', low: 'Start med noget hurtigt for at få gang i det', high: 'Tag den sværeste opgave først' } } },
    { category: 'work', dc: 11, i18n: {
      en: { label: 'Hesitating on sending that email?', low: 'Read it over once more first', high: 'Send it now' },
      es: { label: '¿Dudás si mandar ese mail ahora?', low: 'Revisalo una vez más antes', high: 'Mandalo ya' },
      da: { label: 'Tøver du med at sende den mail?', low: 'Læs den igennem én gang til først', high: 'Send den nu' } } },
    { category: 'work', dc: 8, i18n: {
      en: { label: 'Wondering if it\'s break time?', low: 'Push on a little longer', high: 'Take 10 minutes for yourself' },
      es: { label: '¿Dudás si tomarte un descanso?', low: 'Seguí un poco más', high: 'Tomate 10 minutos' },
      da: { label: 'Overvejer du en pause?', low: 'Fortsæt lidt længere', high: 'Tag 10 minutter til dig selv' } } },
    { category: 'work', dc: 15, i18n: {
      en: { label: 'A new project lands on your desk — take it?', low: 'Decline, it\'s not the right moment', high: 'Take it, the challenge is worth it' },
      es: { label: '¿Te ofrecen un proyecto nuevo, lo aceptás?', low: 'Declinalo, no es el momento', high: 'Aceptalo, el desafío vale la pena' },
      da: { label: 'Et nyt projekt lander på dit skrivebord — tager du det?', low: 'Sig nej tak, det er ikke det rette tidspunkt', high: 'Tag det, udfordringen er det værd' } } },
    // Wellbeing
    { category: 'wellbeing', dc: 12, i18n: {
      en: { label: "Not feeling like training today?", low: 'Rest, your body needs it', high: 'Go anyway, even if it\'s short' },
      es: { label: '¿No tenés ganas de entrenar hoy?', low: 'Descansá, tu cuerpo lo necesita', high: 'Andá igual, aunque sea corto' },
      da: { label: 'Ikke i humør til at træne i dag?', low: 'Hvil dig, din krop har brug for det', high: 'Gå alligevel, selv hvis det er kort' } } },
    { category: 'wellbeing', dc: 9, i18n: {
      en: { label: 'Torn on a nap?', low: 'Push through and stay awake', high: 'Take the nap' },
      es: { label: '¿Dudás si dormir una siesta?', low: 'Aguantá despierto/a', high: 'Dormila' },
      da: { label: 'I tvivl om en lur?', low: 'Kæmp videre og bliv vågen', high: 'Tag luren' } } },
    { category: 'wellbeing', dc: 13, i18n: {
      en: { label: "Thinking of calling someone you miss?", low: 'Send a message first', high: 'Call them right now' },
      es: { label: '¿Pensás en llamar a alguien que extrañás?', low: 'Escribile un mensaje primero', high: 'Llamalo/a ahora mismo' },
      da: { label: 'Tænker du på at ringe til nogen, du savner?', low: 'Send en besked først', high: 'Ring til dem lige nu' } } },
    { category: 'wellbeing', dc: 16, i18n: {
      en: { label: 'Craving change but hesitating?', low: 'Wait for the right moment', high: 'Go for the change' },
      es: { label: '¿Tenés ganas de un cambio pero dudás?', low: 'Esperá el momento justo', high: 'Animate al cambio' },
      da: { label: 'Trang til forandring, men tøver?', low: 'Vent på det rette tidspunkt', high: 'Kast dig ud i forandringen' } } }
  ];

  global.WD_DICE_CATEGORIES = CATEGORIES;
  global.WD_DICE_SCENARIOS = SCENARIOS;
})(window);
