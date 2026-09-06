// The Wandering Die — el Destiny Dice, con simulación física real.
//
// A diferencia de la versión anterior (una animación dirigida que ya sabía el
// resultado antes de empezar), acá el número NO se decide de antemano: se tira
// el dado en un mundo con gravedad, rebota y rueda sobre una bandeja de madera,
// y cuando se detiene se lee qué cara quedó mirando hacia arriba. El resultado
// es consecuencia de la física, como en una mesa de verdad.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { buildDie, readTopFace } from './die-mesh.js';

(function (global) {
  'use strict';

  var RADIUS = 1;
  var TRAY = 3.4;            // semi-extensión de la bandeja: el dado no sale de acá
  var SETTLE_TIMEOUT = 7000; // si queda trabado, se lee igual y listo

  var renderer, scene, camera, world, dieMesh, dieBody;
  var faceNormals = [], faceNumbers = [];
  var rafId = null, lastTime = null, rolling = false, settleTimer = null;
  var onSettle = null, reduce = false;

  function buildScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 7.6, 5.8);
    camera.lookAt(0, 0, 0);

    // Luz de tarde en el bosque: clave cálida alta, relleno verde desde abajo.
    scene.add(new THREE.HemisphereLight(0xfff1d4, 0x51603a, 0.9));
    var key = new THREE.DirectionalLight(0xffd9a0, 2.0);
    key.position.set(4, 9, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -6;
    key.shadow.camera.right = key.shadow.camera.top = 6;
    key.shadow.radius = 3;
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xc6e493, 0.45);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    // Bandeja de madera: recibe la sombra y da referencia de escala y material.
    var tray = new THREE.Mesh(
      new THREE.CircleGeometry(TRAY * 1.2, 64),
      new THREE.MeshStandardMaterial({ color: 0x6f4f31, roughness: 0.88, metalness: 0 })
    );
    tray.rotation.x = -Math.PI / 2;
    tray.receiveShadow = true;
    scene.add(tray);

    var die = buildDie(RADIUS, renderer.capabilities.getMaxAnisotropy());
    dieMesh = die.mesh;
    dieMesh.castShadow = true;
    faceNormals = die.faceNormals;
    faceNumbers = die.faceNumbers;
    scene.add(dieMesh);
  }

  // Parámetros calibrados corriendo esta misma simulación 2000 veces sin navegador
  // (ver scratchpad/phys-test): con estos valores el dado se asienta en ~2.1s de
  // media, nunca pasa de 3.5s, nunca queda chueco, y la distribución de 1..20 es
  // pareja (min 86 / max 113 sobre 2000 tiradas, esperado 100). Gravedad más alta
  // de lo real y bastante amortiguación: sin eso tarda 3.5s de media y aburre.
  function buildWorld() {
    world = new CANNON.World({ gravity: new CANNON.Vec3(0, -34, 0) });
    world.allowSleep = true;
    world.defaultContactMaterial.friction = 0.35;
    world.defaultContactMaterial.restitution = 0.2;

    var floor = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floor);

    // Paredes invisibles: el dado tiene que quedar siempre dentro del encuadre.
    [[0, 0, -TRAY, 0, 0, 0], [0, 0, TRAY, 0, Math.PI, 0],
     [-TRAY, 0, 0, 0, Math.PI / 2, 0], [TRAY, 0, 0, 0, -Math.PI / 2, 0]
    ].forEach(function (w) {
      var body = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      body.position.set(w[0], w[1], w[2]);
      body.quaternion.setFromEuler(w[3], w[4], w[5]);
      world.addBody(body);
    });

    // El collider es el mismo icosaedro que se ve, no una esfera aproximada:
    // es lo que hace que se apoye sobre una cara en vez de rodar sin fin.
    var geo = new THREE.IcosahedronGeometry(RADIUS, 0);
    var pos = geo.attributes.position;
    var unique = [], indices = [], map = {};
    for (var i = 0; i < pos.count; i++) {
      var key = [pos.getX(i).toFixed(4), pos.getY(i).toFixed(4), pos.getZ(i).toFixed(4)].join(',');
      if (!(key in map)) {
        map[key] = unique.length;
        unique.push(new CANNON.Vec3(pos.getX(i), pos.getY(i), pos.getZ(i)));
      }
      indices.push(map[key]);
    }
    var faces = [];
    for (var f = 0; f < 20; f++) faces.push([indices[f * 3], indices[f * 3 + 1], indices[f * 3 + 2]]);

    dieBody = new CANNON.Body({
      mass: 0.35,
      shape: new CANNON.ConvexPolyhedron({ vertices: unique, faces: faces }),
      allowSleep: true,
      sleepSpeedLimit: 0.28,
      sleepTimeLimit: 0.18,
      linearDamping: 0.18,
      angularDamping: 0.3
    });
    world.addBody(dieBody);
    dieBody.addEventListener('sleep', finishRoll);
  }

  function currentQuaternion() {
    return new THREE.Quaternion(dieBody.quaternion.x, dieBody.quaternion.y, dieBody.quaternion.z, dieBody.quaternion.w);
  }

  function finishRoll() {
    if (!rolling) return;
    rolling = false;
    if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
    var value = readTopFace(faceNormals, faceNumbers, currentQuaternion());
    if (typeof onSettle === 'function') onSettle(value);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = lastTime == null ? 1 / 60 : Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    if (world) world.step(1 / 60, dt, 4);
    if (dieMesh && dieBody) {
      dieMesh.position.set(dieBody.position.x, dieBody.position.y, dieBody.position.z);
      dieMesh.quaternion.set(dieBody.quaternion.x, dieBody.quaternion.y, dieBody.quaternion.z, dieBody.quaternion.w);
    }
    if (renderer) renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer) return;
    var el = renderer.domElement;
    var w = el.clientWidth || 320, h = el.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Deja el dado apoyado y quieto en el centro.
  function restDie() {
    dieBody.position.set(0, RADIUS * 0.92, 0);
    dieBody.velocity.setZero();
    dieBody.angularVelocity.setZero();
    dieBody.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dieBody.sleep();
  }

  var ready = false;

  function init(canvas) {
    if (!canvas) return false;
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Los numerales se graban en canvas con Marcellus: si la tipografía todavía
    // no cargó, las caras saldrían con la fuente de respaldo y quedarían así
    // para siempre. Esperamos a que esté antes de construir el dado.
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fonts.then(function () {
      try {
        buildScene(canvas);
        buildWorld();
        resize();
        window.addEventListener('resize', resize, { passive: true });
        restDie();
        rafId = requestAnimationFrame(frame);
        ready = true;
      } catch (err) {
        console.warn('[wd3d] no se pudo iniciar el dado 3D:', err);
      }
    });
    return true;
  }

  // Tira el dado de verdad: posición y fuerzas al azar, y que la física decida.
  function roll(callback) {
    if (!ready || !world || rolling) return false;
    onSettle = callback;

    if (reduce) {
      // Sin movimiento: se resuelve al instante y se muestra la cara resultante.
      restDie();
      var value = readTopFace(faceNormals, faceNumbers, currentQuaternion());
      if (typeof callback === 'function') setTimeout(function () { callback(value); }, 120);
      return true;
    }

    rolling = true;
    dieBody.wakeUp();
    var angle = Math.random() * Math.PI * 2;
    dieBody.position.set(Math.cos(angle) * TRAY * 0.55, 4.6 + Math.random() * 1.2, Math.sin(angle) * TRAY * 0.55);
    dieBody.quaternion.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    dieBody.velocity.set(-Math.cos(angle) * (5 + Math.random() * 3), 1 + Math.random(), -Math.sin(angle) * (5 + Math.random() * 3));
    dieBody.angularVelocity.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 26);

    settleTimer = setTimeout(function () {
      // Red de seguridad: si quedó trabado contra un borde, se frena y se lee.
      dieBody.velocity.scale(0.1, dieBody.velocity);
      dieBody.angularVelocity.scale(0.1, dieBody.angularVelocity);
      finishRoll();
    }, SETTLE_TIMEOUT);
    return true;
  }

  global.WD3D = { init: init, roll: roll, isRolling: function () { return rolling; } };
  window.dispatchEvent(new Event('wd3d-ready'));
})(window);
