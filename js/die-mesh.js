// The Wandering Die — construcción del d20 de bronce.
// Compartido por el dado de vitrina del hero (hero3d.js) y el dado con físicas
// reales del Destiny Dice (dice3d.js), para que sean literalmente el mismo objeto.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Subdivisiones del icosaedro base. three.js parte cada arista en DETAIL+1, así
// que cada cara da (DETAIL+1)^2 triángulos: con 13 son 196 por cara, 3920 en
// total, suficientes para que el bisel se lea liso y no como una escalera.
var DETAIL = 13;

// Exponente del redondeo (ver buildGeometry). Más alto = aristas más vivas.
// Con 15 el dado quedaba casi esférico y las caras se comían entre sí; 24 deja
// caras planas de verdad con el bisel gastado en el canto, que es como se ve un
// dado de metal de tanto rodar.
var ROUND_P = 24;

var SIZE = 384;   // mapa de color por cara
var NSIZE = 256;  // mapa de normales por cara

// El triángulo de la cara se mapea centrado en este punto de la textura, con
// los vértices a esta distancia y el primero apuntando hacia arriba. El numeral
// se dibuja sobre el mismo centro.
var UV_CX = 0.5, UV_CY = 0.36, UV_SPAN = 0.52;

/* ------------------------------------------------------------- geometría */

export function faceNormalsOf(geometry) {
  var pos = geometry.attributes.position;
  function vec(i) { return new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)); }
  var normals = [];
  for (var f = 0; f < 20; f++) {
    var v0 = vec(f * 3), v1 = vec(f * 3 + 1), v2 = vec(f * 3 + 2);
    normals.push(new THREE.Vector3()
      .subVectors(v1, v0)
      .cross(new THREE.Vector3().subVectors(v2, v0))
      .normalize());
  }
  return normals;
}

// Un d20 real tiene las caras opuestas sumando 21. Buscamos los pares
// antipodales por su normal y numeramos en pares (n, 21-n): sale gratis y es
// la diferencia entre un dado y un icosaedro con números encima.
export function assignFaceNumbers(faceNormals) {
  var numbers = new Array(20).fill(0);
  var next = 1;
  for (var f = 0; f < 20; f++) {
    if (numbers[f]) continue;
    var opposite = -1, best = 1;
    for (var g = 0; g < 20; g++) {
      if (g === f || numbers[g]) continue;
      var dot = faceNormals[f].dot(faceNormals[g]);
      if (dot < best) { best = dot; opposite = g; }
    }
    numbers[f] = next;
    if (opposite >= 0) numbers[opposite] = 21 - next;
    next++;
  }
  return numbers;
}

