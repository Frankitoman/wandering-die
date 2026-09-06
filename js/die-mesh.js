// The Wandering Die — construcción del d20 numerado.
// Compartido por el dado de vitrina del hero (hero3d.js) y el dado con físicas
// reales del Destiny Dice (dice3d.js), para que sean literalmente el mismo objeto.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Triángulo UV inscripto por cara, con el winding del orden CCW de la geometría
// para que los numerales no salgan espejados.
var UV_PATTERN = [0.5, 0.92, 0.08, 0.08, 0.92, 0.08];
var UV_CENTROID_V = (UV_PATTERN[1] + UV_PATTERN[3] + UV_PATTERN[5]) / 3;

export function buildGeometry(radius) {
  var geometry = new THREE.IcosahedronGeometry(radius, 0);
  var uvArray = new Float32Array(60 * 2);
  for (var f = 0; f < 20; f++) {
    uvArray.set(UV_PATTERN, f * 6);
    geometry.addGroup(f * 3, 3, f);
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
  return geometry;
}

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

function configureTexture(tex, maxAniso) {
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = maxAniso;
  return tex;
}

/* ---------------------------------------------------------------- material
   El dado es piedra tallada y gastada, no un sólido perfecto. Todo lo de acá
   abajo existe para romper esa perfección: un campo de ruido fractal que
   modula el color, vetas, motas minerales, suciedad acumulada en los bordes
   y — lo que más se nota — un normal map derivado del mismo ruido, para que
   la luz agarre el relieve en vez de resbalar sobre una superficie lisa.
   El ruido se calcula UNA vez y se comparte entre las veinte caras; lo único
   que se dibuja por cara es el numeral. */

var SIZE = 512;

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
      var v = octave(x, y, 0.012) * 0.44 +
              octave(x, y, 0.035) * 0.24 +
              octave(x, y, 0.09) * 0.15 +
              octave(x, y, 0.26) * 0.10 +
              octave(x, y, 0.62) * 0.07; // grano fino: el poro de la piedra
      field[y * size + x] = v;
    }
  }
  return field;
}

