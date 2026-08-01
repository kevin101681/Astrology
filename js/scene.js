// ---------------------------------------------------------------------------
// scene.js — builds and animates the 3D solar system + celestial sphere.
// ---------------------------------------------------------------------------

import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { ZODIAC_CONSTELLATIONS, BRIGHT_STARS } from './data/constellations.js';
import { planetHelioLongitude, planetNames, moonPhaseAngle, gmst, SIGNS, chartAspects } from './astro.js';
import {
  rockyTexture, gasGiantTexture, earthTexture, cloudTexture, sunTexture,
  glowSprite, starSprite, saturnRingTexture, milkyWayTexture,
} from './textures.js';

const DEG = Math.PI / 180;
const CELESTIAL_R = 900;          // radius of the star sphere
const EPS = 23.4392911 * DEG;     // obliquity used for star coordinate transform

// Stylized (log-compressed) orbital distance so all planets stay in view.
const orbitRadius = (aAU) => 60 + Math.pow(aAU, 0.6) * 55;

const PLANET_STYLE = {
  mercury: { r: 1.7,  tilt: 0.03,  spin: 0.004 },
  venus:   { r: 3.8,  tilt: 177 * DEG, spin: -0.002 },
  earth:   { r: 4.0,  tilt: 23.4 * DEG, spin: 0.02 },
  mars:    { r: 2.3,  tilt: 25.2 * DEG, spin: 0.019 },
  jupiter: { r: 11.0, tilt: 3.1 * DEG,  spin: 0.045 },
  saturn:  { r: 9.5,  tilt: 26.7 * DEG, spin: 0.042 },
  uranus:  { r: 6.0,  tilt: 97.8 * DEG, spin: 0.03 },
  neptune: { r: 5.8,  tilt: 28.3 * DEG, spin: 0.032 },
};

// Ecliptic longitude (deg) + latitude (deg) → scene direction (Y = ecliptic north).
function eclipticDir(lonDeg, latDeg = 0) {
  const lon = lonDeg * DEG, lat = latDeg * DEG;
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon),
  );
}

// Equatorial RA (hours) / Dec (deg) → ecliptic lon/lat (deg).
function equatorialToEcliptic(raHours, decDeg) {
  const a = raHours * 15 * DEG, d = decDeg * DEG;
  const sinB = Math.sin(d) * Math.cos(EPS) - Math.cos(d) * Math.sin(EPS) * Math.sin(a);
  const beta = Math.asin(Math.max(-1, Math.min(1, sinB)));
  const y = Math.sin(a) * Math.cos(EPS) + Math.tan(d) * Math.sin(EPS);
  const lambda = Math.atan2(y, Math.cos(a));
  return [lambda / DEG, beta / DEG];
}

function starPosition(raHours, decDeg, radius = CELESTIAL_R) {
  const [lon, lat] = equatorialToEcliptic(raHours, decDeg);
  return eclipticDir(lon, lat).multiplyScalar(radius);
}