// El dado ya no es un icosaedro pelado: un icosaedro perfecto se lee como
// figura de geometría, no como dado de set. Un dado de verdad tiene las veinte
// caras planas pero las aristas y las puntas rebajadas y gastadas.
//
// En vez de biselar a mano, el sólido se define como superficie implícita:
//
//     Σ_f max(0, x·n_f / D)^p = 1
//
// donde n_f son las veinte normales y D la distancia del centro a cada cara.
// Con p → ∞ eso es exactamente el icosaedro (la intersección de los veinte
// semiespacios); con p finito las aristas y los vértices se redondean solos y
// de forma continua. La gracia es que se despeja: para una dirección d el radio
// es r(d) = D / (Σ max(0, d·n_f)^p)^(1/p). Así que alcanza con tomar una esfera
// geodésica y empujar cada vértice hasta su radio.
//
// De yapa la normal sale del gradiente de esa misma función en vez de promediar
// triángulos, y por eso el bisel se ve liso de verdad y no facetado.
export function buildGeometry(radius) {
  var base = new THREE.IcosahedronGeometry(1, 0);
  var faceNormals = faceNormalsOf(base);
  var bp = base.attributes.position;
  var PLANE = new THREE.Vector3(bp.getX(0), bp.getY(0), bp.getZ(0)).dot(faceNormals[0]);

  var sphere = new THREE.IcosahedronGeometry(1, DETAIL);
  var spos = sphere.attributes.position;
  var triCount = spos.count / 3;
  var dir = new THREE.Vector3();

  function radiusAt(d) {
    var sum = 0;
    for (var f = 0; f < 20; f++) {
      var t = d.dot(faceNormals[f]);
      if (t > 0) sum += Math.pow(t, ROUND_P);
    }
    return PLANE / Math.pow(sum, 1 / ROUND_P);
  }

  function normalAt(p, out) {
    // ∇F con F = Σ (x·n/D)^p ; las constantes no cambian la dirección.
    out.set(0, 0, 0);
    for (var f = 0; f < 20; f++) {
      var t = p.dot(faceNormals[f]);
      if (t > 0) out.addScaledVector(faceNormals[f], Math.pow(t, ROUND_P - 1));
    }
    return out.normalize();
  }

  // Marco 2D de cada cara, para mapear la textura (y con ella el numeral).
  var frames = [];
  for (var f = 0; f < 20; f++) {
    var n = faceNormals[f];
    var centroid = n.clone().multiplyScalar(PLANE);
    var a = new THREE.Vector3(bp.getX(f * 3), bp.getY(f * 3), bp.getZ(f * 3));
    var e1 = a.clone().sub(centroid);
    var L = e1.length();
    e1.divideScalar(L);
    // e2 = n × e1 deja la base a derechas: el numeral no sale espejado.
    frames.push({ centroid: centroid, e1: e1, e2: new THREE.Vector3().crossVectors(n, e1), L: L });
  }

  // A qué cara pertenece cada triángulo. Las direcciones más cercanas a n_f son
  // exactamente el triángulo esférico de la cara f, así que el máximo producto
  // escalar del centroide alcanza y sobra.
  var buckets = [];
  for (var b = 0; b < 20; b++) buckets.push([]);
  var c0 = new THREE.Vector3(), c1 = new THREE.Vector3(), c2 = new THREE.Vector3();
  for (var t = 0; t < triCount; t++) {
    c0.set(spos.getX(t * 3), spos.getY(t * 3), spos.getZ(t * 3));
    c1.set(spos.getX(t * 3 + 1), spos.getY(t * 3 + 1), spos.getZ(t * 3 + 1));
    c2.set(spos.getX(t * 3 + 2), spos.getY(t * 3 + 2), spos.getZ(t * 3 + 2));
    dir.copy(c0).add(c1).add(c2).normalize();
    var owner = 0, bestDot = -Infinity;
    for (var g = 0; g < 20; g++) {
      var d = dir.dot(faceNormals[g]);
      if (d > bestDot) { bestDot = d; owner = g; }
    }
    buckets[owner].push(t);
  }

  // El centro de cada cara queda un pelo por fuera del plano D (el suavizado
  // redondea hacia adentro en las aristas y hacia afuera en el medio). Se
  // corrige con un factor, para que el dado apoye exactamente donde el
  // colisionador de la física dice que apoya.
  var fit = PLANE / radiusAt(faceNormals[0]);

  var positions = new Float32Array(spos.count * 3);
  var normals = new Float32Array(spos.count * 3);
  var uvs = new Float32Array(spos.count * 2);
  var p = new THREE.Vector3(), nrm = new THREE.Vector3(), q = new THREE.Vector3();
  var geometry = new THREE.BufferGeometry();
  var w = 0;

  for (var face = 0; face < 20; face++) {
    var fr = frames[face];
    var start = w;
    for (var k = 0; k < buckets[face].length; k++) {
      var tri = buckets[face][k];
      for (var v = 0; v < 3; v++) {
        var i = tri * 3 + v;
        dir.set(spos.getX(i), spos.getY(i), spos.getZ(i)).normalize();
        p.copy(dir).multiplyScalar(radiusAt(dir));
        normalAt(p, nrm);

        positions[w * 3] = p.x * radius * fit;
        positions[w * 3 + 1] = p.y * radius * fit;
        positions[w * 3 + 2] = p.z * radius * fit;
        normals[w * 3] = nrm.x;
        normals[w * 3 + 1] = nrm.y;
        normals[w * 3 + 2] = nrm.z;

        // Giro de 90°: e1 apunta al primer vértice y ese vértice tiene que caer
        // arriba en la textura, con el numeral derecho debajo. La rotación
        // conserva la orientación, así que el número no sale espejado.
        q.copy(p).sub(fr.centroid);
        uvs[w * 2] = UV_CX - (q.dot(fr.e2) / fr.L) * UV_SPAN;
        uvs[w * 2 + 1] = UV_CY + (q.dot(fr.e1) / fr.L) * UV_SPAN;
        w++;
      }
    }
    geometry.addGroup(start, w - start, face);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();

  sphere.dispose();
  base.dispose();
  return { geometry: geometry, faceNormals: faceNormals, plane: PLANE };
}

/* --------------------------------------------------------------- entorno */

// El bronce es metal: en un MeshStandardMaterial con metalness alto el color
// difuso no existe, todo lo que se ve son reflejos. Sin mapa de entorno el dado
// sale casi negro con dos brillos encima. Así que le fabricamos su propio
// cielo: un equirectangular pintado a mano (copas verdes abajo, sol cálido
// arriba) pasado por PMREM. Es lo que le da al metal el degradé y los destellos.
export function buildEnvironment(renderer) {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  var ctx = c.getContext('2d');

  var g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.00, '#ffffff');
  g.addColorStop(0.30, '#fdf0d4');
  g.addColorStop(0.46, '#e2c894');
  g.addColorStop(0.50, '#8f9a5e');
  g.addColorStop(0.66, '#31401f');
  g.addColorStop(0.84, '#141a0c');
  g.addColorStop(1.00, '#080a05');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  // Sol bajo, de tarde: el punto de luz que el metal devuelve como destello.
  var sun = ctx.createRadialGradient(150, 70, 2, 150, 70, 52);
  sun.addColorStop(0, 'rgba(255,255,255,1)');
  sun.addColorStop(0.18, 'rgba(255,248,224,0.95)');
  sun.addColorStop(1, 'rgba(255,238,196,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);

  // Troncos: franjas oscuras verticales. Un reflejo con estructura es lo que
  // delata al metal; un degradé limpio se lee como plástico.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#0d1108';
  for (var t = 0; t < 9; t++) {
    var tx = Math.random() * 512, tw = 6 + Math.random() * 20;
    ctx.fillRect(tx, 100 + Math.random() * 30, tw, 160);
  }
  ctx.globalAlpha = 1;

  // Claros entre las copas: manchas de luz sueltas, para que el reflejo sea
  // irregular y no un degradé limpio de estudio.
  for (var i = 0; i < 26; i++) {
    var x = Math.random() * 512, y = 120 + Math.random() * 90;
    var r = 6 + Math.random() * 22;
    var spot = ctx.createRadialGradient(x, y, 0, x, y, r);
    spot.addColorStop(0, 'rgba(255,244,214,' + (0.25 + Math.random() * 0.4).toFixed(2) + ')');
    spot.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = spot;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  var tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;

  var pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  var env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return env;
}

/* -------------------------------------------------------------- material */

function configureTexture(tex, maxAniso, srgb) {
  // Sólo el mapa de color va en sRGB. Los de normales y rugosidad son datos,
  // no colores: convertirlos rompe la iluminación.
  if ('colorSpace' in tex) tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = maxAniso;
  return tex;
}

// Ruido de valor con interpolación suave, sumado en octavas. Determinista a
// partir de la semilla, así el dado se ve igual en cada carga.
function makeNoiseField(size, seed) {
  function hash(x, y) {
    var h = x * 374761393 + y * 668265263 + seed * 2246822519;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function octave(x, y, freq) {
    var fx = x * freq, fy = y * freq;
    var x0 = Math.floor(fx), y0 = Math.floor(fy);
    var tx = smooth(fx - x0), ty = smooth(fy - y0);
    var a = hash(x0, y0), b = hash(x0 + 1, y0);
    var c = hash(x0, y0 + 1), d = hash(x0 + 1, y0 + 1);
    return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  }
  var field = new Float32Array(size * size);
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      field[y * size + x] =
        octave(x, y, 0.011) * 0.42 +
        octave(x, y, 0.033) * 0.25 +
        octave(x, y, 0.085) * 0.16 +
        octave(x, y, 0.24) * 0.10 +
        octave(x, y, 0.60) * 0.07; // grano fino: el poro de la fundición
    }
  }
  // Estirado a 0..1. La suma de octavas se apelotona alrededor de 0,45, así que
  // sin esto cualquier umbral que uno elija cae en medio del montón y termina
  // pintando de verdín el dado entero.
  var lo = Infinity, hi = -Infinity;
  for (var i = 0; i < field.length; i++) {
    if (field[i] < lo) lo = field[i];
    if (field[i] > hi) hi = field[i];
  }
  var span = (hi - lo) || 1;
  for (var j = 0; j < field.length; j++) field[j] = (field[j] - lo) / span;
  return field;
}

// El mismo ruido pero sólo con las octavas finas. El campo grande sirve para
// el color (manchas amplias de suciedad y verdín), pero si se usa también como
// altura el dado queda lleno de bollos y parece cera derretida en vez de metal
// fundido. El relieve real de una pieza de bronce es poro y picadura, o sea
// frecuencia alta.
function makeFineField(size, seed) {
  function hash(x, y) {
    var h = x * 912931717 + y * 284331721 + seed * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function octave(x, y, freq) {
    var fx = x * freq, fy = y * freq;
    var x0 = Math.floor(fx), y0 = Math.floor(fy);
    var tx = smooth(fx - x0), ty = smooth(fy - y0);
    var a = hash(x0, y0), b = hash(x0 + 1, y0);
    var c = hash(x0, y0 + 1), d = hash(x0 + 1, y0 + 1);
    return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  }
  var field = new Float32Array(size * size);
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      field[y * size + x] =
        octave(x, y, 0.14) * 0.30 +
        octave(x, y, 0.34) * 0.30 +
        octave(x, y, 0.75) * 0.25 +
        octave(x, y, 1.6) * 0.15;
    }
  }
  return field;
}

