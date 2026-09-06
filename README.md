# The Wandering Die

Herramienta para la comunidad de Dungeons & Dragons, en español:
un test de diez situaciones de campaña que te dice qué clase sos, y un
"Destiny Dice" — un d20 de verdad — para las decisiones de todos los días.

- **Sitio**: [wandering-die.francojmansilla.workers.dev](https://wandering-die.francojmansilla.workers.dev/) — Cloudflare Worker (static assets)
- **Idioma**: español (el sitio era trilingüe; se simplificó a un solo idioma)

## Cómo está hecho

HTML, CSS y JS planos. Sin build, sin framework, sin backend.

- `js/classes-data.js` — las doce clases con su ficha de combate (rol, ataque,
  magia, alcance, armas, armadura, dado de golpe)
- `js/quiz-data.js` — las diez situaciones del test y a qué clases suma cada opción
- `js/dice-data.js` — banco de ~24 decisiones por categoría, con su dificultad (CD)
- `js/die-mesh.js` — construcción del d20 numerado (caras opuestas suman 21),
  compartida por los dos dados de la página
- `js/hero3d.js` — el d20 de vitrina del hero: gira solo y se puede arrastrar
- `js/dice3d.js` — el Destiny Dice: **simulación física real** (Three.js +
  cannon-es). El número no se decide de antemano: se tira el dado, rebota y
  rueda, y cuando se frena se lee qué cara quedó arriba.

### Sobre la física del dado

Los parámetros (gravedad, amortiguación, umbrales de sueño) están calibrados
corriendo la misma simulación 2000 veces sin navegador. Con los valores
actuales: se asienta en ~2.1s de media, nunca pasa de ~3.5s, nunca queda
chueco, y la distribución de 1..20 es pareja (min 86 / max 113 sobre 2000
tiradas, esperado 100).

## Deploy

No hay CI/CD conectado. Cada cambio se publica a mano:

```bash
git pull
rm -rf _site && mkdir _site
cp index.html _site/
cp -r css js assets _site/
npx wrangler deploy
```
