// ---------------------------------------------------------------------------
// main.js — UI wiring: birth sliders → chart math → 3D camera tour + readings,
// famous charts, and kindred-sign matching.
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
import { FAMOUS, FAMOUS_CATEGORIES } from './data/famous.js';

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
const CUSTOM_CITY_INDEX = CITIES.length - 1;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HIGHLIGHT = { sun: 0xe8c96a, moon: 0xc9d6ea, rising: 0xe69ac2 };
const ROLE_GLYPH = { sun: '☉', moon: '☾', rising: '↑' };

const $ = (sel) => document.querySelector(sel);

// --- boot -------------------------------------------------------------------

const scene = new AstroScene($('#space'));

{
  const now = new Date();
  scene.setDate(julianDay(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60,
  ));
}

let chart = null;          // currently displayed chart
let profileName = null;    // null = the user's own chart

// Famous charts, precomputed once (cheap — pure math).
const famousCharts = FAMOUS.map((p) => ({
  ...p,
  chart: computeChart({
    year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute,
    utcOffset: p.utc, latitude: p.lat, longitude: p.lon,
  }),
}));

// --- "Sky right now": current retrogrades ------------------------------------

{
  const now = new Date();
  const jdNow = julianDay(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60,
  );
  const retro = CHART_PLANETS.filter((p) => isRetrograde(p, jdNow)).map((p) => {
    const end = retrogradeUntil(p, jdNow);
    const d = end ? jdToDate(end) : null;
    const until = d ? ` (until ~${MONTHS_SHORT[d.month - 1]} ${d.day})` : '';
    return `${PLANET_INFO[p].glyph} ${PLANET_INFO[p].title} ℞${until}`;
  });
  $('#now-sky').innerHTML = retro.length
    ? `<strong>Sky right now:</strong> ${retro.join(' · ')}`
    : '<strong>Sky right now:</strong> no planets retrograde — all systems direct ✨';
}

// --- birth sliders ------------------------------------------------------------

const sl = {
  year: $('#sl-year'), month: $('#sl-month'), day: $('#sl-day'), time: $('#sl-time'),
};

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function fmtClock(minutes) {
  const h24 = Math.floor(minutes / 60), mm = minutes % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

function birthInput() {
  const year = +sl.year.value, month = +sl.month.value, day = +sl.day.value;
  const minutes = +sl.time.value;
  return { year, month, day, hour: Math.floor(minutes / 60), minute: minutes % 60 };
}

function locationInput() {
  const latitude = parseFloat($('#in-lat').value);
  const longitude = parseFloat($('#in-lon').value);
  let utcOffset = parseFloat($('#in-utc').value);
  if ($('#in-dst').checked) utcOffset += 1;
  return { latitude, longitude, utcOffset };
}

function syncSliderReadout() {
  const b = birthInput();
  const max = daysInMonth(b.year, b.month);
  sl.day.max = max;
  if (+sl.day.value > max) { sl.day.value = max; b.day = max; }
  $('#val-year').textContent = b.year;
  $('#val-month').textContent = MONTH_NAMES[b.month - 1];
  $('#val-day').textContent = b.day;
  $('#val-time').textContent = fmtClock(+sl.time.value);
  $('#date-readout').textContent =
    `${MONTH_NAMES[b.month - 1]} ${b.day}, ${b.year} · ${fmtClock(+sl.time.value)}`;
}

function setSliders({ year, month, day, hour, minute }) {
  sl.year.value = year;
  sl.month.value = month;
  sl.day.max = daysInMonth(year, month);
  sl.day.value = day;
  sl.time.value = hour * 60 + Math.round(minute / 5) * 5;
  syncSliderReadout();
}

// Live update: the sky rotates as the sliders move.
let quietTimer = null;
function onSliderInput() {
  syncSliderReadout();
  const b = birthInput();
  const { utcOffset } = locationInput();
  const jd = julianDay(b.year, b.month, b.day, b.hour + b.minute / 60 - (utcOffset || 0));
  scene.setDate(jd);                       // planets glide immediately
  if (chart) {                             // full chart refresh, debounced
    profileName = null;                    // manual edits mean it's your sky again
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => revealChart({ fly: false, quiet: true }), 250);
  }
}
Object.values(sl).forEach((s) => s.addEventListener('input', onSliderInput));
syncSliderReadout();

// --- city selector ------------------------------------------------------------

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
citySel.addEventListener('change', () => { syncCity(); onSliderInput(); });
$('#in-dst').addEventListener('change', onSliderInput);
syncCity();