// El verdín no se reparte parejo: se agarra de los huecos. Sólo el cuarto más
// bajo del ruido lo junta, y con transición suave para que no se vea recortado.
function patinaAt(v) {
  if (v >= 0.34) return 0;
  if (v <= 0.12) return 1;
  var t = (0.34 - v) / 0.22;
  return t * t * (3 - 2 * t);
}

// Bronce fundido y envejecido: metal cálido donde la pieza se frota, verdín
// acumulado donde nadie la toca, y picaduras de fundición por todos lados.
function makeBronzeCanvas(size, field) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);

  for (var i = 0, p = 0; i < field.length; i++, p += 4) {
    // De bronce pulido (#d2a35c) a bronce hundido y sucio (#5c3d17). El rango
    // va invertido respecto del ruido: las zonas altas son las que sobresalen
    // y se frotan, y por eso son las que brillan.
    var t = 1 - field[i];
    var r = 210 - t * 118;
    var g = 163 - t * 102;
    var b = 92 - t * 69;
    // Verdín: verde azulado y oscuro, no menta. Sólo en los huecos.
    var patina = patinaAt(field[i]);
    if (patina > 0) {
      var k = patina * 0.88;
      r += (47 - r) * k;
      g += (92 - g) * k;
      b += (74 - b) * k;
    }
    img.data[p] = r; img.data[p + 1] = g; img.data[p + 2] = b; img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // Picaduras de fundición: puntitos oscuros que rompen la uniformidad.
  ctx.globalAlpha = 0.45;
  for (var s = 0; s < Math.round(size * 1.8); s++) {
    ctx.fillStyle = Math.random() > 0.4 ? '#2e2413' : '#4a6b52';
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 1.5 + 0.3, 0, 6.283);
    ctx.fill();
  }
  // Rayitas de uso, en cualquier dirección, como una pieza manoseada.
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#e0b06a';
  for (var v = 0; v < 22; v++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 1.2 + 0.25;
    var x0 = Math.random() * size, y0 = Math.random() * size;
    var ang = Math.random() * Math.PI;
    var len = size * (0.1 + Math.random() * 0.35);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

// Mapa combinado de rugosidad (canal G) y metalicidad (canal B), que es de
// donde los lee three.js. El verdín no es metal: es óxido, mate y opaco. El
// bronce limpio sí, y bastante pulido. Sin esa distinción el dado se ve como
// una sola sustancia y pierde la mitad de la gracia.
function makeMaterialMap(size, field, maxAniso) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  for (var i = 0, p = 0; i < field.length; i++, p += 4) {
    var patina = patinaAt(field[i]);
    // El bronce limpio va de bastante pulido (0,22) a mate por suciedad (0,52);
    // el verdín se va a 0,95, que es lo que lo separa del metal. Sin ese salto
    // el dado entero se lee como una sola sustancia opaca.
    var rough = 0.22 + (1 - field[i]) * 0.30 + patina * 0.5;
    img.data[p] = 255;
    img.data[p + 1] = Math.round(Math.min(1, rough) * 255);
    img.data[p + 2] = Math.round((1 - patina * 0.95) * 255);
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso, false);
}

