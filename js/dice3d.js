// The Wandering Die — real 3D d20 (icosahedron, one numbered face 1-20) rendered with Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  var SIZE = 340; // internal render resolution; CSS scales the box responsively without
                   // touching this, so the bounce frame's proportions stay identical everywhere
  var CAMERA_DISTANCE = 12.3; // pulled back so the (bigger die, bigger frame) still fits
                               // entirely inside the visible frustum with margin to spare
  var RADIUS = 1.5; // bigger physical die; camera distance above keeps it safely clear of clipping
  var ROLL_DURATION = 2800;

  var renderer, scene, camera, dieGroup, dieContainer;
  var faceNormals = [], faceUps = [];
  var rolling = false;
  var rollTargetQuat = new THREE.Quaternion();
  var pendingResultNumber = 20;
  var flourishTimeout = null;

  // Procedural sound (no audio files): a short filtered noise "clack" on every wall
  // bounce — the "rattling" BG3 is praised for — plus a landing tone, brighter for a
  // natural 20 and lower/dissonant for a natural 1. Context is created lazily inside
  // startRoll (always called from a click handler), which satisfies the browser's
  // autoplay-needs-a-user-gesture requirement.
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
    return audioCtx;
  }
  var lastClackTime = 0;
  function playClack(intensity) {
    var ctx = ensureAudio();
    if (!ctx) return;
    var nowMs = ctx.currentTime * 1000;
    if (nowMs - lastClackTime < 35) return; // avoid a double-clack when a corner hits both walls in one frame
    lastClackTime = nowMs;
    var t0 = ctx.currentTime;
    var len = Math.floor(ctx.sampleRate * 0.035);
    var buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var noise = ctx.createBufferSource();
    noise.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500 + Math.random() * 900;
    filter.Q.value = 1.1;
    var gain = ctx.createGain();
    var peak = Math.min(Math.max(intensity, 0), 1) * 0.3 + 0.04;
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t0);
    noise.stop(t0 + 0.06);
  }
  function playTone(freq, startOffset, duration, type, peak) {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t0 = ctx.currentTime + startOffset;
    var osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
  function playLanding(n) {
    if (n === 20) {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { playTone(f, i * 0.07, 0.35, 'triangle', 0.2); });
    } else if (n === 1) {
      playTone(110, 0, 0.5, 'sawtooth', 0.16);
      playTone(103.83, 0.02, 0.5, 'sawtooth', 0.12);
    } else {
      playTone(660, 0, 0.28, 'sine', 0.16);
    }
  }

  // Rotation is ONE unified, continuous process for the entire roll — never a separate
  // "decide the result now" phase, so there's nothing that can read as a late, staged
  // correction. Every frame does two things to the SAME accumulated `rollQuat`:
  //  1) Real rolling-without-slipping physics: spin axis perpendicular to the CURRENT
  //     bounce velocity, magnitude scaled by how far the die actually traveled that
  //     frame — so it visibly rolls in the direction it's moving, redirecting the
  //     instant a wall reflects the velocity (the billiard effect). This fades to 0
  //     like friction over the back stretch of the roll instead of cutting off.
  //  2) An always-on, imperceptibly small pull toward the secretly pre-decided target,
  //     recomputed fresh each frame from wherever the physics has ACTUALLY left the die
  //     and closing a fraction of that gap proportional to dt / time-remaining. Early
  //     on this is a tiny nudge (plenty of time left); it only grows as the deadline
  //     approaches, and by construction closes exactly 100% of whatever gap is left on
  //     the very last frame — guaranteeing an exact landing without ever needing a
  //     single large, separate corrective spin.
  var rollQuat = new THREE.Quaternion();
  var ROLL_RADIUS = 0.55; // smaller = more visible spin per unit of travel
  var SPIN_ENERGY = 1.6; // extra multiplier over pure rolling-without-slip, for visual energy
  var PHYS_FADE_START = 0.55; // fraction of the roll where physics starts winding down
  var PHYS_FADE_END = 0.75; // ...and fraction where it's fully faded, like friction settling
  var CORR_START = 0.68; // correction's own ramp starts at zero speed too, so a slight
                          // overlap with the physics fade-out still hands off smoothly
  var prevCorrEased = 0; // tracks how much of the correction's eased S-curve has been
                          // applied so far, so each increment closes exactly the right
                          // slice of whatever gap currently remains (self-correcting,
                          // but with a proper zero-derivative-at-both-ends deceleration
                          // instead of a constant-speed cruise + sudden stop)

  // Position is likewise ONE continuous physical simulation for the entire roll, never a
  // mode switch. The die is a particle bouncing elastically off the walls of the frame,
  // always pulled toward the center by a spring — the SAME two forces (spring + bounce)
  // act from the very first frame to the last. What changes smoothly over time is only
  // how strong the spring/damping are: weak and underdamped at first (so the launch
  // energy plays out as real, energetic bouncing), ramping to a much stiffer, near-
  // critically-damped spring for the back stretch (so it settles at dead center quickly
  // and cleanly). Because the whole roll is decided by a single launch angle + speed
  // chosen the instant the button is clicked, "where it'll end up" is baked in from the
  // very first frame — nothing about the trajectory's rules ever changes mid-flight.
  var BOUNCE_BOUND = 1.3; // world-space half-extent of the frame the die can roam within
  var SPRING_K_WEAK = 0.4; // gentle pull early on — barely affects the free-flying bounce
  var SPRING_K_STRONG = 70; // stiff pull for the settle — fast, clean convergence to center
  var DAMP_WEAK = 0.05; // near-undamped early on, so launch energy plays out as real bounces
  var DAMP_STRONG = 1.25; // slightly-over-critical damping for the settle — no overshoot/wobble
  var SPRING_RAMP_START = 0.5; // fraction of the roll where the settle-in begins ramping up
  var SPRING_RAMP_END = 0.75; // ...fully ramped by here, leaving a long, clean settle tail
  var BOUNCE_RESTITUTION = 0.92; // slight energy loss per wall hit, like a real bounce
  var bouncePos = new THREE.Vector2(0, 0);
  var bounceVel = new THREE.Vector2(0, 0);
  var lastBounceTime = null;
  var rollElapsedMs = 0; // accumulated SIMULATED time (sum of the same capped dt used to
                          // step the physics) — `p` is derived from this, never from raw
                          // wall-clock elapsed time, so a real stutter (GC pause, a slow
                          // device, audio buffer generation) can never let `p` race ahead
                          // of what the physics has actually simulated. Worst case under a
                          // stall, the roll just takes a bit longer in real time instead of
                          // desyncing — which is what caused the sporadic late "jump":
                          // the correction phase compressing a bigger-than-expected gap
                          // into whatever time `p` claimed was left.

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
    dieContainer = canvas.parentElement;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      return false;
    }
    if (!renderer) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(SIZE, SIZE, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
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
    pendingResultNumber = Math.max(1, Math.min(20, resultNumber || 20));
    var faceIndex = pendingResultNumber - 1;
    rollTargetQuat.copy(computeFaceQuaternion(faceIndex));

    rollQuat.copy(dieGroup.quaternion);

    ensureAudio(); // create/unlock the audio context inside this click-driven call

    if (dieContainer) {
      dieContainer.classList.remove('is-nat20', 'is-nat1');
      if (flourishTimeout) { clearTimeout(flourishTimeout); flourishTimeout = null; }
    }

    var launchAngle = Math.random() * Math.PI * 2;
    var launchSpeed = 3.2 + Math.random() * 1.3;
    bouncePos.set(0, 0);
    bounceVel.set(Math.cos(launchAngle) * launchSpeed, Math.sin(launchAngle) * launchSpeed);
    lastBounceTime = null;
    prevCorrEased = 0;
    rollElapsedMs = 0;

    rolling = true;
  }

  function animate(now) {
    requestAnimationFrame(animate);
    if (!renderer || !dieGroup) return;

    if (rolling) {
      var dt = lastBounceTime === null ? 0.016 : Math.min((now - lastBounceTime) / 1000, 0.032);
      lastBounceTime = now;
      rollElapsedMs += dt * 1000;
      var p = Math.min(rollElapsedMs / ROLL_DURATION, 1);

      // --- Position: one continuous spring-in-a-box simulation for the whole roll.
      // Same two forces (inward spring + elastic wall bounce) the entire time; only
      // their strength ramps smoothly from "barely there" (real, chaotic bouncing) to
      // "fast and clean" (settles exactly at center) — never a mode switch.
      var springLocalP = Math.min(Math.max((p - SPRING_RAMP_START) / (SPRING_RAMP_END - SPRING_RAMP_START), 0), 1);
      var springEase = rollEase(springLocalP);
      var springK = SPRING_K_WEAK + (SPRING_K_STRONG - SPRING_K_WEAK) * springEase;
      var dampMult = DAMP_WEAK + (DAMP_STRONG - DAMP_WEAK) * springEase;
      var dampPerSec = Math.exp(-2 * Math.sqrt(springK) * dampMult);

      bounceVel.x += -springK * bouncePos.x * dt;
      bounceVel.y += -springK * bouncePos.y * dt;
      var dampFactor = Math.pow(dampPerSec, dt);
      bounceVel.x *= dampFactor;
      bounceVel.y *= dampFactor;
      bouncePos.x += bounceVel.x * dt;
      bouncePos.y += bounceVel.y * dt;
      var hitSpeed = 0;
      if (bouncePos.x > BOUNCE_BOUND) { hitSpeed = Math.max(hitSpeed, Math.abs(bounceVel.x)); bouncePos.x = BOUNCE_BOUND; bounceVel.x = -Math.abs(bounceVel.x) * BOUNCE_RESTITUTION; }
      else if (bouncePos.x < -BOUNCE_BOUND) { hitSpeed = Math.max(hitSpeed, Math.abs(bounceVel.x)); bouncePos.x = -BOUNCE_BOUND; bounceVel.x = Math.abs(bounceVel.x) * BOUNCE_RESTITUTION; }
      if (bouncePos.y > BOUNCE_BOUND) { hitSpeed = Math.max(hitSpeed, Math.abs(bounceVel.y)); bouncePos.y = BOUNCE_BOUND; bounceVel.y = -Math.abs(bounceVel.y) * BOUNCE_RESTITUTION; }
      else if (bouncePos.y < -BOUNCE_BOUND) { hitSpeed = Math.max(hitSpeed, Math.abs(bounceVel.y)); bouncePos.y = -BOUNCE_BOUND; bounceVel.y = Math.abs(bounceVel.y) * BOUNCE_RESTITUTION; }
      if (hitSpeed > 0) { playClack(hitSpeed / 4); }
      dieGroup.position.x = bouncePos.x;
      dieGroup.position.y = bouncePos.y;

      // --- Rotation: physics the whole time (never a separate "decide now" phase) ---
      var speed = bounceVel.length();
      if (speed > 1e-4) {
        var physFade = p < PHYS_FADE_START ? 1 : (p > PHYS_FADE_END ? 0 : rollEase(1 - (p - PHYS_FADE_START) / (PHYS_FADE_END - PHYS_FADE_START)));
        if (physFade > 0) {
          var rollAxis = new THREE.Vector3(-bounceVel.y, bounceVel.x, 0).normalize();
          var dAngle = (speed * dt / ROLL_RADIUS) * SPIN_ENERGY * physFade;
          rollQuat.premultiply(new THREE.Quaternion().setFromAxisAngle(rollAxis, dAngle));
        }
      }
      // Gap-closing pull: only switches on once physics has fully settled (so the two
      // never compete over the axis at the same moment), then follows a proper eased
      // S-curve — zero speed at the start (an imperceptible handoff right as the tumble
      // stops) and zero speed at the end (an exact, gentle stop on the real result).
      // Recomputed fresh from wherever the die actually is each frame, so it's still
      // self-correcting; only the fraction-of-remaining-gap it closes each step follows
      // the eased curve instead of a raw proportional (constant-speed) closing rate.
      if (p > CORR_START) {
        var localP = Math.min((p - CORR_START) / (1 - CORR_START), 1);
        var eased = rollEase(localP);
        var stepFrac = (eased - prevCorrEased) / Math.max(1 - prevCorrEased, 1e-6);
        stepFrac = Math.min(Math.max(stepFrac, 0), 1);
        prevCorrEased = eased;
        if (stepFrac > 0) {
          var plan = computeSpinPlan(rollQuat, rollTargetQuat);
          if (plan.angle > 1e-6) {
            rollQuat.premultiply(new THREE.Quaternion().setFromAxisAngle(plan.axis, plan.angle * stepFrac));
          }
        }
      }
      dieGroup.quaternion.copy(rollQuat);

      if (p >= 1) {
        rolling = false;
        rollQuat.copy(rollTargetQuat); // hard snap eliminates any residual float drift
        dieGroup.quaternion.copy(rollQuat);
        dieGroup.position.x = 0;
        dieGroup.position.y = 0;

        playLanding(pendingResultNumber);
        if (dieContainer && (pendingResultNumber === 20 || pendingResultNumber === 1)) {
          var flourishClass = pendingResultNumber === 20 ? 'is-nat20' : 'is-nat1';
          dieContainer.classList.add(flourishClass);
          flourishTimeout = setTimeout(function () { dieContainer.classList.remove(flourishClass); }, 1300);
        }
      }
    }
    // resting: hold the landed orientation exactly, no idle drift once a result has landed
    renderer.render(scene, camera);
  }

  window.WD3D = { init: init, startRoll: startRoll, ROLL_DURATION: ROLL_DURATION };
  window.dispatchEvent(new Event('wd3d-ready'));
})();
