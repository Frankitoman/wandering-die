// The Wandering Die — real 3D d20 (icosahedron, one numbered face 1-20) rendered with Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  var SIZE = 190;
  var RADIUS = 1.0; // kept safely inside the camera's visible frustum so vertices never clip the frame
  var SPIN_DURATION = 1900;   // fast decaying spin
  var SETTLE_DURATION = 750;  // ease into the resting orientation that shows the rolled number
  var ROLL_DURATION = SPIN_DURATION + SETTLE_DURATION;

  var renderer, scene, camera, dieGroup;
  var faceNormals = [], faceUps = [];
  var rollPhase = 'idle'; // idle | spin | settle
  var rollStart = 0, settleStart = 0;
  var spinAxis = new THREE.Vector3(1, 1, 1).normalize();
  var spinSpeedBase = 10;
  var settleStartQuat = new THREE.Quaternion();
  var settleTargetQuat = new THREE.Quaternion();
  var idleTime = 0;
  var lastTime = null;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function makeFaceTexture(n) {
    var size = 128;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createRadialGradient(size * 0.35, size * 0.28, size * 0.05, size * 0.5, size * 0.55, size * 0.78);
    grad.addColorStop(0, '#3c2f5c');
    grad.addColorStop(0.55, '#241d33');
    grad.addColorStop(1, '#130f1c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    var cx = size * 0.5, cy = size * 0.47;
    ctx.font = '600 ' + Math.round(size * 0.26) + 'px "EB Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e9e6f2';
    ctx.fillText(String(n), cx, cy);

    var tex = new THREE.CanvasTexture(canvas);
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function buildNumberedGeometry() {
    var geometry = new THREE.IcosahedronGeometry(RADIUS, 0);
    // Each face gets its own inscribed-triangle UV so its dedicated texture renders
    // centered on that face. Winding matches the geometry's outward CCW order
    // (verified against attributes.normal) so numerals aren't mirrored.
    var uvPattern = [0.5, 0.92, 0.08, 0.08, 0.92, 0.08];
    var uvArray = new Float32Array(60 * 2);
    for (var f = 0; f < 20; f++) {
      uvArray.set(uvPattern, f * 6);
      geometry.addGroup(f * 3, 3, f);
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
    return geometry;
  }

  function cacheFaceOrientations(geometry) {
    var pos = geometry.attributes.position;
    var vec = function (i) { return new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)); };
    for (var f = 0; f < 20; f++) {
      var i0 = f * 3, i1 = f * 3 + 1, i2 = f * 3 + 2;
      var v0 = vec(i0), v1 = vec(i1), v2 = vec(i2);
      var normal = new THREE.Vector3().subVectors(v1, v0).cross(new THREE.Vector3().subVectors(v2, v0)).normalize();
      var centroid = new THREE.Vector3().add(v0).add(v1).add(v2).multiplyScalar(1 / 3);
      // "up" reference = direction from centroid to vertex0 (the UV-top corner), flattened against the normal
      var up = new THREE.Vector3().subVectors(v0, centroid);
      up.addScaledVector(normal, -up.dot(normal)).normalize();
      faceNormals.push(normal);
      faceUps.push(up);
    }
  }

  // Orientation that puts face `faceIndex`'s normal toward the camera (+Z) with its
  // baked numeral roughly upright (its "up" reference aligned to world +Y).
  function computeFaceQuaternion(faceIndex) {
    var normal = faceNormals[faceIndex];
    var up = faceUps[faceIndex];
    var q1 = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
    var rotatedUp = up.clone().applyQuaternion(q1);
    var angle = Math.atan2(rotatedUp.x, rotatedUp.y);
    var q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
    return new THREE.Quaternion().multiplyQuaternions(q2, q1);
  }

  function init(canvas) {
    if (!canvas) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      return false;
    }
    if (!renderer) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(SIZE, SIZE, false);

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

    var geometry = buildNumberedGeometry();
    cacheFaceOrientations(geometry);

    var materials = [];
    for (var n = 1; n <= 20; n++) {
      materials.push(new THREE.MeshPhysicalMaterial({
        map: makeFaceTexture(n),
        metalness: 0.32,
        roughness: 0.3,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        reflectivity: 0.5
      }));
    }
    var mesh = new THREE.Mesh(geometry, materials);

    var edgesGeom = new THREE.EdgesGeometry(geometry);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0xcfd2e0, transparent: true, opacity: 0.55 });
    var edges = new THREE.LineSegments(edgesGeom, edgesMat);

    dieGroup = new THREE.Group();
    dieGroup.add(mesh);
    dieGroup.add(edges);
    dieGroup.quaternion.copy(computeFaceQuaternion(19)); // rest on "20" before the first roll
    scene.add(dieGroup);

    requestAnimationFrame(animate);
    return true;
  }

  function startRoll(resultNumber) {
    if (!renderer || !dieGroup) return;
    rollPhase = 'spin';
    rollStart = performance.now();
    lastTime = null;
    spinAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    spinSpeedBase = 9 + Math.random() * 5;
    var faceIndex = Math.max(1, Math.min(20, resultNumber || 20)) - 1;
    settleTargetQuat.copy(computeFaceQuaternion(faceIndex));
  }

  function animate(now) {
    requestAnimationFrame(animate);
    if (!renderer || !dieGroup) return;

    var dt = lastTime === null ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (rollPhase === 'spin') {
      var elapsed = now - rollStart;
      var p = Math.min(elapsed / SPIN_DURATION, 1);
      var speed = spinSpeedBase * Math.pow(1 - p, 1.7);
      var deltaQuat = new THREE.Quaternion().setFromAxisAngle(spinAxis, speed * dt);
      dieGroup.quaternion.premultiply(deltaQuat);
      dieGroup.position.y = Math.sin(p * Math.PI) * 0.34;
      var s = 1 + Math.sin(p * Math.PI) * 0.06;
      dieGroup.scale.set(s, s, s);
      if (p >= 1) {
        rollPhase = 'settle';
        settleStart = now;
        settleStartQuat.copy(dieGroup.quaternion);
      }
    } else if (rollPhase === 'settle') {
      var e2 = now - settleStart;
      var p2 = Math.min(e2 / SETTLE_DURATION, 1);
      var eased2 = easeOutCubic(p2);
      dieGroup.quaternion.slerpQuaternions(settleStartQuat, settleTargetQuat, eased2);
      dieGroup.position.y = Math.sin((1 - p2) * Math.PI * 0.5) * 0.1 * (1 - p2);
      var s2 = 1 + Math.sin((1 - p2) * Math.PI) * 0.015;
      dieGroup.scale.set(s2, s2, s2);
      if (p2 >= 1) {
        rollPhase = 'idle';
        dieGroup.quaternion.copy(settleTargetQuat);
        dieGroup.position.y = 0;
        dieGroup.scale.set(1, 1, 1);
      }
    } else {
      // resting: hold the landed orientation exactly, no idle drift once a result has landed
    }
    renderer.render(scene, camera);
  }

  window.WD3D = { init: init, startRoll: startRoll, ROLL_DURATION: ROLL_DURATION };
  window.dispatchEvent(new Event('wd3d-ready'));
})();