// Piedra clara veteada: el ruido decide el tono, más motas oscuras dispersas.
function makeStoneCanvas(size, field) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);

  for (var i = 0, p = 0; i < field.length; i++, p += 4) {
    var n = field[i];
    // De hueso claro (#f2e6cd) a piedra tostada (#b49b74), según el ruido.
    var t = Math.min(1, Math.max(0, (n - 0.28) * 2.1));
    img.data[p]     = 242 - t * 62;
    img.data[p + 1] = 230 - t * 75;
    img.data[p + 2] = 205 - t * 89;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // Motas minerales: puntitos oscuros que rompen la uniformidad.
  ctx.globalAlpha = 0.5;
  for (var s = 0; s < Math.round(size * 1.6); s++) {
    var r = Math.random() * 1.5 + 0.3;
    ctx.fillStyle = Math.random() > 0.35 ? '#6d5c42' : '#3f3527';
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, 6.283);
    ctx.fill();
  }
  // Vetas: trazos largos y tenues, como la piedra real.
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#8a7355';
  for (var v2 = 0; v2 < 7; v2++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 2.4 + 0.6;
    var x0 = Math.random() * size, y0 = Math.random() * size;
    ctx.moveTo(x0, y0);
    for (var k = 0; k < 4; k++) {
      x0 += (Math.random() - 0.5) * size * 0.5;
      y0 += (Math.random() - 0.5) * size * 0.5;
      ctx.lineTo(x0, y0);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

// Normal map derivado del mismo campo de altura, por gradiente (Sobel simple).
// Sin esto el dado sigue leyéndose como plástico liso por más textura pintada
// que tenga: es la luz la que tiene que tropezar con el relieve.
function makeNormalTexture(size, field, maxAniso) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  var strength = 6.5; // suficiente para que el relieve se lea, no tanto como para
                       // que la piedra parezca corcho

  function at(x, y) {
    x = x < 0 ? 0 : x >= size ? size - 1 : x;
    y = y < 0 ? 0 : y >= size ? size - 1 : y;
    return field[y * size + x];
  }
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      var dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      var len = Math.sqrt(dx * dx + dy * dy + 1);
      var p = (y * size + x) * 4;
      img.data[p]     = Math.round((-dx / len * 0.5 + 0.5) * 255);
      img.data[p + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
      img.data[p + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// Cuatro variantes del mismo relieve, rotadas 90°, para que no se repita el
// idéntico patrón en las veinte caras. Al rotar un normal map no alcanza con
// rotar la imagen: hay que rotar también los vectores que codifica, o la luz
// pega desde el lado equivocado. Para 90° eso es permutar y negar R y G.
function rotatedNormalVariants(normalCanvas, maxAniso) {
  var size = normalCanvas.width;
  var out = [];
  for (var k = 0; k < 4; k++) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(k * Math.PI / 2);
    ctx.drawImage(normalCanvas, -size / 2, -size / 2);
    ctx.restore();

    if (k) {
      var img = ctx.getImageData(0, 0, size, size);
      var d = img.data;
      for (var p = 0; p < d.length; p += 4) {
        var r = d[p], g = d[p + 1];
        // (x,y) -> (y,-x) por cada 90° de rotación
        for (var t = 0; t < k; t++) {
          var nr = g, ng = 255 - r;
          r = nr; g = ng;
        }
        d[p] = r; d[p + 1] = g;
      }
      ctx.putImageData(img, 0, 0);
    }
    out.push(configureTexture(new THREE.CanvasTexture(c), maxAniso));
  }
  return out;
}

// Rugosidad variable: las zonas gastadas brillan un poco más que las picadas.
function makeRoughnessTexture(size, field, maxAniso) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  for (var i = 0, p = 0; i < field.length; i++, p += 4) {
    var v = 120 + field[i] * 110;
    img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

function drawNumeral(ctx, size, n) {
  var y = size * (1 - UV_CENTROID_V);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 ' + Math.round(size * 0.26) + 'px "Marcellus", Georgia, serif';

  // El numeral está tallado: primero la sombra interna del hueco, después la
  // tinta gastada encima. Un relleno plano se lee como calcomanía.
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#8a7a5c';
  ctx.fillText(String(n), size * 0.5 + size * 0.004, y + size * 0.005);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#2f3d26';
  ctx.fillText(String(n), size * 0.5, y);

  // El 6 y el 9 llevan subrayado, igual que en un dado de verdad.
  if (n === 6 || n === 9) {
    var w = size * 0.11;
    ctx.fillRect(size * 0.5 - w / 2, y + size * 0.15, w, size * 0.016);
  }
  ctx.restore();
}

// Cada cara: la misma piedra compartida + suciedad en los bordes + su numeral.
function makeFaceTexture(stone, n, maxAniso) {
  var size = SIZE;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');

  // La piedra se dibuja rotada y espejada según la cara, así no se repite el
  // mismo patrón veinte veces.
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((n % 4) * Math.PI / 2);
  if (n % 2) ctx.scale(-1, 1);
  ctx.drawImage(stone, -size / 2, -size / 2);
  ctx.restore();

  // Los bordes de un dado usado están más sucios y más oscuros que el centro.
  var vign = ctx.createRadialGradient(size * 0.5, size * 0.52, size * 0.16, size * 0.5, size * 0.52, size * 0.62);
  vign.addColorStop(0, 'rgba(60,48,30,0)');
  vign.addColorStop(1, 'rgba(60,48,30,0.34)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, size, size);

  drawNumeral(ctx, size, n);
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

// Devuelve { mesh, geometry, faceNormals, faceNumbers } listo para agregar a una escena.
export function buildDie(radius, maxAniso) {
  var geometry = buildGeometry(radius);
  var faceNormals = faceNormalsOf(geometry);
  var faceNumbers = assignFaceNumbers(faceNormals);

  // El campo de ruido y los mapas se calculan una sola vez y los comparten las
  // veinte caras: lo caro es el ruido, no el numeral.
  var field = makeNoiseField(SIZE, 1337);
  var stone = makeStoneCanvas(SIZE, field);
  var normals = rotatedNormalVariants(makeNormalTexture(SIZE, field, maxAniso), maxAniso);
  var roughnessMap = makeRoughnessTexture(SIZE, field, maxAniso);

  var materials = [];
  for (var f = 0; f < 20; f++) {
    materials.push(new THREE.MeshStandardMaterial({
      map: makeFaceTexture(stone, faceNumbers[f], maxAniso),
      normalMap: normals[f % 4],
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: roughnessMap,
      roughness: 0.82,
      metalness: 0.0
    }));
  }
  var mesh = new THREE.Mesh(geometry, materials);
  return { mesh: mesh, geometry: geometry, faceNormals: faceNormals, faceNumbers: faceNumbers };
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
