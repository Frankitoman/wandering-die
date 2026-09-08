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
- `js/dice-data.js` — banco de ~24 decisiones por categoría, con su dificultad
  (CD). **La CD no se muestra en pantalla**: sigue siendo la que decide si la
  tirada sale bien o mal, pero enseñarla convertía una consulta al destino en
  una planilla de reglas
- `js/die-mesh.js` — construcción del d20 de bronce (caras opuestas suman 21),
  compartida por los dos dados de la página
- `js/hero3d.js` — el d20 de vitrina del hero: gira solo y se puede arrastrar
- `js/dice3d.js` — el Destiny Dice: **simulación física real** (Three.js +
  cannon-es). El número no se decide de antemano: se tira el dado, rebota y
  rueda, y cuando se frena se lee qué cara quedó arriba.

### Sobre la forma del dado

Un icosaedro pelado se lee como figura de geometría, no como dado de set. El
sólido de acá está definido como superficie implícita —
`Σ_f max(0, x·n_f / D)^p = 1` sobre las veinte normales— que con `p` finito
redondea aristas y puntas sola y de forma continua, y se despeja en una línea:
para cada dirección, `r = D / (Σ max(0, d·n_f)^p)^(1/p)`. Se toma una esfera
geodésica y se empuja cada vértice a su radio. La normal sale del gradiente de
esa misma función, así que el bisel se ve liso en vez de facetado.

El material es bronce fundido y envejecido: metal donde la pieza se frota,
verdín mate en los huecos, numerales hundidos con relieve propio. Como el
bronce es metal, casi todo lo que se ve son reflejos: la página le fabrica su
cielo (un equirectangular pintado a mano, pasado por PMREM). Sin eso el dado
sale negro.

### Sobre la física del dado

Los parámetros (gravedad, amortiguación, umbrales de sueño) están calibrados
corriendo la misma simulación 6000 veces sin navegador. Con los valores
actuales la tirada dura **3,15s de mediana**, el 90% termina antes de 4s, nunca
queda trabada, y la distribución de 1..20 pasa el chi cuadrado (χ²=24,8 sobre
19 grados de libertad, crítico al 5% = 30,1).

Dos cosas son presentación y no física, y ocurren **después** de que el número
ya está decidido: el dado se endereza sobre la cara ganadora (verificado en
5000 tiradas: nunca cambia el número, el giro máximo es de 36°) y la cámara se
corre para dejarlo centrado en el cuadro, caiga donde caiga.

Se tira **una sola vez por decisión**. Si el dado se pudiera tirar de nuevo
hasta que salga lo que uno quiere, no estaría decidiendo nada.

## Deploy

No hay CI/CD conectado. Cada cambio se publica a mano:

```bash
git pull
rm -rf _site && mkdir _site
cp index.html _site/
cp -r css js assets _site/
# Versiona css/js en la COPIA de deploy (el fuente queda limpio), para que
# ningún navegador se quede con una hoja o un script viejo.
V=$(date +%s)
sed -i "s|\(href=\"css/style.css\)\"|?v=$V\"|; s|\(src=\"js/[a-z0-9-]*\.js\)\"|?v=$V\"|g" _site/index.html
npx wrangler deploy
```
