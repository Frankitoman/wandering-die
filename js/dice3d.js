// The Wandering Die — real 3D d20 (icosahedron) rendered with Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  var renderer, scene, camera, dieGroup;
  var rolling = false;
  var rollStart = 0;
  var rollDuration = 950;
  var startQuat = new THREE.Quaternion();
  var targetQuat = new THREE.Quaternion();
  var idleTime = 0;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function randomQuat() {
    var q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(
      Math.PI * (4 + Math.random() * 3),
      Math.PI * (4 + Math.random() * 3),
      Math.random() * Math.PI * 2
    ));
    return q;
  }

  function init(canvas) {
    if (!canvas) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      return false;
    }
    if (!renderer) return false;

    var size = 170;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 10);
    camera.position.set(0, 0, 4.3);

    scene.add(new THREE.AmbientLight(0x2a2140, 1.15));
    var key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2, 3, 4);
    scene.add(key);
    var rim = new THREE.PointLight(0xb79bff, 2.4, 14);
    rim.position.set(-3, -1.4, 2.2);
    scene.add(rim);
    var back = new THREE.PointLight(0x8c6fe0, 1.6, 14);
    back.position.set(0.5, -2.2, -3);
    scene.add(back);

    var geometry = new THREE.IcosahedronGeometry(1.32, 0);
    var material = new THREE.MeshPhysicalMaterial({
      color: 0x261e37,
      metalness: 0.4,
      roughness: 0.24,
      clearcoat: 0.65,
      clearcoatRoughness: 0.22,
      reflectivity: 0.55
    });
    var mesh = new THREE.Mesh(geometry, material);

    var edgesGeom = new THREE.EdgesGeometry(geometry);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0xcfd2e0, transparent: true, opacity: 0.6 });
    var edges = new THREE.LineSegments(edgesGeom, edgesMat);

    dieGroup = new THREE.Group();
    dieGroup.add(mesh);
    dieGroup.add(edges);
    dieGroup.rotation.set(0.45, 0.65, 0);
    scene.add(dieGroup);

    startQuat.copy(dieGroup.quaternion);
    targetQuat.copy(dieGroup.quaternion);

    requestAnimationFrame(animate);
    return true;
  }

  function startRoll() {
    if (!renderer || !dieGroup) return;
    rolling = true;
    rollStart = performance.now();
    startQuat.copy(dieGroup.quaternion);
    targetQuat = randomQuat();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer || !dieGroup) return;

    if (rolling) {
      var elapsed = performance.now() - rollStart;
      var progress = Math.min(elapsed / rollDuration, 1);
      var eased = easeOutCubic(progress);
      dieGroup.quaternion.slerpQuaternions(startQuat, targetQuat, eased);
      dieGroup.position.y = Math.sin(progress * Math.PI) * 0.38;
      var s = 1 + Math.sin(progress * Math.PI) * 0.07;
      dieGroup.scale.set(s, s, s);
      if (progress >= 1) {
        rolling = false;
        startQuat.copy(dieGroup.quaternion);
      }
    } else {
      idleTime += 0.0045;
      dieGroup.rotation.y += 0.0035;
      dieGroup.position.y = Math.sin(idleTime) * 0.045;
    }
    renderer.render(scene, camera);
  }

  window.WD3D = { init: init, startRoll: startRoll };
  window.dispatchEvent(new Event('wd3d-ready'));
})();
