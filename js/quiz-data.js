// The Wandering Die — el test. Diez situaciones de campaña, no diez preguntas de test de revista.
// Cada opción suma a una o más de las doce clases de WD_CLASSES.
(function (global) {
  'use strict';

  var QUESTIONS = [
    {
      q: 'La taberna se queda en silencio cuando entrás. Alguien te reconoce y no parece contento.',
      options: [
        { t: 'Le sostengo la mirada hasta que baje la suya', c: ['barbarian', 'fighter'] },
        { t: 'Le invito una ronda y me lo gano hablando', c: ['bard', 'paladin'] },
        { t: 'Ya ubiqué las dos salidas antes de que se levante', c: ['rogue', 'ranger'] },
        { t: 'Trato de recordar de dónde me conoce, y qué sabe', c: ['wizard', 'warlock'] },
        { t: 'Sigo caminando. No vine por él', c: ['monk', 'druid'] }
      ]
    },
    {
      q: 'El puente sobre el barranco está podrido. Del otro lado está lo que vinieron a buscar.',
      options: [
        { t: 'Cruzo primero. Si aguanta mi peso, aguanta el de todos', c: ['barbarian', 'paladin'] },
        { t: 'Busco otro camino, aunque tarde tres días más', c: ['ranger', 'druid'] },
        { t: 'Calculo qué tablones aguantan y armo la ruta', c: ['wizard', 'fighter'] },
        { t: 'Cruzo por abajo, por la estructura, donde nadie mira', c: ['rogue', 'monk'] },
        { t: 'Hay una forma más rápida y no necesita puente', c: ['sorcerer', 'warlock'] }
      ]
    },
    {
      q: 'Un chico del pueblo te pide ayuda. No hay recompensa y ustedes ya llegan tarde.',
      options: [
        { t: 'Vamos igual. Para eso estamos', c: ['paladin', 'cleric'] },
        { t: 'Escucho primero qué pasa exactamente', c: ['wizard', 'ranger'] },
        { t: 'Voy solo y los alcanzo después', c: ['rogue', 'monk'] },
        { t: 'Lo convierto en una historia que valga la pena contar', c: ['bard'] },
        { t: 'Si el bosque está metido en esto, es asunto mío', c: ['druid'] }
      ]
    },
    {
      q: 'Encontrás un objeto antiguo. Zumba cuando lo tocás.',
      options: [
        { t: 'Lo estudio antes de volver a tocarlo', c: ['wizard'] },
        { t: 'Lo agarro. Ya veremos qué hace', c: ['barbarian', 'sorcerer'] },
        { t: 'Le pregunto qué quiere. Estas cosas siempre quieren algo', c: ['warlock'] },
        { t: 'Lo llevo ante alguien que sepa bendecirlo o destruirlo', c: ['cleric', 'paladin'] },
        { t: 'Calculo cuánto vale y quién lo compraría', c: ['rogue', 'bard'] }
      ]
    },
    {
      q: 'La emboscada sale mal. Están rodeados y alguien ya cayó.',
      options: [
        { t: 'Me pongo entre el que cayó y todo lo demás', c: ['paladin', 'fighter'] },
        { t: 'Lo levanto. Sigue respirando, con eso alcanza', c: ['cleric'] },
        { t: 'Rompo el cerco por el lado más flojo', c: ['barbarian', 'monk'] },
        { t: 'Un hechizo bien puesto y dejan de estar rodeados', c: ['wizard', 'sorcerer'] },
        { t: 'Elimino al que está dando las órdenes', c: ['rogue', 'ranger'] }
      ]
    },
    {
      q: 'Honestamente: ¿de dónde sale tu poder?',
      options: [
        { t: 'De años de entrenar hasta que me salió solo', c: ['fighter', 'monk'] },
        { t: 'De algo con lo que nací y todavía no entiendo del todo', c: ['sorcerer'] },
        { t: 'De todo lo que leí, probé y anoté', c: ['wizard'] },
        { t: 'De una promesa que hice y pienso cumplir', c: ['paladin', 'cleric'] },
        { t: 'De un trato. Y sí, tiene condiciones', c: ['warlock'] },
        { t: 'De algo más viejo que yo: el bosque, la sangre, la furia', c: ['druid', 'barbarian'] }
      ]
    },
    {
      q: 'Tres días de caminata hasta el próximo pueblo. ¿Dónde vas en la fila?',
      options: [
        { t: 'Adelante, leyendo el terreno', c: ['ranger', 'druid'] },
        { t: 'Adelante, porque si aparece algo me lo llevo puesto yo', c: ['barbarian', 'fighter'] },
        { t: 'Atrás, cubriendo, mirando lo que nadie mira', c: ['rogue'] },
        { t: 'En el medio, hablando con todos', c: ['bard'] },
        { t: 'En el medio, pensando en otra cosa', c: ['wizard', 'sorcerer', 'warlock'] },
        { t: 'Donde haga falta. Camino igual', c: ['monk', 'cleric'] }
      ]
    },
    {
      q: 'Alguien del grupo te traiciona. Tenés la oportunidad de devolvérsela.',
      options: [
        { t: 'Se la devuelvo ahí mismo, de frente', c: ['barbarian'] },
        { t: 'Espero. El momento va a llegar', c: ['rogue', 'warlock'] },
        { t: 'Quiero entender por qué lo hizo', c: ['cleric', 'druid'] },
        { t: 'Que responda ante alguien más alto que yo', c: ['paladin'] },
        { t: 'Ya no me interesa. Lo suelto', c: ['monk'] },
        { t: 'Me aseguro de que toda la taberna se entere', c: ['bard'] }
      ]
    },
    {
      q: 'Te ofrecen dinero para no hacer preguntas.',
      options: [
        { t: 'Acepto, pero igual voy a averiguar', c: ['rogue', 'bard'] },
        { t: 'No acepto. Justo ahora quiero saber', c: ['paladin', 'wizard'] },
        { t: 'Acepto. No todo tiene que ser mi problema', c: ['fighter', 'ranger'] },
        { t: 'Pregunto qué pasa si digo que no', c: ['barbarian', 'warlock'] },
        { t: 'Depende de a quién lastime ese silencio', c: ['cleric', 'druid', 'monk'] }
      ]
    },
    {
      q: 'Se termina la campaña. ¿Cómo querés que te recuerden?',
      options: [
        { t: 'Como el que nunca retrocedió', c: ['barbarian', 'fighter'] },
        { t: 'Como el que mantuvo a todos vivos', c: ['cleric', 'paladin'] },
        { t: 'Como el que encontró la respuesta', c: ['wizard', 'warlock'] },
        { t: 'Como el que nadie vio venir', c: ['rogue', 'sorcerer'] },
        { t: 'Como la mejor historia que escucharon', c: ['bard'] },
        { t: 'Prefiero que no me recuerden. Prefiero que el lugar siga en pie', c: ['druid', 'ranger', 'monk'] }
      ]
    }
  ];

  global.WD_QUIZ = QUESTIONS;
})(window);