// --- panels & toast -------------------------------------------------------------

$('#menu-toggle').addEventListener('click', () => $('#menu').classList.toggle('collapsed'));
$('#results-toggle').addEventListener('click', () => $('#results').classList.toggle('collapsed'));

// Fade the UI cards out for the duration of a camera flight, back in after.
async function cinematic(flight) {
  document.body.classList.add('ui-dimmed');
  try {
    await flight;
  } finally {
    document.body.classList.remove('ui-dimmed');
  }
}

// Swipe down on a bottom-sheet card (mobile) to close it, with live drag.
function enableSwipeToClose(panel) {
  const body = panel.querySelector('.panel-body');
  let startY = null, dy = 0, active = false;

  panel.addEventListener('touchstart', (e) => {
    if (!window.matchMedia('(max-width: 900px)').matches) return;
    if (panel.classList.contains('collapsed')) return;
    if (body.scrollTop > 2) return;   // only when the card is scrolled to top
    startY = e.touches[0].clientY;
    dy = 0;
    active = true;
  }, { passive: true });

  panel.addEventListener('touchmove', (e) => {
    if (!active || startY === null) return;
    dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      panel.classList.add('dragging');
      panel.style.transform = `translateY(${dy}px)`;
    }
  }, { passive: true });

  const finish = () => {
    if (!active) return;
    active = false;
    panel.classList.remove('dragging');
    panel.style.transform = '';
    if (dy > 90) panel.classList.add('collapsed');
    startY = null;
    dy = 0;
  };
  panel.addEventListener('touchend', finish);
  panel.addEventListener('touchcancel', finish);
}
enableSwipeToClose($('#menu'));
enableSwipeToClose($('#results'));

function toast(msg, ms = 3200) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

// --- reveal pipeline -------------------------------------------------------------

function revealChart({ fly = true, quiet = false, name = null, timeKnown = true } = {}) {
  const b = birthInput();
  const loc = locationInput();
  if ([loc.latitude, loc.longitude, loc.utcOffset].some(Number.isNaN)) {
    if (!quiet) toast('Please fill in valid location values.');
    return;
  }

  chart = computeChart({ ...b, utcOffset: loc.utcOffset, latitude: loc.latitude, longitude: loc.longitude });
  profileName = name;

  scene.setDate(chart.jd);
  scene.clearHighlights();
  scene.highlightConstellation(SIGNS[chart.sun.sign], HIGHLIGHT.sun);
  scene.highlightConstellation(SIGNS[chart.moon.sign], HIGHLIGHT.moon);
  scene.highlightConstellation(SIGNS[chart.ascendant.sign], HIGHLIGHT.rising);
  scene.showChartGeometry(chart, loc.latitude, loc.longitude);
  scene.setRetrogrades(chart.planets.filter((p) => p.retro).map((p) => p.name));

  $('#results-title').textContent = name ? `${name}` : 'Your Chart';
  const note = $('#chart-note');
  if (name && !timeKnown) {
    note.textContent = 'Birth time unrecorded — noon used, so Moon is approximate and Rising/houses are speculative.';
    note.classList.remove('hidden');
  } else {
    note.classList.add('hidden');
  }

  renderResults();
  renderKindred();
  $('#results').classList.remove('hidden');
  $('#results').classList.remove('collapsed');
  $('#nav-buttons').classList.remove('hidden');
  if (window.innerWidth < 900 && !quiet) $('#menu').classList.add('collapsed');

  if (fly) {
    toast(name
      ? `${name}'s birth sky ✦ ${SIGNS[chart.sun.sign]} Sun · ${SIGNS[chart.ascendant.sign]} Rising`
      : 'Mapping your birth sky — Sun, Moon and horizon lines point to your signs ✦');
    cinematic(scene.focusChartGeometry());
  }
}

$('#birth-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  revealChart({ fly: true });
});

// --- famous charts ---------------------------------------------------------------

const famCat = $('#famous-cat');
FAMOUS_CATEGORIES.forEach((c) => {
  const opt = document.createElement('option');
  opt.value = c; opt.textContent = c;
  famCat.appendChild(opt);
});

function loadFamous(person) {
  setSliders(person);
  citySel.value = CUSTOM_CITY_INDEX;
  syncCity();
  $('#in-lat').value = person.lat;
  $('#in-lon').value = person.lon;
  $('#in-utc').value = person.utc;
  $('#in-dst').checked = false;
  revealChart({ fly: true, name: person.name, timeKnown: person.timeKnown });
}

