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

function drawNumeral(ctx, size, n, color) {
  ctx.font = '700 ' + Math.round(size * 0.26) + 'px "Marcellus", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  var y = size * (1 - UV_CENTROID_V);
  ctx.fillText(String(n), size * 0.5, y);
  // El 6 y el 9 llevan subrayado, igual que en un dado de verdad.
  if (n === 6 || n === 9) {
    var w = size * 0.11;
    ctx.fillRect(size * 0.5 - w / 2, y + size * 0.15, w, size * 0.016);
  }
}

// Hueso pulido, veta cálida, numeral en tinta verde oscura.
function makeFaceTexture(n, maxAniso) {
  var size = 384;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');

  var grad = ctx.createRadialGradient(size * 0.36, size * 0.3, size * 0.08, size * 0.5, size * 0.55, size * 0.8);
  grad.addColorStop(0, '#f7ecd6');
  grad.addColorStop(0.6, '#e6d5b3');
  grad.addColorStop(1, '#cab68e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  drawNumeral(ctx, size, n, '#2c3a24');
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

function makeRoughnessTexture(maxAniso) {
  var size = 128;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(size, size);
  for (var i = 0; i < img.data.length; i += 4) {
    var v = 132 + (Math.random() * 46 - 23);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

// Devuelve { mesh, geometry, faceNormals, faceNumbers } listo para agregar a una escena.
export function buildDie(radius, maxAniso) {
  var geometry = buildGeometry(radius);
  var faceNormals = faceNormalsOf(geometry);
  var faceNumbers = assignFaceNumbers(faceNormals);
  var rough = makeRoughnessTexture(maxAniso);

  var materials = [];
  for (var f = 0; f < 20; f++) {
    materials.push(new THREE.MeshStandardMaterial({
      map: makeFaceTexture(faceNumbers[f], maxAniso),
      roughnessMap: rough,
      roughness: 0.6,
      metalness: 0.05
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
