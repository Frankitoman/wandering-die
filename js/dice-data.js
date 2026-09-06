// The Wandering Die — Destiny Dice: banco de decisiones, por categoría.
// Cada escenario trae varias redacciones por resultado, así una segunda tirada
// sobre la misma decisión no repite exactamente la misma frase.
(function (global) {
  'use strict';

  var CATEGORIES = [
    {
      "id": "social",
      "name": "Social"
    },
    {
      "id": "leisure",
      "name": "Ocio"
    },
    {
      "id": "food",
      "name": "Comida"
    },
    {
      "id": "risk",
      "name": "Aventura"
    },
    {
      "id": "work",
      "name": "Trabajo"
    },
    {
      "id": "wellbeing",
      "name": "Bienestar"
    }
  ];

  var SCENARIOS = [
    {
      "category": "social",
      "dc": 10,
      "label": "¿No sabés si salir esta noche?",
      "low": [
        "Quedate en casa mirando una película",
        "Mejor te quedás adentro con una peli",
        "Elegí quedarte tranquilo en casa",
        "Te conviene quedarte en casa esta noche",
        "Optá por quedarte adentro viendo algo"
      ],
      "high": [
        "Salí a tomar algo con amigos",
        "Andá, salí un rato esta noche",
        "Vestite y salí a despejarte",
        "Aceptá la salida, te va a hacer bien",
        "Salí, aunque sea una hora"
      ]
    },
    {
      "category": "social",
      "dc": 13,
      "label": "¿Te invitaron a una fiesta donde no conocés a nadie?",
      "low": [
        "Mandá una excusa amable y quedate tranquilo",
        "Declina con cortesía y quedate en casa",
        "Avisá que no podés ir esta vez",
        "Mejor te la perdés, sin culpa",
        "Quedate afuera de ésta, no pasa nada"
      ],
      "high": [
        "Andá igual y presentate",
        "Metete igual, aunque no conozcas a nadie",
        "Aparecé y hacé nuevos contactos",
        "Cruzá la puerta y arrancá una charla",
        "Andá sin pensarlo demasiado"
      ]
    },
    {
      "category": "social",
      "dc": 12,
      "label": "¿Tenés que romper el hielo con alguien nuevo?",
      "low": [
        "Preguntale algo genuino sobre su día",
        "Empezá con una pregunta simple y real",
        "Mostrá interés genuino primero",
        "Preguntale algo que de verdad te interese",
        "Arrancá suave, con una pregunta honesta"
      ],
      "high": [
        "Tirale un chiste malísimo y ver qué pasa",
        "Arriesgate con un chiste horrible",
        "Rompé el hielo con humor, aunque falle",
        "Probá un chiste malo a propósito",
        "Hacé la broma, total ya está"
      ]
    },
    {
      "category": "social",
      "dc": 14,
      "label": "¿No sabés si mandar ese mensaje?",
      "low": [
        "Esperá hasta mañana para mandarlo",
        "Dejalo reposar y mandalo después",
        "Aguantá un rato antes de mandarlo",
        "Mejor esperá al momento justo",
        "Guardalo para más tarde"
      ],
      "high": [
        "Mandalo ya mismo, sin darle más vueltas",
        "Enviálo ahora, no lo pienses más",
        "Dale enviar antes de arrepentirte",
        "Mandalo de una vez",
        "Apretá enviar ya"
      ]
    },
    {
      "category": "leisure",
      "dc": 10,
      "label": "¿No sabés qué ver esta noche?",
      "low": [
        "Algo que te haga pensar, un documental o drama",
        "Elegí un documental que te desafíe",
        "Andá por algo más denso, un drama",
        "Probá un documental esta vez",
        "Metele algo con más sustancia"
      ],
      "high": [
        "Una comedia liviana y fácil",
        "Algo divertido y sin pensar mucho",
        "Ponete una comedia y relajate",
        "Elegí algo liviano para reírte",
        "Una comedia rápida y sin vueltas"
      ]
    },
    {
      "category": "leisure",
      "dc": 11,
      "label": "¿Tenés una tarde libre sin planes?",
      "low": [
        "Quedate leyendo en casa",
        "Aprovechá para leer tranquilo",
        "Elegí un libro y quedate adentro",
        "Pasá la tarde con un buen libro",
        "Quedate en casa, agarrá algo para leer"
      ],
      "high": [
        "Salí a caminar sin rumbo",
        "Andá a dar una vuelta sin destino",
        "Caminá un rato, sin plan fijo",
        "Salí a moverte, aunque sea sin rumbo",
        "Date una vuelta por ahí"
      ]
    },
    {
      "category": "leisure",
      "dc": 9,
      "label": "¿Dudás si arrancar esa serie nueva?",
      "low": [
        "Dejala para el finde",
        "Guardala para cuando tengas más tiempo",
        "Esperá al fin de semana para arrancarla",
        "Mejor la arrancás con más calma después",
        "Dejala para otro momento"
      ],
      "high": [
        "Arrancala esta noche",
        "Dale, empezala ya",
        "Metele el primer capítulo ahora",
        "Arrancala, totalmente hoy",
        "Empezala ya, no esperes más"
      ]
    },
    {
      "category": "leisure",
      "dc": 12,
      "label": "¿Indecisión de fin de semana?",
      "low": [
        "Quedate en casa recargando pilas, sin planes",
        "Tomate el finde para descansar en casa",
        "Sin planes, quedate tranquilo en casa",
        "Aprovechá para no hacer nada",
        "Quedate adentro y descansá de verdad"
      ],
      "high": [
        "Planeá una escapada corta",
        "Organizá una salida corta este finde",
        "Armá un plan afuera, aunque sea cerca",
        "Salí de la rutina con una escapada",
        "Planeá algo afuera, aunque sea chico"
      ]
    },
    {
      "category": "food",
      "dc": 10,
      "label": "¿No sabés qué comer hoy?",
      "low": [
        "Cociná algo con lo que ya tenés en casa",
        "Armá algo simple con lo que hay",
        "Cociná en casa hoy",
        "Usá lo que tenés en la heladera",
        "Preparate algo casero"
      ],
      "high": [
        "Pedí algo de comida",
        "Pedí delivery hoy",
        "Dejá que cocinen por vos hoy",
        "Pedí algo rico, sin cocinar",
        "Encargá comida esta vez"
      ]
    },
    {
      "category": "food",
      "dc": 13,
      "label": "¿Tenés antojo pero dudás?",
      "low": [
        "Esperá hasta mañana",
        "Dejalo para otro día",
        "Aguantá el antojo por hoy",
        "Mejor esperá un poco más",
        "Postergalo hasta mañana"
      ],
      "high": [
        "Date el gusto, te lo ganaste",
        "Dale, date el gusto",
        "Permitite el capricho hoy",
        "Comételo, no pasa nada",
        "Date el gusto sin culpa"
      ]
    },
    {
      "category": "food",
      "dc": 11,
      "label": "¿Restaurante nuevo o el de siempre?",
      "low": [
        "El de siempre, sabés que funciona",
        "Andá al de siempre, seguro",
        "No arriesgues, el de confianza",
        "Quedate con el que ya conocés",
        "El de siempre no falla"
      ],
      "high": [
        "Probá el lugar nuevo",
        "Animate al restaurante nuevo",
        "Dale una chance al lugar nuevo",
        "Probá algo distinto hoy",
        "Arriesgá con el nuevo"
      ]
    },
    {
      "category": "food",
      "dc": 8,
      "label": "¿Dudás si repetir el plato?",
      "low": [
        "Dejalo ahí nomás",
        "Frená ahí, ya está bien",
        "No repitas esta vez",
        "Quedate con lo que comiste",
        "Dejalo así, alcanza"
      ],
      "high": [
        "Repetí sin culpa",
        "Dale, repetí una vez más",
        "Serví un poco más",
        "Repetí, total vale la pena",
        "Andá por más"
      ]
    },
    {
      "category": "risk",
      "dc": 15,
      "label": "¿Te ofrecen probar algo que nunca hiciste?",
      "low": [
        "Dejalo para otra ocasión",
        "Esperá un mejor momento",
        "Postergalo, no es hoy",
        "Guardalo para más adelante",
        "Mejor lo dejás pasar por ahora"
      ],
      "high": [
        "Animate y probalo",
        "Dale, lanzate a probarlo",
        "Es tu momento, hacelo",
        "Arriesgate y probalo",
        "Tirate a la pileta, probalo"
      ]
    },
    {
      "category": "risk",
      "dc": 10,
      "label": "¿El camino largo y lindo o el corto?",
      "low": [
        "El corto, ya se te hizo tarde",
        "Andá por el corto, no hay tiempo",
        "Mejor el rápido hoy",
        "Tomá el camino corto",
        "El corto te conviene ahora"
      ],
      "high": [
        "El largo, el paisaje vale la pena",
        "Andá por el largo, disfrutalo",
        "Tomate el tiempo, andá por el lindo",
        "El camino largo hoy tiene sentido",
        "Elegí el paisaje, andá despacio"
      ]
    },
    {
      "category": "risk",
      "dc": 16,
      "label": "¿Te proponen un viaje improvisado?",
      "low": [
        "Quedate y planealo mejor para después",
        "Esperá y organizalo con calma",
        "Mejor lo planeás para otro momento",
        "Dejalo para cuando esté más armado",
        "Quedate esta vez, organizalo después"
      ],
      "high": [
        "Subite sin pensarlo dos veces",
        "Andá, subite ya",
        "Aceptá el viaje, sin dudar",
        "Subite al viaje ahora mismo",
        "Decí que sí y subite"
      ]
    },
    {
      "category": "risk",
      "dc": 14,
      "label": "¿No sabés si hablar en esa reunión?",
      "low": [
        "Esperá tu momento",
        "Aguantá y buscá mejor ocasión",
        "Dejalo pasar por ahora",
        "Esperá a que sea tu turno",
        "Mejor esperá un poco más"
      ],
      "high": [
        "Levantá la mano y decilo",
        "Hablá ahora, decilo",
        "No te lo guardes, decilo",
        "Tomá la palabra ya",
        "Decilo, es tu momento"
      ]
    },
    {
      "category": "work",
      "dc": 9,
      "label": "¿No sabés por dónde empezar el día?",
      "low": [
        "Arrancá con algo rápido para agarrar impulso",
        "Empezá liviano, tomá impulso",
        "Sacate algo chico de encima primero",
        "Arrancá con lo fácil",
        "Empezá simple para entrar en ritmo"
      ],
      "high": [
        "Arrancá con la tarea más difícil",
        "Enfrentá lo difícil primero",
        "Empezá por lo que más pesa",
        "Sacate lo pesado de encima ya",
        "Andá directo a lo complicado"
      ]
    },
    {
      "category": "work",
      "dc": 11,
      "label": "¿Dudás si mandar ese mail ahora?",
      "low": [
        "Revisalo una vez más antes",
        "Releelo antes de mandarlo",
        "Dale una repasada más",
        "Chequealo de nuevo antes de enviar",
        "Mejor revisalo primero"
      ],
      "high": [
        "Mandalo ya",
        "Enviálo ahora",
        "Dale enviar, ya está listo",
        "Mandalo de una",
        "Apretá enviar ahora mismo"
      ]
    },
    {
      "category": "work",
      "dc": 8,
      "label": "¿Dudás si tomarte un descanso?",
      "low": [
        "Seguí un poco más",
        "Aguantá un rato más",
        "Empujá un poco más antes de parar",
        "Seguí, ya casi terminás",
        "Un poco más y después parás"
      ],
      "high": [
        "Tomate 10 minutos",
        "Hacé una pausa ahora",
        "Parate un rato, lo necesitás",
        "Cortá un rato, después seguís",
        "Date un respiro ya"
      ]
    },
    {
      "category": "work",
      "dc": 15,
      "label": "¿Te ofrecen un proyecto nuevo, lo aceptás?",
      "low": [
        "Declinalo, no es el momento",
        "Decí que no por ahora",
        "Mejor lo dejás pasar esta vez",
        "No es tu momento, declinalo",
        "Rechazalo por ahora"
      ],
      "high": [
        "Aceptalo, el desafío vale la pena",
        "Decí que sí, animate",
        "Tomalo, es una buena oportunidad",
        "Aceptá el reto",
        "Dale que sí, aceptalo"
      ]
    },
    {
      "category": "wellbeing",
      "dc": 12,
      "label": "¿No tenés ganas de entrenar hoy?",
      "low": [
        "Descansá, tu cuerpo lo necesita",
        "Dejalo pasar hoy, descansá",
        "Tu cuerpo pide descanso, hacele caso",
        "Saltealo hoy, descansá tranquilo",
        "Mejor descansá esta vez"
      ],
      "high": [
        "Andá igual, aunque sea corto",
        "Movete un poco igual",
        "Aunque sea poco, entrená",
        "Andá, aunque sea flojo",
        "Metele aunque sea corto"
      ]
    },
    {
      "category": "wellbeing",
      "dc": 9,
      "label": "¿Dudás si dormir una siesta?",
      "low": [
        "Aguantá despierto/a",
        "Seguí despierto/a un rato más",
        "Aguantá, no te duermas ahora",
        "Quedate despierto/a un poco más",
        "Resistí la siesta esta vez"
      ],
      "high": [
        "Dormila",
        "Date la siesta",
        "Echate un rato",
        "Dormí un poco, lo necesitás",
        "Aprovechá y dormila"
      ]
    },
    {
      "category": "wellbeing",
      "dc": 13,
      "label": "¿Pensás en llamar a alguien que extrañás?",
      "low": [
        "Escribile un mensaje primero",
        "Mandale un mensaje antes",
        "Empezá con un mensaje, no la llamada",
        "Escribile algo corto primero",
        "Probá con un mensaje antes"
      ],
      "high": [
        "Llamalo/a ahora mismo",
        "Marcá ya, no esperes",
        "Llamalo/a, no lo pienses más",
        "Hacé la llamada ahora",
        "Llamalo/a de una vez"
      ]
    },
    {
      "category": "wellbeing",
      "dc": 16,
      "label": "¿Tenés ganas de un cambio pero dudás?",
      "low": [
        "Esperá el momento justo",
        "Aguantá un poco más antes de cambiar",
        "Dejalo madurar antes de decidir",
        "Esperá a estar más seguro/a",
        "Mejor esperá un poco"
      ],
      "high": [
        "Animate al cambio",
        "Dale, hacé el cambio",
        "Es hora del cambio, animate",
        "Lanzate al cambio ahora",
        "Andá por el cambio"
      ]
    }
  ];

  global.WD_DICE_CATEGORIES = CATEGORIES;
  global.WD_DICE_SCENARIOS = SCENARIOS;
})(window);