function renderFamousList() {
  const cat = famCat.value;
  const list = $('#famous-list');
  list.innerHTML = '';
  for (const p of famousCharts.filter((f) => f.cat === cat)) {
    const c = p.chart;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'famous-row';
    btn.innerHTML = `
      <span class="f-name">${p.name}</span>
      <span class="f-signs">
        ☉${SIGN_GLYPHS[c.sun.sign]} ☾${SIGN_GLYPHS[c.moon.sign]} ↑${SIGN_GLYPHS[c.ascendant.sign]}
      </span>`;
    btn.addEventListener('click', () => loadFamous(p));
    list.appendChild(btn);
  }
}
famCat.addEventListener('change', renderFamousList);
renderFamousList();

// Kindred charts: famous people sharing signs with the displayed chart.
function renderKindred() {
  const box = $('#kindred');
  if (!chart) { box.classList.add('hidden'); return; }
  const matches = famousCharts
    .filter((p) => p.name !== profileName)
    .map((p) => {
      const parts = [];
      if (p.chart.sun.sign === chart.sun.sign) parts.push('Sun');
      if (p.chart.moon.sign === chart.moon.sign) parts.push('Moon');
      if (p.chart.ascendant.sign === chart.ascendant.sign) parts.push('Rising');
      return { p, parts, score: parts.length };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (!matches.length) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `
    <h3>Kindred charts</h3>
    ${matches.map((m) => `
      <button type="button" class="kindred-row" data-name="${m.p.name}">
        <span class="f-name">${m.p.name}</span>
        <span class="k-match">${m.parts.join(' + ')} match${m.score > 1 ? 'es' : ''}</span>
      </button>`).join('')}`;
  box.querySelectorAll('.kindred-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const person = famousCharts.find((p) => p.name === btn.dataset.name);
      if (person) loadFamous(person);
    });
  });
}

// --- fly-to buttons -----------------------------------------------------------

document.querySelectorAll('.fly').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const where = btn.dataset.fly;
    if (where === 'overview') { cinematic(scene.focusOverview()); return; }
    if (where === 'geometry') {
      if (!chart) { toast('Reveal your chart first ✦'); return; }
      toast('Your birth sky — each line shows how a sign is assigned ✦');
      cinematic(scene.focusChartGeometry());
      return;
    }
    if (where === 'earth') {
      toast('Earth — as it stood in your birth sky ♁');
      cinematic(scene.focusEarth());
      return;
    }
    if (!chart) { toast('Reveal your chart first ✦'); return; }
    const sign = where === 'sun' ? chart.sun.sign
      : where === 'moon' ? chart.moon.sign
      : chart.ascendant.sign;
    setActiveTab(where);
    toast(`Flying to ${SIGNS[sign]} — your ${where} sign ${ROLE_GLYPH[where]}`);
    await cinematic(scene.focusConstellation(SIGNS[sign]));
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
      cinematic(scene.focusConstellation(SIGNS[sign]));
    });
    b3.appendChild(div);
  }
  const active = document.querySelector('.tab.active');
  setActiveTab(active ? active.dataset.tab : 'sun');
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
    blurb = `Pure ${entries[0][0]} — the Sun, Moon and Rising all share one element. ${ELEMENTS[entries[0][0]].keyword[0].toUpperCase()}${ELEMENTS[entries[0][0]].keyword.slice(1)} runs through everything.`;
  } else if (entries.length === 2) {
    blurb = `Mostly ${entries[0][0]} (${entries[0][1]} of 3) with a current of ${entries[1][0]} — ${ELEMENTS[entries[0][0]].keyword}, tempered by ${ELEMENTS[entries[1][0]].keyword}.`;
  } else {
    blurb = 'Three placements, three elements — an unusually balanced blend, at home on almost any wavelength.';
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
        ? 'No planets were retrograde at this birth — a rare all-direct chart.'
        : `${retroCount} planet${retroCount > 1 ? 's were' : ' was'} retrograde ℞ at this birth.`}</p>
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
              <span class="element-count">${counts[name] ? `× ${counts[name]} in the big three` : ''}</span>
              <div class="element-trine">${el.trine}</div>
            </div>
          </div>
          <p class="element-text">${el.text}</p>
        </div>`).join('')}`;
    return;
  }

  if (tab === 'houses') {
    box.innerHTML = `
      <p class="intro">Whole-sign houses: the rising sign becomes the 1st house,
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
