// ---------------------------------------------------------------------------
// main.js — UI wiring: birth form → chart math → 3D camera tour + readings.
// ---------------------------------------------------------------------------

import { AstroScene } from './scene.js';
import {
  computeChart, julianDay, SIGNS, SIGN_GLYPHS, fmtLongitude,
  CHART_PLANETS, isRetrograde, retrogradeUntil, jdToDate,
} from './astro.js';
import {
  SIGN_MEANINGS, HOUSE_MEANINGS, PLACEMENT_INTRO,
  ELEMENTS, elementOfSign, PLANET_INFO, RETRO_INTRO,
} from './data/meanings.js';

// [name, latitude °N, longitude °E, standard UTC offset]
const CITIES = [
  ['New York, USA', 40.71, -74.01, -5],
  ['Los Angeles, USA', 34.05, -118.24, -8],
  ['Chicago, USA', 41.88, -87.63, -6],
  ['Denver, USA', 39.74, -104.99, -7],
  ['Seattle, USA', 47.61, -122.33, -8],
  ['Miami, USA', 25.76, -80.19, -5],
  ['Honolulu, USA', 21.31, -157.86, -10],
  ['Anchorage, USA', 61.22, -149.90, -9],
  ['Toronto, Canada', 43.65, -79.38, -5],
  ['Vancouver, Canada', 49.28, -123.12, -8],
  ['Mexico City, Mexico', 19.43, -99.13, -6],
  ['São Paulo, Brazil', -23.55, -46.63, -3],
  ['Buenos Aires, Argentina', -34.60, -58.38, -3],
  ['London, UK', 51.51, -0.13, 0],
  ['Paris, France', 48.86, 2.35, 1],
  ['Berlin, Germany', 52.52, 13.40, 1],
  ['Madrid, Spain', 40.42, -3.70, 1],
  ['Rome, Italy', 41.90, 12.50, 1],
  ['Athens, Greece', 37.98, 23.73, 2],
  ['Moscow, Russia', 55.76, 37.62, 3],
  ['Istanbul, Türkiye', 41.01, 28.98, 3],
  ['Dubai, UAE', 25.20, 55.27, 4],
  ['Mumbai, India', 19.08, 72.88, 5.5],
  ['New Delhi, India', 28.61, 77.21, 5.5],
  ['Bangkok, Thailand', 13.76, 100.50, 7],
  ['Singapore', 1.35, 103.82, 8],
  ['Hong Kong', 22.32, 114.17, 8],
  ['Beijing, China', 39.90, 116.41, 8],
  ['Shanghai, China', 31.23, 121.47, 8],
  ['Seoul, South Korea', 37.57, 126.98, 9],
  ['Tokyo, Japan', 35.68, 139.69, 9],
  ['Sydney, Australia', -33.87, 151.21, 10],
  ['Auckland, New Zealand', -36.85, 174.76, 12],
  ['Johannesburg, South Africa', -26.20, 28.05, 2],
  ['Cairo, Egypt', 30.04, 31.24, 2],
  ['Lagos, Nigeria', 6.52, 3.38, 1],
  ['Custom location…', null, null, null],
];

const HIGHLIGHT = { sun: 0xe8c96a, moon: 0xc9d6ea, rising: 0xe69ac2 };
const ROLE_GLYPH = { sun: '☉', moon: '☾', rising: '↑' };

const $ = (sel) => document.querySelector(sel);

// --- boot -------------------------------------------------------------------

const scene = new AstroScene($('#space'));

// Show today's sky until a chart is revealed.
{
  const now = new Date();
  scene.setDate(julianDay(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60,
  ));
}

let chart = null;

// "Sky right now" — which planets are currently retrograde.
{
  const now = new Date();
  const jdNow = julianDay(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60,
  );
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const retro = CHART_PLANETS.filter((p) => isRetrograde(p, jdNow)).map((p) => {
    const end = retrogradeUntil(p, jdNow);
    const d = end ? jdToDate(end) : null;
    const until = d ? ` (until ~${MONTHS[d.month - 1]} ${d.day})` : '';
    return `${PLANET_INFO[p].glyph} ${PLANET_INFO[p].title} ℞${until}`;
  });
  $('#now-sky').innerHTML = retro.length
    ? `<strong>Sky right now:</strong> ${retro.join(' · ')}`
    : '<strong>Sky right now:</strong> no planets retrograde — all systems direct ✨';
}

// --- city selector ----------------------------------------------------------

const citySel = $('#in-city');
CITIES.forEach(([name], i) => {
  const opt = document.createElement('option');
  opt.value = i; opt.textContent = name;
  citySel.appendChild(opt);
});
citySel.value = 0;

