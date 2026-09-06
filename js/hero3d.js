// The Wandering Die — el d20 de vitrina del hero.
//
// Misma pieza que el dado del Destiny Dice, pero tratada como objeto de museo:
// flota en el aire, gira despacio y sin fin, y responde al cursor girando hacia
// donde estás mirando. Sin física acá: esto es una vitrina, no una tirada.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { buildDie } from './die-mesh.js';

(function () {
  'use strict';

  var RADIUS = 1;
  var renderer, scene, camera, die, pivot;
  var pointer = { x: 0, y: 0 };   // objetivo, -1..1
  var eased = { x: 0, y: 0 };     // seguimiento amortiguado
  var dragging = false, dragPrev = null, dragSpin = 0;
  var spin = 0, reduce = false;

  function build(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);
    camera.lookAt(0, 0, 0);

    // Luz de galería: clave cálida marcada, relleno verde bosque, contraluz suave.
    scene.add(new THREE.HemisphereLight(0xfff2d8, 0x59683f, 1.0));
    var key = new THREE.DirectionalLight(0xffdca8, 2.4);
    key.position.set(3.5, 5, 4);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xd6efaa, 0.6);
    fill.position.set(-4, -1, 2);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(-2, 3, -5);
    scene.add(rim);

    die = buildDie(RADIUS, renderer.capabilities.getMaxAnisotropy());
    pivot = new THREE.Group();
    pivot.add(die.mesh);
    // Inclinación fija tipo vitrina: nunca se ve de frente y plano.
    pivot.rotation.x = 0.42;
    pivot.rotation.z = -0.14;
    scene.add(pivot);
  }

  function resize() {
    if (!renderer) return;
    var el = renderer.domElement;
    var w = el.clientWidth || 320, h = el.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function frame(now) {
    requestAnimationFrame(frame);

    // Giro continuo, lento. Es lo que hace que la pieza se lea como objeto y no
    // como imagen: siempre está mostrando una cara distinta.
    if (!reduce) spin += dragging ? 0 : 0.0035;
    spin += dragSpin;
    dragSpin *= 0.92;

    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;

    if (die) {
      die.mesh.rotation.y = spin;
      die.mesh.rotation.x = Math.sin(now / 3200) * 0.12;
    }
    if (pivot) {
      // El cursor inclina la vitrina entera, no el objeto: se siente como mirar
      // la pieza desde otro ángulo, no como que la pieza te persigue.
      pivot.rotation.x = 0.42 + eased.y * 0.22;
      pivot.rotation.y = eased.x * 0.36;
      pivot.position.y = Math.sin(now / 2600) * 0.09;
    }
    if (renderer) renderer.render(scene, camera);
  }

  function bindPointer(canvas) {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    window.addEventListener('pointermove', function (e) {
      if (!fine.matches || dragging) return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // Arrastrar sobre el dado lo hace girar, como una pieza que podés dar vuelta.
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; dragPrev = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging || dragPrev == null) return;
      dragSpin += (e.clientX - dragPrev) * 0.0016;
      dragPrev = e.clientX;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      canvas.addEventListener(ev, function () {
        dragging = false; dragPrev = null; canvas.style.cursor = 'grab';
      });
    });
    canvas.style.cursor = 'grab';
  }

  function init(canvas) {
    if (!canvas) return;
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Igual que en el dado del Destiny Dice: los numerales se graban en canvas,
    // así que hay que esperar a que Marcellus esté cargada.
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fonts.then(function () {
      try {
        build(canvas);
        resize();
        window.addEventListener('resize', resize, { passive: true });
        bindPointer(canvas);
        requestAnimationFrame(frame);
      } catch (err) {
        console.warn('[hero3d] no se pudo iniciar la vitrina 3D:', err);
        canvas.parentElement.classList.add('is-fallback');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    init(document.getElementById('heroDieCanvas'));
  });
})();
