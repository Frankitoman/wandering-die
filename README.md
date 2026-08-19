# The Wandering Die

Herramienta para la comunidad de Dungeons &amp; Dragons: un quiz de 10 preguntas que ayuda a elegir clase, y un "Destiny Dice" (d20 digital) para tomar decisiones cotidianas.

- **Sitio**: [wandering-die.francojmansilla.workers.dev](https://wandering-die.francojmansilla.workers.dev/) — Cloudflare Worker (static assets)
- Multilingüe: español, inglés y danés (`js/i18n.js`)
- Las 12 clases de D&D 5e con imágenes generadas por IA (`js/classes-data.js`, `assets/images/classes/`)
- Quiz de clase con banco de preguntas y puntaje por clase (`js/quiz-data.js`, `js/quiz.js`)
- Destiny Dice: banco de ~24 decisiones predefinidas por categoría + entrada de texto libre con heurística de dificultad (DC) automática (`js/dice-data.js`, `js/dice.js`)