function makeTextSprite(text, { fontSize = 48, color = '#cfe0ff', bold = false, scale = 1 } = {}) {
  const pad = 20;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `${bold ? '600 ' : ''}${fontSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fontSize + pad * 2;
  canvas.width = w; canvas.height = h;
  const c2 = canvas.getContext('2d');
  c2.font = font;
  c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.shadowColor = 'rgba(80,140,255,0.9)'; c2.shadowBlur = 14;
  c2.fillStyle = color;
  c2.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false,
  }));
  sprite.scale.set((w / h) * 18 * scale, 18 * scale, 1);
  return sprite;
}

export class AstroScene {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55, container.clientWidth / container.clientHeight, 0.5, 6000);
    this.camera.position.set(0, 170, 420);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 1600;

    this.clock = new THREE.Clock();
    this.flight = null;               // active camera tween
    this.planets = {};                // name → mesh group
    this.constellations = {};         // name → {group, lines, label, center}
    this.highlighted = new Set();

    this._buildLights();
    this._buildBackground();
    this._buildStarfield();
    this._buildConstellations();
    this._buildZodiacRing();
    this._buildSun();
    this._buildPlanets();

    window.addEventListener('resize', () => this._onResize());
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  // --- construction ---------------------------------------------------------

  _buildLights() {
    this.scene.add(new THREE.AmbientLight(0x2a3a55, 0.8));
    // decay = 0: with r155+ physical lighting, any real falloff would leave
    // the outer planets pitch black at our stylized distances.
    const sunLight = new THREE.PointLight(0xfff2d8, 2.6, 0, 0);
    this.scene.add(sunLight);
  }

  _buildBackground() {
    const tex = new THREE.CanvasTexture(milkyWayTexture(2048));
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.SphereGeometry(2600, 48, 32);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide });
    const sky = new THREE.Mesh(geo, mat);
    sky.rotation.z = 20 * DEG;
    this.scene.add(sky);
  }

  _buildStarfield() {
    const sprite = new THREE.CanvasTexture(starSprite());
    // Random background stars on a shell just inside the sky sphere.
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const tints = [
      new THREE.Color(0xffffff), new THREE.Color(0xcdd8ff),
      new THREE.Color(0xffe9c8), new THREE.Color(0xffd2a1),
      new THREE.Color(0xaac4ff),
    ];
    for (let i = 0; i < N; i++) {
      // Uniform on sphere
      const z = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = CELESTIAL_R * (1.25 + Math.random() * 0.8);
      const s = Math.sqrt(1 - z * z);
      pos[i * 3] = r * s * Math.cos(th);
      pos[i * 3 + 1] = r * z;
      pos[i * 3 + 2] = r * s * Math.sin(th);
      const c = tints[Math.floor(Math.random() * tints.length)];
      const dim = 0.35 + Math.random() * 0.65;
      col[i * 3] = c.r * dim; col[i * 3 + 1] = c.g * dim; col[i * 3 + 2] = c.b * dim;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 7, map: sprite, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.scene.add(new THREE.Points(geo, mat));

    // Real bright stars (Sirius, Vega, Orion's belt, …) slightly larger.
    const bpos = [];
    for (const [ra, dec, mag] of BRIGHT_STARS) {
      const p = starPosition(ra, dec, CELESTIAL_R * 1.1);
      bpos.push(p.x, p.y, p.z, Math.max(9, 22 - mag * 5));
    }
    const bgeo = new THREE.BufferGeometry();
    const arr = new Float32Array(bpos.length / 4 * 3);
    for (let i = 0; i < bpos.length / 4; i++) {
      arr[i * 3] = bpos[i * 4]; arr[i * 3 + 1] = bpos[i * 4 + 1]; arr[i * 3 + 2] = bpos[i * 4 + 2];
    }
    bgeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const bmat = new THREE.PointsMaterial({
      size: 16, map: sprite, color: 0xffffff, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.scene.add(new THREE.Points(bgeo, bmat));
  }

  _buildConstellations() {
    const starTex = new THREE.CanvasTexture(starSprite());
    for (const con of ZODIAC_CONSTELLATIONS) {
      const group = new THREE.Group();
      const positions = con.stars.map(([ra, dec]) => starPosition(ra, dec));

      // Stars, sized by magnitude.
      const pos = new Float32Array(positions.length * 3);
      positions.forEach((p, i) => { pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; });
      const sgeo = new THREE.BufferGeometry();
      sgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const smat = new THREE.PointsMaterial({
        size: 15, map: starTex, color: 0xeaf2ff, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Points(sgeo, smat));

      // Stick-figure lines.
      const lpts = [];
      for (const [a, b] of con.lines) lpts.push(positions[a], positions[b]);
      const lgeo = new THREE.BufferGeometry().setFromPoints(lpts);
      const lmat = new THREE.LineBasicMaterial({
        color: 0x3d5f8f, transparent: true, opacity: 0.55,
      });
      const lines = new THREE.LineSegments(lgeo, lmat);
      group.add(lines);

      // Centroid + label.
      const center = positions.reduce((s, p) => s.add(p), new THREE.Vector3())
        .divideScalar(positions.length)
        .normalize().multiplyScalar(CELESTIAL_R);
      const label = makeTextSprite(con.name, { fontSize: 54, scale: 2.2 });
      label.position.copy(center).multiplyScalar(1.06);
      label.material.opacity = 0.75;
      group.add(label);

      this.scene.add(group);
      this.constellations[con.name] = { group, lines, label, center, baseColor: 0x3d5f8f };
    }
  }

  _buildZodiacRing() {
    // Faint ecliptic circle with 12 sign boundaries + glyphs.
    const ringPts = [];
    for (let i = 0; i <= 256; i++) {
      ringPts.push(eclipticDir(i / 256 * 360).multiplyScalar(CELESTIAL_R * 0.995));
    }
    const rgeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    this.scene.add(new THREE.Line(rgeo, new THREE.LineBasicMaterial({
      color: 0x8a7a3a, transparent: true, opacity: 0.35,
    })));

    const glyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    // Fire, Earth, Air, Water — signs cycle through the elements in order.
    const elementColors = ['#ff8a5c', '#7fd68f', '#ffe27a', '#6cb2ff'];
    for (let i = 0; i < 12; i++) {
      // Boundary tick
      const tickPts = [
        eclipticDir(i * 30, -3).multiplyScalar(CELESTIAL_R * 0.99),
        eclipticDir(i * 30, 3).multiplyScalar(CELESTIAL_R * 0.99),
      ];
      const tgeo = new THREE.BufferGeometry().setFromPoints(tickPts);
      this.scene.add(new THREE.Line(tgeo, new THREE.LineBasicMaterial({
        color: 0x8a7a3a, transparent: true, opacity: 0.3,
      })));
      // Glyph at the middle of the sign, tinted by its element.
      const glyph = makeTextSprite(glyphs[i], {
        fontSize: 64, color: elementColors[i % 4], scale: 1.4,
      });
      glyph.position.copy(eclipticDir(i * 30 + 15, -6).multiplyScalar(CELESTIAL_R * 0.97));
      glyph.material.opacity = 0.85;
      this.scene.add(glyph);
    }
  }

  _buildSun() {
    const tex = new THREE.CanvasTexture(sunTexture());
    tex.colorSpace = THREE.SRGBColorSpace;
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(20, 64, 48),
      new THREE.MeshBasicMaterial({ map: tex }),
    );
    this.scene.add(sun);
    this.sun = sun;

    const coronaTex = new THREE.CanvasTexture(glowSprite());
    const mk = (scale, opacity) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: coronaTex, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      s.scale.set(scale, scale, 1);
      this.scene.add(s);
      return s;
    };
    this.corona = [mk(95, 0.95), mk(160, 0.45), mk(280, 0.18)];
  }

  _makePlanetMaterialCanvas(name) {
    switch (name) {
      case 'mercury': return rockyTexture({
        seed: 11, roughness: 1.1, craters: 1.4,
        stops: [[0, [62, 60, 58]], [0.5, [125, 120, 115]], [1, [188, 182, 172]]],
      });
      case 'venus': return gasGiantTexture({
        seed: 22, bands: 5, turbulence: 0.22,
        stops: [[0, [176, 138, 88]], [0.4, [222, 190, 136]], [0.75, [240, 218, 170]], [1, [250, 238, 205]]],
      });
      case 'mars': return rockyTexture({
        seed: 44, roughness: 1.05, craters: 0.8,
        stops: [[0, [96, 44, 24]], [0.45, [168, 84, 42]], [0.8, [204, 120, 68]], [1, [230, 170, 120]]],
      });
      case 'jupiter': return gasGiantTexture({
        seed: 55, bands: 11, turbulence: 0.08,
        spot: { u: 0.3, v: 0.66, ru: 0.055, rv: 0.045, strength: 0.85, color: [190, 82, 48] },
        stops: [[0, [148, 108, 74]], [0.3, [212, 186, 152]], [0.55, [236, 224, 200]], [0.75, [190, 148, 105]], [1, [246, 238, 220]]],
      });
      case 'saturn': return gasGiantTexture({
        seed: 66, bands: 8, turbulence: 0.05,
        stops: [[0, [176, 148, 100]], [0.45, [216, 194, 144]], [0.75, [238, 222, 180]], [1, [246, 238, 208]]],
      });
      case 'uranus': return gasGiantTexture({
        seed: 77, bands: 4, turbulence: 0.03,
        stops: [[0, [120, 190, 200]], [0.5, [160, 216, 224]], [1, [200, 236, 240]]],
      });
      case 'neptune': return gasGiantTexture({
        seed: 88, bands: 6, turbulence: 0.1,
        stops: [[0, [30, 60, 160]], [0.45, [58, 98, 200]], [0.75, [92, 140, 228]], [1, [150, 190, 245]]],
      });
      default: return rockyTexture({
        seed: 1, stops: [[0, [90, 90, 90]], [1, [200, 200, 200]]],
      });
    }
  }

  _buildPlanets() {
    const names = planetNames();
    for (const name of names) {
      const style = PLANET_STYLE[name];
      const holder = new THREE.Group();      // positioned on the orbit
      const body = new THREE.Group();        // carries axial tilt + spin
      body.rotation.z = style.tilt;
      holder.add(body);

      let mesh;
      if (name === 'earth') {
        const tex = new THREE.CanvasTexture(earthTexture());
        tex.colorSpace = THREE.SRGBColorSpace;
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(style.r, 48, 32),
          new THREE.MeshPhongMaterial({ map: tex, shininess: 18, specular: 0x224466 }),
        );
        // Cloud shell
        const ctex = new THREE.CanvasTexture(cloudTexture());
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(style.r * 1.02, 48, 32),
          new THREE.MeshLambertMaterial({ map: ctex, transparent: true, depthWrite: false }),
        );
        body.add(clouds);
        this.earthClouds = clouds;
        // Soft atmosphere rim
        const atmoTex = new THREE.CanvasTexture(glowSprite({
          inner: [140, 190, 255], outer: [60, 120, 255],
        }));
        const atmo = new THREE.Sprite(new THREE.SpriteMaterial({
          map: atmoTex, transparent: true, opacity: 0.5,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        atmo.scale.set(style.r * 3.4, style.r * 3.4, 1);
        holder.add(atmo);
        // The Moon
        const mtex = new THREE.CanvasTexture(rockyTexture({
          seed: 99, roughness: 1.15, craters: 1.6,
          stops: [[0, [70, 70, 72]], [0.5, [140, 138, 134]], [1, [205, 202, 196]]],
        }));
        mtex.colorSpace = THREE.SRGBColorSpace;
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 32, 24),
          new THREE.MeshPhongMaterial({ map: mtex, shininess: 2 }),
        );
        this.moonPivot = new THREE.Group();
        this.moonPivot.add(moon);
        moon.position.set(9, 0, 0);
        holder.add(this.moonPivot);
        this.moonMesh = moon;
      } else {
        const canvas = this._makePlanetMaterialCanvas(name);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(style.r, 48, 32),
          new THREE.MeshPhongMaterial({ map: tex, shininess: 6 }),
        );
      }
      body.add(mesh);

      if (name === 'saturn') {
        const rtex = new THREE.CanvasTexture(saturnRingTexture());
        rtex.rotation = 0;
        const rgeo = new THREE.RingGeometry(style.r * 1.35, style.r * 2.3, 96);
        // Remap UVs so the ring texture runs radially.
        const uv = rgeo.attributes.uv, p = rgeo.attributes.position;
        const inner = style.r * 1.35, outer = style.r * 2.3;
        for (let i = 0; i < uv.count; i++) {
          const len = Math.hypot(p.getX(i), p.getY(i));
          uv.setXY(i, (len - inner) / (outer - inner), 0.5);
        }
        const ring = new THREE.Mesh(rgeo, new THREE.MeshBasicMaterial({
          map: rtex, side: THREE.DoubleSide, transparent: true, depthWrite: false,
        }));
        ring.rotation.x = Math.PI / 2;
        body.add(ring);
      }

      // Name label above the planet.
      const label = makeTextSprite(name[0].toUpperCase() + name.slice(1), {
        fontSize: 40, color: '#9fb6d8', scale: 0.45,
      });
      label.position.set(0, style.r + 6, 0);
      holder.add(label);

      // Orbit line.
      const dist = orbitRadius({
        mercury: 0.387, venus: 0.723, earth: 1, mars: 1.524,
        jupiter: 5.203, saturn: 9.537, uranus: 19.191, neptune: 30.069,
      }[name]);
      const pts = [];
      for (let i = 0; i <= 180; i++) pts.push(eclipticDir(i * 2).multiplyScalar(dist));
      const ogeo = new THREE.BufferGeometry().setFromPoints(pts);
      this.scene.add(new THREE.Line(ogeo, new THREE.LineBasicMaterial({
        color: 0x2c4a6e, transparent: true, opacity: 0.4,
      })));

      this.scene.add(holder);
      this.planets[name] = { holder, body, mesh, label, dist, spin: style.spin };
    }
  }

  // --- runtime --------------------------------------------------------------

  // Position every planet + the Moon for a Julian Day.
  setDate(jd) {
    this.jd = jd;
    for (const name of planetNames()) {
      const p = this.planets[name];
      const lon = planetHelioLongitude(name, jd);
      p.holder.position.copy(eclipticDir(lon).multiplyScalar(p.dist));
    }
    // Moon: geocentric ecliptic angle relative to Earth.
    const phase = moonPhaseAngle(jd) + planetHelioLongitude('earth', jd) + 180;
    this.moonPivot.rotation.y = ((phase % 360) * DEG);
  }

  earthPosition() {
    return this.planets.earth.holder.position.clone();
  }

  // Attach/remove ℞ markers above planets that were retrograde at the
  // chart's birth instant.
  setRetrogrades(names) {
    for (const name of planetNames()) {
      const p = this.planets[name];
      if (p.retroBadge) {
        p.holder.remove(p.retroBadge);
        p.retroBadge.material.map.dispose();
        p.retroBadge.material.dispose();
        p.retroBadge = null;
      }
      if (names.includes(name)) {
        const badge = makeTextSprite('℞', { fontSize: 52, color: '#ff9a9a', bold: true, scale: 0.6 });
        badge.position.set(0, PLANET_STYLE[name].r + 13, 0);
        p.holder.add(badge);
        p.retroBadge = badge;
      }
    }
  }

  // Smoothly fly the camera. Returns a promise resolving when it lands.
  flyTo(position, target, duration = 2600) {
    return new Promise((resolve) => {
      this.flight = {
        p0: this.camera.position.clone(), p1: position.clone(),
        t0: this.controls.target.clone(), t1: target.clone(),
        start: performance.now(), duration, resolve,
      };
    });
  }

  // Frame a constellation: put the camera between the Sun and the
  // constellation, looking out at the stars.
  focusConstellation(name, distanceFactor = 0.42) {
    const con = this.constellations[name];
    if (!con) return Promise.resolve();
    const dir = con.center.clone().normalize();
    const camPos = dir.clone().multiplyScalar(CELESTIAL_R * distanceFactor);
    camPos.y += 30;
    return this.flyTo(camPos, con.center, 3200);
  }

  focusOverview() {
    return this.flyTo(new THREE.Vector3(0, 170, 420), new THREE.Vector3(0, 0, 0), 2600);
  }

  focusEarth() {
    // Approach from the sunlit side, offset sideways so the Sun's glare
    // stays out of frame.
    const e = this.earthPosition();
    const toSun = e.clone().normalize().negate();          // Earth → Sun
    const side = new THREE.Vector3().crossVectors(toSun, new THREE.Vector3(0, 1, 0)).normalize();
    const camPos = e.clone()
      .add(toSun.multiplyScalar(20))
      .add(side.multiplyScalar(22));
    camPos.y += 9;
    return this.flyTo(camPos, e, 2800);
  }

  // ------------------------------------------------------------------------
  // House wheel overlay: the twelve whole-sign houses drawn as translucent
  // wedges around Earth in the ecliptic plane, one house highlighted.
  // ------------------------------------------------------------------------

  clearHouseOverlay() {
    if (this.houseGroup) {
      this.scene.remove(this.houseGroup);
      this.houseGroup.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.dispose) o.material.dispose();
      });
      this.houseGroup = null;
      this.houseFocus = null;
    }
  }

  // chart: computeChart() result; houseNum: 1-12; labelText: e.g.
  // "5th House — Creativity & Joy".
  showHouseOverlay(chart, houseNum, labelText) {
    this.clearHouseOverlay();
    const group = new THREE.Group();
    const E = this.earthPosition();
    group.position.copy(E);

    const ELEMENT_COLORS = [0xff8a5c, 0x7fd68f, 0xffe27a, 0x6cb2ff];
    const R_IN = 10, R_OUT = 82;
    // Whole-sign houses: house 1 spans the entire rising sign.
    const startLon = chart.ascendant.sign * 30;

    for (let i = 0; i < 12; i++) {
      const sign = (chart.ascendant.sign + i) % 12;
      const lon0 = (startLon + i * 30) * DEG;
      const isFocus = i + 1 === houseNum;

      // RingGeometry lives in the XY plane; rotateX(-90°) maps it onto the
      // ecliptic (XZ) with theta ↔ ecliptic longitude.
      const geo = new THREE.RingGeometry(R_IN, R_OUT, 24, 1, lon0 + 0.01, 30 * DEG - 0.02);
      geo.rotateX(-Math.PI / 2);
      const wedge = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: ELEMENT_COLORS[sign % 4],
        transparent: true,
        opacity: isFocus ? 0.30 : 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      }));
      group.add(wedge);

      // Cusp line at the wedge's leading edge.
      const cuspDir = eclipticDir(startLon + i * 30);
      const cusp = new THREE.BufferGeometry().setFromPoints([
        cuspDir.clone().multiplyScalar(R_IN), cuspDir.clone().multiplyScalar(R_OUT),
      ]);
      group.add(new THREE.Line(cusp, new THREE.LineBasicMaterial({
        color: 0x9fb6d8, transparent: true, opacity: 0.35, depthWrite: false,
      })));

      // House number at mid-wedge.
      const midDir = eclipticDir(startLon + i * 30 + 15);
      const num = makeTextSprite(String(i + 1), {
        fontSize: 44, color: isFocus ? '#ffe9a8' : '#8fa3c0', bold: isFocus, scale: 0.5,
      });
      num.position.copy(midDir).multiplyScalar(R_OUT * 0.82);
      num.position.y += 1.5;
      group.add(num);

      if (isFocus) {
        const label = makeTextSprite(labelText, {
          fontSize: 46, color: '#ffe9a8', bold: true, scale: 1.1,
        });
        label.position.copy(midDir).multiplyScalar(R_OUT + 34);
        label.position.y += 12;
        group.add(label);
        this.houseFocus = { midLon: startLon + i * 30 + 15 };
      }
    }

    this.scene.add(group);
    this.houseGroup = group;
  }

  // Hover above Earth, offset behind the highlighted wedge so it faces you.
  focusHouse() {
    if (!this.houseFocus) return Promise.resolve();
    const E = this.earthPosition();
    const dir = eclipticDir(this.houseFocus.midLon);
    const camPos = E.clone().addScaledVector(dir, -70).add(new THREE.Vector3(0, 130, 0));
    const target = E.clone().addScaledVector(dir, 40);
    return this.flyTo(camPos, target, 2600);
  }

  // ------------------------------------------------------------------------
  // Chart geometry: sight lines from Earth through the Sun / Moon / eastern
  // horizon out to the zodiac, plus the observer's horizon plane. This is the
  // literal "why" of a birth chart, drawn in space.
  // ------------------------------------------------------------------------

  clearChartGeometry() {
    if (this.geometryGroup) {
      this.scene.remove(this.geometryGroup);
      this.geometryGroup.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      this.geometryGroup = null;
      this.geometryInfo = null;
    }
  }

  // Distance along a ray from `origin` in unit direction `dir` to the
  // celestial sphere (centered on the Sun at the scene origin).
  _rayToSphere(origin, dir, radius = CELESTIAL_R * 0.985) {
    const b = origin.dot(dir);
    return -b + Math.sqrt(Math.max(0, b * b - origin.lengthSq() + radius * radius));
  }

  _sightLine(group, from, dir, color, glyph, text) {
    const t = this._rayToSphere(from, dir);
    const end = from.clone().addScaledVector(dir, t);

    const geo = new THREE.BufferGeometry().setFromPoints([
      from.clone().addScaledVector(dir, 4.5), end,
    ]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    group.add(line);

    // Soft glow where the line meets the zodiac.
    const glowTex = new THREE.CanvasTexture(glowSprite({
      inner: [255, 255, 255],
      outer: [(color >> 16) & 255, (color >> 8) & 255, color & 255],
    }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(46);
    glow.position.copy(end);
    group.add(glow);

    // Label riding the line partway out.
    const label = makeTextSprite(`${glyph} ${text}`, {
      fontSize: 46, bold: true,
      color: `#${color.toString(16).padStart(6, '0')}`,
      scale: 1.35,
    });
    label.position.copy(from).addScaledVector(dir, Math.min(t * 0.5, 330));
    label.position.y += 16;
    group.add(label);
    return end;
  }

  // chart: result of computeChart(); latitude/longitude: birth place.
  showChartGeometry(chart, latitude, longitude) {
    this.clearChartGeometry();
    const group = new THREE.Group();
    const E = this.earthPosition();

    const sunDir = eclipticDir(chart.sun.longitude);
    const moonDir = eclipticDir(chart.moon.longitude);
    const ascDir = eclipticDir(chart.ascendant.longitude);

    // Geocentric sight lines. The Sun line passes exactly through the Sun,
    // and the Moon line through the Moon — the scene places both bodies at
    // their true geocentric longitudes for the birth instant.
    this._sightLine(group, E, sunDir, 0xe8c96a, '☉', `Sun in ${SIGNS[chart.sun.sign]}`);
    this._sightLine(group, E, moonDir, 0xc9d6ea, '☾', `Moon in ${SIGNS[chart.moon.sign]}`);
    this._sightLine(group, E, ascDir, 0xe69ac2, '↑', `Rising in ${SIGNS[chart.ascendant.sign]}`);

    // Black Moon Lilith: the direction of the Moon's apogee — a point, not
    // a body, so its line is fainter and violet.
    if (chart.lilith) {
      const lilDir = eclipticDir(chart.lilith.longitude);
      this._sightLine(group, E, lilDir, 0x9b6bd4, '⚸', `Lilith in ${SIGNS[chart.lilith.sign]}`);
    }

    // Natal aspect web: trine/square chords drawn between the bodies'
    // zodiac directions on a small wheel around Earth — the classic chart
    // pattern, floating in space. Grand trines glow gold-green.
    {
      const { trines, squares, grandTrines } = chartAspects(chart);
      const AR = 54;
      const at = (lon) => E.clone().addScaledVector(eclipticDir(lon), AR);
      const chord = (lonA, lonB, color, opacity) => {
        const geo = new THREE.BufferGeometry().setFromPoints([at(lonA), at(lonB)]);
        group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
          color, transparent: true, opacity,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })));
      };
      const inGrand = new Set();
      for (const gt of grandTrines) {
        for (let i = 0; i < 3; i++) {
          const a = gt[i], b = gt[(i + 1) % 3];
          chord(a.longitude, b.longitude, 0xffe27a, 0.95);
          inGrand.add([a.name, b.name].sort().join('|'));
        }
      }
      for (const { a, b } of trines) {
        if (!inGrand.has([a.name, b.name].sort().join('|'))) {
          chord(a.longitude, b.longitude, 0x7fd68f, 0.5);
        }
      }
      for (const { a, b } of squares) chord(a.longitude, b.longitude, 0xff8a5c, 0.5);
    }

    // Observer's horizon plane: perpendicular to the local zenith. The
    // zenith points at RA = local sidereal time, Dec = latitude.
    const lst = gmst(chart.jd) + longitude; // degrees
    const [zLon, zLat] = equatorialToEcliptic(lst / 15, latitude);
    const zenith = eclipticDir(zLon, zLat);

    const HR = 62; // horizon disc radius
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(HR, 72),
      new THREE.MeshBasicMaterial({
        color: 0x51e0c8, transparent: true, opacity: 0.14,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    disc.position.copy(E);
    disc.lookAt(E.clone().add(zenith));
    group.add(disc);

    const rim = new THREE.Mesh(
      new THREE.RingGeometry(HR - 0.9, HR + 0.9, 96),
      new THREE.MeshBasicMaterial({
        color: 0x6df0d8, transparent: true, opacity: 0.55,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }),
    );
    rim.position.copy(E);
    rim.lookAt(E.clone().add(zenith));
    group.add(rim);

    // The rising point sits where the horizon rim crosses the ecliptic in
    // the east — mark it, since the rising line lies in this plane.
    const eastMark = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xe69ac2 }),
    );
    eastMark.position.copy(E).addScaledVector(ascDir, HR);
    group.add(eastMark);

    const horizonLabel = makeTextSprite('your horizon — east ↗', {
      fontSize: 38, color: '#6df0d8', scale: 0.9,
    });
    horizonLabel.position.copy(E).addScaledVector(ascDir, HR + 26);
    horizonLabel.position.y -= 8;
    group.add(horizonLabel);

    // Zenith pointer: a short line straight "up" for the observer.
    const zGeo = new THREE.BufferGeometry().setFromPoints([
      E.clone(), E.clone().addScaledVector(zenith, HR * 0.75),
    ]);
    const zLine = new THREE.Line(zGeo, new THREE.LineBasicMaterial({
      color: 0x6df0d8, transparent: true, opacity: 0.4, depthWrite: false,
    }));
    group.add(zLine);

    this.scene.add(group);
    this.geometryGroup = group;
    this.geometryInfo = { E, sunDir, moonDir, ascDir, zenith };
  }

  // Pull back to frame Earth, the horizon disc, and the three sight lines.
  focusChartGeometry() {
    if (!this.geometryInfo) return Promise.resolve();
    const { E, sunDir, moonDir, ascDir } = this.geometryInfo;
    // Aim at the average direction the lines head toward; view from behind.
    const centroid = sunDir.clone().add(moonDir).add(ascDir);
    if (centroid.lengthSq() < 0.05) centroid.copy(sunDir); // degenerate spread
    centroid.normalize();
    const camPos = E.clone()
      .addScaledVector(centroid, -345)
      .add(new THREE.Vector3(0, 260, 0));
    const target = E.clone().addScaledVector(centroid, 175);
    return this.flyTo(camPos, target, 3000);
  }

  highlightConstellation(name, colorHex) {
    const con = this.constellations[name];
    if (!con) return;
    con.lines.material.color.setHex(colorHex);
    con.lines.material.opacity = 1;
    con.label.material.color = new THREE.Color(colorHex);
    con.label.material.opacity = 1;
    this.highlighted.add(name);
  }

  clearHighlights() {
    for (const name of this.highlighted) {
      const con = this.constellations[name];
      con.lines.material.color.setHex(con.baseColor);
      con.lines.material.opacity = 0.55;
      con.label.material.color = new THREE.Color(0xcfe0ff);
      con.label.material.opacity = 0.75;
    }
    this.highlighted.clear();
  }

  _onResize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    requestAnimationFrame(this._animate);
    const dt = this.clock.getDelta();

    // Planet self-rotation + cloud drift; name labels fade out up close.
    for (const name of planetNames()) {
      const p = this.planets[name];
      p.mesh.rotation.y += p.spin * dt * 30;
      const d = this.camera.position.distanceTo(p.holder.position);
      p.label.material.opacity = Math.max(0, Math.min(1, (d - 45) / 55));
    }
    if (this.earthClouds) this.earthClouds.rotation.y += 0.008 * dt * 30;
    if (this.moonMesh) this.moonMesh.rotation.y += 0.002 * dt * 30;
    this.sun.rotation.y += 0.0012 * dt * 30;

    // Gentle corona shimmer.
    const t = performance.now() / 1000;
    if (this.corona) {
      this.corona[0].scale.setScalar(95 + Math.sin(t * 1.3) * 3);
      this.corona[1].scale.setScalar(160 + Math.sin(t * 0.7 + 2) * 6);
    }

    // Camera flight tween (smoothstep easing).
    if (this.flight) {
      const f = this.flight;
      let k = (performance.now() - f.start) / f.duration;
      if (k >= 1) {
        k = 1;
        this.camera.position.copy(f.p1);
        this.controls.target.copy(f.t1);
        this.flight = null;
        f.resolve();
      } else {
        const e = k * k * k * (k * (k * 6 - 15) + 10); // smootherstep
        this.camera.position.lerpVectors(f.p0, f.p1, e);
        this.controls.target.lerpVectors(f.t0, f.t1, e);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