function syncCity() {
  const [, lat, lon, utc] = CITIES[+citySel.value];
  const custom = lat === null;
  $('#custom-place').classList.toggle('hidden', !custom);
  if (!custom) {
    $('#in-lat').value = lat;
    $('#in-lon').value = lon;
    $('#in-utc').value = utc;
    $('#tz-hint').textContent =
      `Standard time UTC${utc >= 0 ? '+' : ''}${utc}. Tick the box below if DST applied at birth.`;
  } else {
    $('#tz-hint').textContent = 'Enter coordinates (+N / +E) and the UTC offset in effect at birth.';
  }
}
citySel.addEventListener('change', syncCity);
syncCity();

// --- panels -----------------------------------------------------------------

$('#menu-toggle').addEventListener('click', () => $('#menu').classList.toggle('collapsed'));
$('#results-toggle').addEventListener('click', () => $('#results').classList.toggle('collapsed'));

function toast(msg, ms = 3200) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

// --- chart submission ---------------------------------------------------------

$('#birth-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const dateVal = $('#in-date').value;
  const timeVal = $('#in-time').value;
  if (!dateVal || !timeVal) return;

  const [y, m, d] = dateVal.split('-').map(Number);
  const [hh, mm] = timeVal.split(':').map(Number);
  const latitude = parseFloat($('#in-lat').value);
  const longitude = parseFloat($('#in-lon').value);
  let utcOffset = parseFloat($('#in-utc').value);
  if ($('#in-dst').checked) utcOffset += 1;
  if ([latitude, longitude, utcOffset].some(Number.isNaN)) {
    toast('Please fill in valid location values.');
    return;
  }

  chart = computeChart({
    year: y, month: m, day: d, hour: hh, minute: mm,
    utcOffset, latitude, longitude,
  });

  scene.setDate(chart.jd);
  scene.clearHighlights();
  scene.highlightConstellation(SIGNS[chart.sun.sign], HIGHLIGHT.sun);
  scene.highlightConstellation(SIGNS[chart.moon.sign], HIGHLIGHT.moon);
  scene.highlightConstellation(SIGNS[chart.ascendant.sign], HIGHLIGHT.rising);
  scene.showChartGeometry(chart, latitude, longitude);
  scene.setRetrogrades(chart.planets.filter((p) => p.retro).map((p) => p.name));

  renderResults();
  $('#results').classList.remove('hidden');
  $('#results').classList.remove('collapsed');
  $('#nav-buttons').classList.remove('hidden');
  if (window.innerWidth < 900) $('#menu').classList.add('collapsed');

  toast('Mapping your birth sky — Sun, Moon and horizon lines point to your signs ✦');
  await scene.focusChartGeometry();
});

// --- fly-to buttons -----------------------------------------------------------

document.querySelectorAll('.fly').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const where = btn.dataset.fly;
    if (where === 'overview') { scene.focusOverview(); return; }
    if (where === 'geometry') {
      if (!chart) { toast('Reveal your chart first ✦'); return; }
      toast('Your birth sky — each line shows how a sign is assigned ✦');
      scene.focusChartGeometry();
      return;
    }
    if (where === 'earth') {
      toast('Earth — as it stood in your birth sky ♁');
      scene.focusEarth();
      return;
    }
    if (!chart) { toast('Reveal your chart first ✦'); return; }
    const sign = where === 'sun' ? chart.sun.sign
      : where === 'moon' ? chart.moon.sign
      : chart.ascendant.sign;
    setActiveTab(where);
    toast(`Flying to ${SIGNS[sign]} — your ${where} sign ${ROLE_GLYPH[where]}`);
    await scene.focusConstellation(SIGNS[sign]);
  });
});

// --- results rendering ----------------------------------------------------------

function renderResults() {
  const b3 = $('#big-three');
  b3.innerHTML = '';
  for (const role of ['sun', 'moon', 'rising']) {
    const sign = role === 'rising' ? chart.ascendant.sign : chart[role].sign;
    const div = document.createElement('div');
    div.className = `b3 ${role}`;
    div.innerHTML = `
      <span class="glyph">${SIGN_GLYPHS[sign]}</span>
      <span class="role">${ROLE_GLYPH[role]} ${role}</span>
      <span class="sign">${SIGNS[sign]}</span>`;
    div.style.cursor = 'pointer';
    div.title = `Fly to ${SIGNS[sign]}`;
    div.addEventListener('click', () => {
      setActiveTab(role);
      scene.focusConstellation(SIGNS[sign]);
    });
    b3.appendChild(div);
  }
  setActiveTab('sun');
}

function setActiveTab(tab) {
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.tab === tab));
  renderTab(tab);
}

document.querySelectorAll('.tab').forEach((t) =>
  t.addEventListener('click', () => setActiveTab(t.dataset.tab)));

function elementChip(signIndex) {
  const name = elementOfSign(signIndex);
  const el = ELEMENTS[name];
  return `<span class="element-chip" style="--el:${el.color}">${el.emoji} ${name}</span>`;
}