// Altura del bronce en gris, para derivar después el relieve de cada cara.
function makeHeightCanvas(size, field) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  for (var i = 0, p = 0; i < field.length; i++, p += 4) {
    img.data[p] = img.data[p + 1] = img.data[p + 2] = Math.round(field[i] * 255);
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// Trazado del numeral, compartido por el mapa de color y el de relieve, para
// que el grabado y su tinta caigan exactamente en el mismo lugar.
function drawNumeralPath(ctx, size, n) {
  var y = size * (1 - UV_CY);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 ' + Math.round(size * 0.25) + 'px "Marcellus", Georgia, serif';
  ctx.fillText(String(n), size * 0.5, y);
  // El 6 y el 9 llevan subrayado, igual que en un dado de verdad.
  if (n === 6 || n === 9) {
    var w = size * 0.11;
    ctx.fillRect(size * 0.5 - w / 2, y + size * 0.145, w, size * 0.016);
  }
}

// El numeral en blanco sobre negro y desenfocado: es la profundidad del
// grabado. De acá sale el relieve real del número, no un dibujo de sombra.
function numeralHeight(n, size) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  if ('filter' in ctx) ctx.filter = 'blur(' + (size * 0.008).toFixed(2) + 'px)';
  ctx.fillStyle = '#fff';
  drawNumeralPath(ctx, size, n);
  if ('filter' in ctx) ctx.filter = 'none';
  return ctx.getImageData(0, 0, size, size).data;
}

