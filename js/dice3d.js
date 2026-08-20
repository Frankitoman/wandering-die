// The Wandering Die — real 3D d20 (icosahedron, one numbered face 1-20) rendered with Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  var SIZE = 340; // internal render resolution; CSS scales the box responsively without
                   // touching this, so the bounce frame's proportions stay identical everywhere
  var CAMERA_DISTANCE = 7.7; // pulled back (with SIZE scaled to match) so the die keeps
                              // its on-screen size while gaining a much bigger bounce frame
  var RADIUS = 1.0; // kept safely inside the camera's visible frustum so vertices never clip the frame
  var ROLL_DURATION = 2800; // one continuous spin-to-stop, no separate correction phase

  var renderer, scene, camera, dieGroup;
  var faceNormals = [], faceUps = [];
  var rolling = false;
  var rollStart = 0;
  var rollTargetQuat = new THREE.Quaternion();

  // Rotation is ONE continuous formula for the entire roll (recomputed fresh from
  // progress `p` every frame, never accumulated) — the same technique proven to land
  // exactly on target with zero jerk. Computed once in startRoll from the die's
  // current orientation, so it can't be redirected mid-roll by anything below.
  var baseAxis = new THREE.Vector3(0, 1, 0);
  var baseStartQuat = new THREE.Quaternion();
  var baseTotalAngle = 0;

  // Billiard wobble: a small INSTANTANEOUS tilt (never accumulated) layered on top of
  // the base spin, recomputed fresh each frame from the current bounce velocity — its
  // axis flips the instant a wall reflects the velocity, and its whole contribution is
  // scaled by an envelope that is exactly 0 at p=1, so it can never affect the final,
  // already-decided orientation, only how the tumble looks along the way.
  var BOUNCE_BOUND = 0.68;
  var BOUNCE_PHASE_END = 0.68; // fraction of ROLL_DURATION spent bouncing before homing in
  var bouncePos = new THREE.Vector2(0, 0);
  var bounceVel = new THREE.Vector2(0, 0);
  var homingStartPos = new THREE.Vector2(0, 0);
  var homingStarted = false;
  var lastBounceTime = null;

  // Each face gets its own inscribed-triangle UV so its dedicated texture renders
  // centered on that face. Winding matches the geometry's outward CCW order
  // (verified against attributes.normal) so numerals aren't mirrored.
  var UV_PATTERN = [0.5, 0.92, 0.08, 0.08, 0.92, 0.08];
  var UV_CENTROID_V = (UV_PATTERN[1] + UV_PATTERN[3] + UV_PATTERN[5]) / 3;

  // Zero velocity at both ends (no jolt at launch, no snap at the stop), still with a
  // confident, energetic middle section — smoother than a plain ease-out.
  function rollEase(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  // Decomposes the rotation from `from` to `to` into a single axis + shortest angle,
  // so the whole roll can spin around ONE fixed axis and land exactly on target
  // (adding whole 2*PI turns to that angle never changes where it ends up).
  function computeSpinPlan(from, to) {
    var delta = to.clone().multiply(from.clone().invert());
    if (delta.w < 0) { delta.x *= -1; delta.y *= -1; delta.z *= -1; delta.w *= -1; }
    var w = THREE.MathUtils.clamp(delta.w, -1, 1);
    var s = Math.sqrt(1 - w * w);
    if (s < 1e-6) {
      return { axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), angle: 0 };
    }
    return { axis: new THREE.Vector3(delta.x / s, delta.y / s, delta.z / s), angle: 2 * Math.acos(w) };
  }

  function configureTexture(tex, maxAniso) {
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = maxAniso;
    return tex;
  }

  // Draws at the actual centroid of the sampled UV triangle (accounting for
  // CanvasTexture's default flipY), not the canvas's geometric center.
  function numeralPos(size) {
    return { x: size * 0.5, y: size * (1 - UV_CENTROID_V) };
  }

  function makeFaceTexture(n, maxAniso) {
    var size = 384;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createRadialGradient(size * 0.35, size * 0.28, size * 0.1, size * 0.5, size * 0.55, size * 0.78);
    grad.addColorStop(0, '#453768');
    grad.addColorStop(0.55, '#291f3c');
    grad.addColorStop(1, '#140f1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    var pos = numeralPos(size);
    ctx.font = '700 ' + Math.round(size * 0.24) + 'px "EB Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(n), pos.x, pos.y);

    return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
  }

  // Numeral-only, white on black, used as an emissive map so the number glows
  // with its own light and stays crisp regardless of how the face is lit.
  function makeEmissiveTexture(n, maxAniso) {
    var size = 384;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    var pos = numeralPos(size);
    ctx.font = '700 ' + Math.round(size * 0.24) + 'px "EB Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(n), pos.x, pos.y);

    return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
  }

  function buildNumberedGeometry() {
    var geometry = new THREE.IcosahedronGeometry(RADIUS, 0);
    var uvPattern = UV_PATTERN;
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
    var q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
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
    camera.position.set(0, 0, CAMERA_DISTANCE);

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

    var maxAniso = renderer.capabilities.getMaxAnisotropy();
    var materials = [];
    for (var n = 1; n <= 20; n++) {
      materials.push(new THREE.MeshPhysicalMaterial({
        map: makeFaceTexture(n, maxAniso),
        emissiveMap: makeEmissiveTexture(n, maxAniso),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.55,
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
    var faceIndex = Math.max(1, Math.min(20, resultNumber || 20)) - 1;
    rollTargetQuat.copy(computeFaceQuaternion(faceIndex));

    baseStartQuat.copy(dieGroup.quaternion);
    var plan = computeSpinPlan(baseStartQuat, rollTargetQuat);
    var extraSpins = 3 + Math.floor(Math.random() * 4); // 3-6 full turns across the whole roll
    baseAxis.copy(plan.axis);
    baseTotalAngle = plan.angle + Math.PI * 2 * extraSpins;

    var launchAngle = Math.random() * Math.PI * 2;
    var launchSpeed = 1.7 + Math.random() * 0.7;
    bouncePos.set(0, 0);
    bounceVel.set(Math.cos(launchAngle) * launchSpeed, Math.sin(launchAngle) * launchSpeed);
    homingStarted = false;
    lastBounceTime = null;

    rolling = true;
    rollStart = performance.now();
  }

  function animate(now) {
    requestAnimationFrame(animate);
    if (!renderer || !dieGroup) return;

    if (rolling) {
      var elapsed = now - rollStart;
      var p = Math.min(elapsed / ROLL_DURATION, 1);

      var dt = lastBounceTime === null ? 0.016 : Math.min((now - lastBounceTime) / 1000, 0.032);
      lastBounceTime = now;

      // --- Position: bounces around the frame, then eases back to dead center ---
      if (p < BOUNCE_PHASE_END) {
        bouncePos.x += bounceVel.x * dt;
        bouncePos.y += bounceVel.y * dt;
        if (bouncePos.x > BOUNCE_BOUND) { bouncePos.x = BOUNCE_BOUND; bounceVel.x = -Math.abs(bounceVel.x); bounceVel.y += (Math.random() - 0.5) * 0.9; }
        else if (bouncePos.x < -BOUNCE_BOUND) { bouncePos.x = -BOUNCE_BOUND; bounceVel.x = Math.abs(bounceVel.x); bounceVel.y += (Math.random() - 0.5) * 0.9; }
        if (bouncePos.y > BOUNCE_BOUND) { bouncePos.y = BOUNCE_BOUND; bounceVel.y = -Math.abs(bounceVel.y); bounceVel.x += (Math.random() - 0.5) * 0.9; }
        else if (bouncePos.y < -BOUNCE_BOUND) { bouncePos.y = -BOUNCE_BOUND; bounceVel.y = Math.abs(bounceVel.y); bounceVel.x += (Math.random() - 0.5) * 0.9; }
      } else {
        if (!homingStarted) { homingStarted = true; homingStartPos.copy(bouncePos); }
        var homingEase = rollEase((p - BOUNCE_PHASE_END) / (1 - BOUNCE_PHASE_END));
        bouncePos.x = homingStartPos.x * (1 - homingEase);
        bouncePos.y = homingStartPos.y * (1 - homingEase);
      }
      dieGroup.position.x = bouncePos.x;
      dieGroup.position.y = bouncePos.y;

      // --- Rotation: one guaranteed continuous spin for the whole roll, recomputed
      // fresh from `p` every frame (never accumulated) — this alone decides where the
      // die ends up, and it is smooth and jerk-free by construction from start to p=1.
      var eased = rollEase(p);
      var baseRot = new THREE.Quaternion().setFromAxisAngle(baseAxis, baseTotalAngle * eased);
      var baseQuat = new THREE.Quaternion().multiplyQuaternions(baseRot, baseStartQuat);

      // Billiard tilt: an instantaneous (non-accumulated) lean derived from the
      // CURRENT bounce velocity, layered on top. Its envelope is exactly 0 at p=1,
      // so however it looks mid-roll, it can never move the final landing.
      var envelope = 1 - eased;
      if (envelope > 0) {
        var speed = bounceVel.length();
        var wobbleAxisVec = speed > 1e-4 ? new THREE.Vector3(-bounceVel.y, bounceVel.x, 0).normalize() : baseAxis;
        var wobbleAngle = Math.min(speed * 0.35, 1.1) * envelope;
        var wobbleQ = new THREE.Quaternion().setFromAxisAngle(wobbleAxisVec, wobbleAngle);
        dieGroup.quaternion.multiplyQuaternions(wobbleQ, baseQuat);
      } else {
        dieGroup.quaternion.copy(baseQuat);
      }

      if (p >= 1) {
        rolling = false;
        dieGroup.position.x = 0;
        dieGroup.position.y = 0;
      }
    }
    // resting: hold the landed orientation exactly, no idle drift once a result has landed
    renderer.render(scene, camera);
  }

  window.WD3D = { init: init, startRoll: startRoll, ROLL_DURATION: ROLL_DURATION };
  window.dispatchEvent(new Event('wd3d-ready'));
})();