// How the three placements' elements combine, in one sentence.
function elementBalance() {
  const roles = [
    ['Sun', chart.sun.sign], ['Moon', chart.moon.sign], ['Rising', chart.ascendant.sign],
  ];
  const counts = {};
  for (const [, s] of roles) {
    const e = elementOfSign(s);
    counts[e] = (counts[e] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let blurb;
  if (entries.length === 1) {
    blurb = `Pure ${entries[0][0]} — your Sun, Moon and Rising all share one element. ${ELEMENTS[entries[0][0]].keyword[0].toUpperCase()}${ELEMENTS[entries[0][0]].keyword.slice(1)} runs through everything you do.`;
  } else if (entries.length === 2) {
    blurb = `Mostly ${entries[0][0]} (${entries[0][1]} of 3) with a current of ${entries[1][0]} — ${ELEMENTS[entries[0][0]].keyword}, tempered by ${ELEMENTS[entries[1][0]].keyword}.`;
  } else {
    blurb = 'Three placements, three elements — an unusually balanced blend that lets you meet people on almost any wavelength.';
  }
  return { roles, counts, blurb };
}

function renderTab(tab) {
  const box = $('#tab-content');
  if (!chart) { box.innerHTML = ''; return; }

  if (tab === 'planets') {
    const retroCount = chart.planets.filter((p) => p.retro).length;
    box.innerHTML = `
      <p class="intro">${RETRO_INTRO}</p>
      <p class="retro-summary">${retroCount === 0
        ? 'No planets were retrograde when you were born — a rare all-direct chart.'
        : `${retroCount} planet${retroCount > 1 ? 's were' : ' was'} retrograde ℞ at your birth.`}</p>
      ${chart.planets.map((p) => {
        const info = PLANET_INFO[p.name];
        return `
        <div class="planet-row ${p.retro ? 'is-retro' : ''}">
          <div class="p-glyph">${info.glyph}</div>
          <div>
            <div class="p-title">${info.title}
              <span class="h-sign" style="color:${ELEMENTS[elementOfSign(p.sign)].color}">
                ${SIGN_GLYPHS[p.sign]} ${fmtLongitude(p.longitude)}</span>
              ${p.retro ? '<span class="retro-badge">℞ retrograde</span>' : ''}
            </div>
            <div class="p-domain">${info.domain}</div>
            <div class="h-text">${p.retro ? info.retro : info.text}</div>
          </div>
        </div>`;
      }).join('')}`;
    return;
  }

  if (tab === 'elements') {
    const { roles, counts, blurb } = elementBalance();
    box.innerHTML = `
      <p class="intro">Every sign belongs to one of the four classical elements —
      the temperament beneath the twelve signs.</p>
      <div class="balance-card">
        <div class="balance-row">
          ${roles.map(([role, s]) => `
            <div class="balance-cell">
              <span class="role">${role}</span>
              ${elementChip(s)}
            </div>`).join('')}
        </div>
        <p class="balance-blurb">${blurb}</p>
      </div>
      ${Object.entries(ELEMENTS).map(([name, el]) => `
        <div class="element-block" style="--el:${el.color}">
          <div class="element-head">
            <span class="element-emoji">${el.emoji}</span>
            <div>
              <strong>${name}</strong>
              <span class="element-count">${counts[name] ? `× ${counts[name]} in your big three` : ''}</span>
              <div class="element-trine">${el.trine}</div>
            </div>
          </div>
          <p class="element-text">${el.text}</p>
        </div>`).join('')}`;
    return;
  }

  if (tab === 'houses') {
    box.innerHTML = `
      <p class="intro">Whole-sign houses: your rising sign becomes your 1st house,
      and each following sign rules the next arena of life.</p>
      ${chart.houses.map((h) => {
        const hm = HOUSE_MEANINGS[h.house - 1];
        return `
        <div class="house-row">
          <div class="num">${h.house}</div>
          <div>
            <div class="h-title">${hm.title}
              <span class="h-sign" style="color:${ELEMENTS[elementOfSign(h.sign)].color}">
                ${SIGN_GLYPHS[h.sign]} ${SIGNS[h.sign]}</span></div>
            <div class="h-text">${hm.text}</div>
          </div>
        </div>`;
      }).join('')}`;
    return;
  }

  const placement = tab === 'rising' ? chart.ascendant : chart[tab];
  const sign = SIGNS[placement.sign];
  const m = SIGN_MEANINGS[sign];
  box.innerHTML = `
    <div class="placement-head">
      <span class="big-glyph">${SIGN_GLYPHS[placement.sign]}</span>
      <div>
        <strong>${sign}</strong>
        <div class="degree">${ROLE_GLYPH[tab]} at ${fmtLongitude(placement.longitude)}</div>
      </div>
    </div>
    <div class="meta">${elementChip(placement.sign)} ${m.symbol} · ${m.quality} · ruled by ${m.ruler} · ${m.dates}</div>
    <div class="traits">${m.keywords.map((k) => `<span class="trait">${k}</span>`).join('')}</div>
    <p class="intro">${PLACEMENT_INTRO[tab]}</p>
    <p>${m[tab]}</p>`;
}
