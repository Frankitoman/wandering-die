// The Wandering Die — el Destiny Dice, con simulación física real.
//
// El número NO se decide de antemano: se tira el dado en un mundo con gravedad,
// rebota y rueda sobre una bandeja de madera, y cuando se detiene se lee qué
// cara quedó mirando hacia arriba. El resultado es consecuencia de la física,
// como en una mesa de verdad.
//
// Lo único dirigido es la presentación: una vez que el dado se frenó y el
// número ya está decidido, se lo endereza sobre la cara ganadora y la cámara
// se acomoda encima. Eso no toca el resultado, sólo hace que se lea.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { buildDie, buildEnvironment, readTopFace } from './die-mesh.js';

(function (global) {
  'use strict';

  var RADIUS = 1;
  var TRAY = 2.3;            // semi-extensión de la bandeja: el dado no sale de acá
  var REST_Y = 0.7947;       // altura del centro con una cara apoyada (radio 1)
  var SETTLE_TIMEOUT = 8000; // si queda trabado, se lee igual y listo
  var CAM = new THREE.Vector3(0, 6.2, 5.2);

  var renderer, scene, camera, world, dieMesh, dieBody;
  var faceNormals = [], faceNumbers = [];
  var rafId = null, lastTime = null, rolling = false, settleTimer = null;
  var onSettle = null, reduce = false, ready = false;

  // Encuadre: la cámara siempre mira a `focus` desde el mismo ángulo, sólo que
  // más cerca o más lejos. Al frenarse el dado, `focus` se va hacia donde quedó
  // y `zoom` baja: el dado termina centrado y más grande, sin importar en qué
  // rincón de la bandeja cayó.
  var focus = new THREE.Vector3(), focusTarget = new THREE.Vector3();
  var zoom = 1, zoomTarget = 1;

  // Enderezado posterior a la tirada.
  var straighten = null;

  function buildScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene = new THREE.Scene();
    // El bronce es metal: casi todo lo que se ve son reflejos del entorno.
    scene.environment = buildEnvironment(renderer);

    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.copy(CAM);
    camera.lookAt(0, 0, 0);

    // Con entorno, las luces sólo agregan el punto de brillo y la sombra.
    scene.add(new THREE.HemisphereLight(0xfff1d4, 0x5f5744, 0.32));
    var key = new THREE.DirectionalLight(0xffe6bd, 1.5);
    key.position.set(3.5, 8, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top = 4;
    key.shadow.radius = 3;
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xdcd6bd, 0.3);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    // Nada de bandeja de madera: era un disco marrón que, cuando la cámara se
    // corre para seguir al dado, se corta y deja media pantalla café y media
    // pergamino. Acá el suelo es sólo sombra sobre el papel de la ficha, así
    // que el dado se apoya en la página misma y no hay borde que se note.
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    var die = buildDie(RADIUS, renderer.capabilities.getMaxAnisotropy());
    dieMesh = die.mesh;
    dieMesh.castShadow = true;
    faceNormals = die.faceNormals;
    faceNumbers = die.faceNumbers;
    scene.add(dieMesh);
  }

  // Parámetros calibrados corriendo esta misma simulación 6000 veces sin
  // navegador (ver scratchpad/phys-test): con estos valores la tirada dura 3,15s
  // de mediana, el 90% termina antes de 4s, nunca queda trabada, y la
  // distribución de 1..20 pasa el chi cuadrado (χ²=24,8 sobre 19 grados de
  // libertad, crítico 30,1). Gravedad más baja y poca amortiguación: es lo que
  // le da el rodado largo y el suspenso.
  function buildWorld() {
    world = new CANNON.World({ gravity: new CANNON.Vec3(0, -20, 0) });
    world.allowSleep = true;
    world.defaultContactMaterial.friction = 0.30;
    world.defaultContactMaterial.restitution = 0.32;

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

    // El collider es el icosaedro de aristas vivas, no el sólido redondeado que
    // se ve: un dado que rueda sobre sus aristas se frena; uno redondeado rueda
    // como una bola y no se decide nunca.
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
      sleepSpeedLimit: 0.18,
      sleepTimeLimit: 0.24,
      linearDamping: 0.08,
      angularDamping: 0.16
    });
    world.addBody(dieBody);
    dieBody.addEventListener('sleep', finishRoll);
  }

  function currentQuaternion() {
    return new THREE.Quaternion(dieBody.quaternion.x, dieBody.quaternion.y, dieBody.quaternion.z, dieBody.quaternion.w);
  }

  // Cara ganadora exactamente hacia arriba, sin mover el dado de lugar: la
  // corrección mínima que lleva su normal a +Y. El número ya está decidido, así
  // que esto no lo cambia; sólo evita que el dado quede recostado y no se lea.
  function flatPose(quaternion) {
    var best = 0, bestDot = -Infinity;
    var v = new THREE.Vector3();
    for (var f = 0; f < 20; f++) {
      v.copy(faceNormals[f]).applyQuaternion(quaternion);
      if (v.y > bestDot) { bestDot = v.y; best = f; }
    }
    v.copy(faceNormals[best]).applyQuaternion(quaternion).normalize();
    var delta = new THREE.Quaternion().setFromUnitVectors(v, new THREE.Vector3(0, 1, 0));
    return delta.multiply(quaternion);
  }

  function finishRoll() {
    if (!rolling) return;
    rolling = false;
    if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }

    var quaternion = currentQuaternion();
    var value = readTopFace(faceNormals, faceNumbers, quaternion);

    // El cuerpo físico se duerme acá; de la presentación se encarga el frame.
    dieBody.sleep();
    straighten = {
      t: 0,
      fromQ: quaternion,
      toQ: flatPose(quaternion),
      fromP: new THREE.Vector3(dieBody.position.x, dieBody.position.y, dieBody.position.z),
      toP: new THREE.Vector3(dieBody.position.x, REST_Y * RADIUS, dieBody.position.z)
    };
    focusTarget.set(dieBody.position.x, 0, dieBody.position.z);
    zoomTarget = 0.8;

    if (typeof onSettle === 'function') onSettle(value);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = lastTime == null ? 1 / 60 : Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    if (world && !straighten) world.step(1 / 60, dt, 4);

    if (dieMesh && dieBody) {
      if (straighten) {
        straighten.t = Math.min(1, straighten.t + dt / 0.42);
        var e = 1 - Math.pow(1 - straighten.t, 3);
        dieMesh.position.lerpVectors(straighten.fromP, straighten.toP, e);
        dieMesh.quaternion.slerpQuaternions(straighten.fromQ, straighten.toQ, e);
        if (straighten.t >= 1) {
          dieBody.position.copy(straighten.toP);
          dieBody.quaternion.set(straighten.toQ.x, straighten.toQ.y, straighten.toQ.z, straighten.toQ.w);
          straighten = null;
        }
      } else {
        dieMesh.position.set(dieBody.position.x, dieBody.position.y, dieBody.position.z);
        dieMesh.quaternion.set(dieBody.quaternion.x, dieBody.quaternion.y, dieBody.quaternion.z, dieBody.quaternion.w);
      }
    }

    focus.lerp(focusTarget, 1 - Math.pow(0.001, dt));
    zoom += (zoomTarget - zoom) * (1 - Math.pow(0.004, dt));
    if (camera) {
      camera.position.set(focus.x + CAM.x * zoom, CAM.y * zoom, focus.z + CAM.z * zoom);
      camera.lookAt(focus.x, REST_Y * RADIUS, focus.z);
    }
    if (renderer) renderer.render(scene, camera);
  }

  // El lienzo empieza oculto (la bandeja no se muestra hasta elegir una
  // decisión), así que al iniciarse mide 0×0 y el render sale a la resolución
  // de respaldo y después se estira: por eso el dado se veía borroso. Con un
  // ResizeObserver se ajusta en cuanto el elemento tiene tamaño de verdad.
  function resize() {
    if (!renderer) return;
    var el = renderer.domElement;
    var w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Deja el dado apoyado y quieto en el centro.
  function restDie() {
    straighten = null;
    dieBody.position.set(0, REST_Y * RADIUS, 0);
    dieBody.velocity.setZero();
    dieBody.angularVelocity.setZero();
    dieBody.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    var flat = flatPose(currentQuaternion());
    dieBody.quaternion.set(flat.x, flat.y, flat.z, flat.w);
    dieBody.sleep();
    focus.set(0, 0, 0); focusTarget.set(0, 0, 0);
    zoom = zoomTarget = 1;
  }

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
        if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
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
    straighten = null;
    focusTarget.set(0, 0, 0);
    zoomTarget = 1;

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
    dieBody.position.set(Math.cos(angle) * TRAY * 0.55, 5.2 + Math.random(), Math.sin(angle) * TRAY * 0.55);
    dieBody.quaternion.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    dieBody.velocity.set(-Math.cos(angle) * (4 + Math.random() * 2.5), 1 + Math.random(), -Math.sin(angle) * (4 + Math.random() * 2.5));
    dieBody.angularVelocity.set((Math.random() - 0.5) * 32, (Math.random() - 0.5) * 32, (Math.random() - 0.5) * 32);

    settleTimer = setTimeout(function () {
      // Red de seguridad: si quedó trabado contra un borde, se frena y se lee.
      dieBody.velocity.scale(0.1, dieBody.velocity);
      dieBody.angularVelocity.scale(0.1, dieBody.angularVelocity);
      finishRoll();
    }, SETTLE_TIMEOUT);
    return true;
  }

  global.WD3D = { init: init, roll: roll, resize: resize, isRolling: function () { return rolling; } };
  window.dispatchEvent(new Event('wd3d-ready'));
})(window);
