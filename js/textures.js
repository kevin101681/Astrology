// ---------------------------------------------------------------------------
// textures.js — procedural planet/sun textures on <canvas>.
// Everything is generated locally so the app works fully offline.
// ---------------------------------------------------------------------------

// Deterministic pseudo-random (so the planets look the same every visit).
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tileable-in-X value noise: the lattice wraps horizontally so there is no
// seam where the sphere texture meets itself.
function makeNoise(seed, gridW, gridH) {
  const rand = mulberry32(seed);
  const grid = new Float32Array(gridW * gridH);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const smooth = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    x = ((x % gridW) + gridW) % gridW;
    y = Math.max(0, Math.min(gridH - 1.001, y));
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = (x0 + 1) % gridW, y1 = Math.min(y0 + 1, gridH - 1);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const a = grid[y0 * gridW + x0], b = grid[y0 * gridW + x1];
    const c = grid[y1 * gridW + x0], d = grid[y1 * gridW + x1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

// Fractal Brownian motion built from stacked value-noise octaves.
function makeFBM(seed, octaves = 5) {
  const layers = [];
  for (let o = 0; o < octaves; o++) {
    const cells = 4 * (1 << o);
    layers.push({ noise: makeNoise(seed + o * 101, cells, cells), cells, amp: 1 / (1 << o) });
  }
  const totalAmp = layers.reduce((s, l) => s + l.amp, 0);
  return (u, v) => { // u,v in [0,1]
    let val = 0;
    for (const l of layers) val += l.noise(u * l.cells, v * l.cells) * l.amp;
    return val / totalAmp;
  };
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

// Map t in [0,1] through a multi-stop gradient [[t,color],...].
function gradient(stops, t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const span = stops[i][0] - stops[i - 1][0];
      const local = span > 0 ? (t - stops[i - 1][0]) / span : 0;
      return lerpColor(stops[i - 1][1], stops[i][1], local);
    }
  }
  return stops[stops.length - 1][1];
}

function paint(width, height, pixelFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, height);
  const data = img.data;
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const [r, g, b, a] = pixelFn(u, v);
      const i = (y * width + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
      data[i + 3] = a === undefined ? 255 : a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// --- Individual worlds ------------------------------------------------------

export function rockyTexture({ seed, stops, roughness = 1, craters = 0, size = 512 }) {
  const fbm = makeFBM(seed, 6);
  const craterNoise = makeNoise(seed + 999, 48, 48);
  return paint(size, size / 2, (u, v) => {
    let h = fbm(u, v);
    h = 0.5 + (h - 0.5) * roughness;
    if (craters > 0) {
      const c = craterNoise(u * 48, v * 24);
      if (c > 0.82) h -= (c - 0.82) * craters * 3;
    }
    return gradient(stops, h);
  });
}

export function gasGiantTexture({ seed, stops, bands = 12, turbulence = 0.06, spot = null, size = 512 }) {
  const fbm = makeFBM(seed, 5);
  const warp = makeFBM(seed + 41, 4);
  return paint(size, size / 2, (u, v) => {
    // Latitude bands warped by turbulent noise → swirling stripes.
    const w = (warp(u * 2, v * 2) - 0.5) * turbulence * 2;
    let t = Math.sin((v + w) * Math.PI * bands) * 0.5 + 0.5;
    t = t * 0.7 + fbm(u * 3, v * 3) * 0.3;
    let [r, g, b] = gradient(stops, t);
    if (spot) { // e.g. Jupiter's Great Red Spot
      const du = Math.min(Math.abs(u - spot.u), 1 - Math.abs(u - spot.u)) / spot.ru;
      const dv = (v - spot.v) / spot.rv;
      const d = du * du + dv * dv;
      if (d < 1) {
        const k = (1 - d) * spot.strength;
        r = r + (spot.color[0] - r) * k;
        g = g + (spot.color[1] - g) * k;
        b = b + (spot.color[2] - b) * k;
      }
    }
    return [r, g, b];
  });
}

export function earthTexture({ seed = 7, size = 1024 } = {}) {
  const continents = makeFBM(seed, 6);
  const detail = makeFBM(seed + 500, 6);
  const OCEAN_DEEP = [8, 27, 68], OCEAN = [15, 55, 110], SHELF = [26, 102, 150];
  const SAND = [194, 178, 128], GRASS = [56, 112, 48], FOREST = [28, 74, 34];
  const ROCK = [120, 108, 96], SNOW = [238, 240, 245];
  return paint(size, size / 2, (u, v) => {
    const lat = Math.abs(v - 0.5) * 2; // 0 equator → 1 pole
    let h = continents(u, v) + detail(u, v) * 0.25 - 0.125;
    h += (lat - 0.5) * 0.02;
    const seaLevel = 0.52;
    if (lat > 0.93 - detail(u, v) * 0.05) return SNOW; // polar caps
    if (h < seaLevel) {
      const depth = (seaLevel - h) / seaLevel;
      if (depth < 0.03) return SHELF;
      return lerpColor(OCEAN, OCEAN_DEEP, Math.min(1, depth * 2.5));
    }
    const alt = (h - seaLevel) / (1 - seaLevel);
    if (alt < 0.04) return SAND;
    if (alt > 0.55) return lerpColor(ROCK, SNOW, (alt - 0.55) / 0.45);
    const dryness = detail(u * 2, v * 2);
    const green = lerpColor(GRASS, FOREST, dryness);
    // Deserts near the tropics, tundra toward the poles.
    if (lat < 0.45 && lat > 0.2 && dryness > 0.62) return lerpColor(green, SAND, (dryness - 0.62) * 2.2);
    if (lat > 0.75) return lerpColor(green, ROCK, (lat - 0.75) * 3);
    return green;
  });
}

export function cloudTexture({ seed = 77, size = 1024, cover = 0.52 } = {}) {
  const fbm = makeFBM(seed, 6);
  return paint(size, size / 2, (u, v) => {
    const c = fbm(u, v) + fbm(u * 3, v * 3) * 0.3 - 0.15;
    const a = c > cover ? Math.min(1, (c - cover) * 5) : 0;
    return [255, 255, 255, Math.round(a * 235)];
  });
}

export function sunTexture({ seed = 3, size = 512 } = {}) {
  const fbm = makeFBM(seed, 6);
  const stops = [
    [0.00, [255, 120, 10]],
    [0.35, [255, 170, 30]],
    [0.60, [255, 210, 80]],
    [0.80, [255, 240, 160]],
    [1.00, [255, 255, 230]],
  ];
  return paint(size, size / 2, (u, v) => {
    // Solar granulation: high-frequency cells over a bright base.
    const g = fbm(u * 6, v * 3) * 0.45 + fbm(u * 16, v * 8) * 0.55;
    return gradient(stops, 0.45 + (g - 0.5) * 0.7);
  });
}

// Soft radial glow sprite used for star halos / sun corona.
export function glowSprite({ inner = [255, 240, 200], outer = [255, 130, 20], size = 256 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, `rgba(${inner[0]},${inner[1]},${inner[2]},1)`);
  grad.addColorStop(0.25, `rgba(${outer[0]},${outer[1]},${outer[2]},0.55)`);
  grad.addColorStop(0.6, `rgba(${outer[0]},${outer[1]},${outer[2]},0.12)`);
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

// Round soft particle for the starfield points.
export function starSprite(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function saturnRingTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = 8;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(4242);
  for (let x = 0; x < size; x++) {
    const t = x / size;
    let a = 0.75 - Math.abs(t - 0.5) * 0.6 + (rand() - 0.5) * 0.3;
    // Cassini division and a few ringlet gaps.
    if (t > 0.62 && t < 0.68) a *= 0.15;
    if (t > 0.30 && t < 0.32) a *= 0.4;
    if (t > 0.85 && t < 0.87) a *= 0.5;
    const shade = 190 + Math.floor(rand() * 50);
    ctx.fillStyle = `rgba(${shade},${shade - 18},${shade - 45},${Math.max(0, Math.min(1, a))})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  return canvas;
}

// Milky Way band painted onto a huge background sphere.
export function milkyWayTexture(size = 2048) {
  const fbm = makeFBM(20, 6);
  const fine = makeFBM(21, 7);
  return paint(size, size / 2, (u, v) => {
    // The galactic band, tilted ~60° to the celestial equator.
    const band = Math.sin(u * Math.PI * 2) * 0.22;
    const d = Math.abs(v - 0.5 - band) / 0.16;
    let glow = Math.max(0, 1 - d);
    glow = glow * glow * (0.35 + fbm(u * 2, v * 2) * 0.9);
    const dust = fine(u * 5, v * 5);
    if (dust > 0.62) glow *= Math.max(0.15, 1 - (dust - 0.62) * 4); // dark lanes
    const r = 22 + glow * 95, g = 24 + glow * 92, b = 34 + glow * 118;
    return [r, g, b];
  });
}