// Normal map por cara: el relieve del bronce (rotado según la cara, para que
// las veinte no repitan el mismo patrón) más el hueco del numeral encima.
function makeFaceNormal(heightCanvas, n, maxAniso) {
  var size = NSIZE;
  var scratch = document.createElement('canvas');
  scratch.width = scratch.height = size;
  var sctx = scratch.getContext('2d');
  sctx.save();
  sctx.translate(size / 2, size / 2);
  sctx.rotate((n % 4) * Math.PI / 2);
  if (n % 2) sctx.scale(-1, 1);
  sctx.drawImage(heightCanvas, -size / 2, -size / 2, size, size);
  sctx.restore();
  var bronze = sctx.getImageData(0, 0, size, size).data;
  var carve = numeralHeight(n, size);

  var height = new Float32Array(size * size);
  for (var i = 0; i < height.length; i++) {
    // El numeral resta: está hundido en el metal.
    height[i] = (bronze[i * 4] / 255) * 0.22 - (carve[i * 4] / 255);
  }

  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  var strength = 3.4;
  function at(x, y) {
    x = x < 0 ? 0 : x >= size ? size - 1 : x;
    y = y < 0 ? 0 : y >= size ? size - 1 : y;
    return height[y * size + x];
  }
  for (var y2 = 0; y2 < size; y2++) {
    for (var x2 = 0; x2 < size; x2++) {
      var dx = (at(x2 + 1, y2) - at(x2 - 1, y2)) * strength;
      var dy = (at(x2, y2 + 1) - at(x2, y2 - 1)) * strength;
      var len = Math.sqrt(dx * dx + dy * dy + 1);
      var p = (y2 * size + x2) * 4;
      img.data[p] = Math.round((-dx / len * 0.5 + 0.5) * 255);
      img.data[p + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
      img.data[p + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso, false);
}

// Cada cara: el mismo bronce compartido (rotado), el brillo de las aristas
// gastadas y el numeral entintado.
function makeFaceTexture(bronze, n, maxAniso) {
  var size = SIZE;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((n % 4) * Math.PI / 2);
  if (n % 2) ctx.scale(-1, 1);
  ctx.drawImage(bronze, -size / 2, -size / 2, size, size);
  ctx.restore();

  // Un dado usado se gasta por los bordes: ahí el metal queda pulido y claro,
  // mientras el centro de la cara junta suciedad. Es al revés de lo que uno
  // dibujaría por instinto, y es lo que lo hace parecer un objeto manoseado.
  var wear = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.20, size * 0.5, size * 0.5, size * 0.60);
  wear.addColorStop(0, 'rgba(224,172,92,0)');
  wear.addColorStop(0.74, 'rgba(224,172,92,0.10)');
  wear.addColorStop(1, 'rgba(240,196,124,0.30)');
  ctx.fillStyle = wear;
  ctx.fillRect(0, 0, size, size);

  var dirt = ctx.createRadialGradient(size * 0.5, size * 0.44, size * 0.02, size * 0.5, size * 0.44, size * 0.34);
  dirt.addColorStop(0, 'rgba(30,38,28,0.42)');
  dirt.addColorStop(1, 'rgba(38,44,32,0)');
  ctx.fillStyle = dirt;
  ctx.fillRect(0, 0, size, size);

  // El numeral: primero el labio pulido del corte, corrido hacia arriba a la
  // izquierda, y encima la tinta oscura con verdín del fondo del grabado.
  var off = size * 0.006;
  ctx.save();
  ctx.translate(-off, -off);
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = '#f7dcae';
  drawNumeralPath(ctx, size, n);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = '#120e07';
  drawNumeralPath(ctx, size, n);
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = '#2c5443';
  drawNumeralPath(ctx, size, n);
  ctx.restore();

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso, true);
}

// Devuelve { mesh, geometry, faceNormals, faceNumbers } listo para la escena.
export function buildDie(radius, maxAniso) {
  var built = buildGeometry(radius);
  var faceNormals = built.faceNormals;
  var faceNumbers = assignFaceNumbers(faceNormals);

  // El ruido y los mapas compartidos se calculan una sola vez: lo caro es el
  // ruido, no el numeral.
  var field = makeNoiseField(SIZE, 1337);
  var bronze = makeBronzeCanvas(SIZE, field);
  var height = makeHeightCanvas(SIZE, makeFineField(SIZE, 1337));
  var materialMap = makeMaterialMap(SIZE, field, maxAniso);

  var materials = [];
  for (var f = 0; f < 20; f++) {
    var n = faceNumbers[f];
    materials.push(new THREE.MeshStandardMaterial({
      map: makeFaceTexture(bronze, n, maxAniso),
      normalMap: makeFaceNormal(height, n, maxAniso),
      normalScale: new THREE.Vector2(1, 1),
      roughnessMap: materialMap,
      metalnessMap: materialMap,
      roughness: 1,
      metalness: 1,
      envMapIntensity: 1.15
    }));
  }

  return {
    mesh: new THREE.Mesh(built.geometry, materials),
    geometry: built.geometry,
    faceNormals: faceNormals,
    faceNumbers: faceNumbers
  };
}

// Qué cara mira hacia arriba dada una orientación: la normal más alineada con +Y.
export function readTopFace(faceNormals, faceNumbers, quaternion) {
  var up = new THREE.Vector3(0, 1, 0);
  var v = new THREE.Vector3();
  var bestFace = 0, bestDot = -Infinity;
  for (var f = 0; f < 20; f++) {
    v.copy(faceNormals[f]).applyQuaternion(quaternion);
    var dot = v.dot(up);
    if (dot > bestDot) { bestDot = dot; bestFace = f; }
  }
  return faceNumbers[bestFace];
}
