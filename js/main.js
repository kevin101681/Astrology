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
  ELEMENTS, elementOfSign, PLANET_INFO, RETRO_INTRO, LILITH_INFO,
} from './data/meanings.js';
import { FAMOUS, FAMOUS_CATEGORIES } from './data/famous.js';
import { WA_CITIES, WORLD_CITIES, dstActive } from './data/cities.js';

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
    : '<strong>Sky right now:</strong> no planets retrograde — all systems direct ✶';
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
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
  set('#val-year', b.year);
  set('#val-month', MONTH_NAMES[b.month - 1]);
  set('#val-day', b.day);
  set('#val-time', fmtClock(+sl.time.value));
  $('#date-readout').textContent =
    `${MONTH_NAMES[b.month - 1]} ${b.day}, ${b.year} · ${fmtClock(+sl.time.value)}`;
}

function setSliders({ year, month, day, hour, minute }) {
  sl.year.value = year;
  sl.month.value = month;
  sl.day.max = daysInMonth(year, month);
  sl.day.value = day;
  sl.time.value = hour * 60 + minute;
  syncSliderReadout();
}

// DST auto-detection state: the rule region of the selected place, and
// whether the user has manually overridden the checkbox.
let dstRule = 'us';
let dstManual = false;

function autoApplyDST() {
  const status = $('#dst-status');
  if (dstRule === 'manual') {
    if (status) status.textContent = '(manual — auto-detect off for custom places)';
    return;
  }
  if (dstManual) {
    if (status) status.textContent = '(manually overridden — pick a city to re-enable auto)';
    return;
  }
  const b = birthInput();
  const active = dstActive(dstRule, b.year, b.month, b.day);
  $('#in-dst').checked = active;
  if (status) {
    status.textContent = active
      ? 'auto-detected: in effect on this date (+1h applied)'
      : 'auto-detected: not in effect on this date';
  }
}

// Live update: the sky rotates as the sliders move.
let quietTimer = null;
function onSliderInput() {
  syncSliderReadout();
  autoApplyDST();
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

// − / + steppers: tap for one step, press-and-hold to auto-repeat.
document.querySelectorAll('.step').forEach((btn) => {
  const bump = () => {
    const el = document.getElementById(btn.dataset.target);
    const next = +el.value + +btn.dataset.step;
    if (next < +el.min || next > +el.max) return;
    el.value = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  let holdTimer = null, repeatTimer = null;
  const start = (ev) => {
    ev.preventDefault();
    bump();
    holdTimer = setTimeout(() => { repeatTimer = setInterval(bump, 100); }, 420);
  };
  const stop = () => { clearTimeout(holdTimer); clearInterval(repeatTimer); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
});

// Tap a value to type it exactly.
function inlineEdit(valBtn, buildEditor, commitValue) {
  valBtn.addEventListener('click', () => {
    if (valBtn.dataset.editing) return;
    valBtn.dataset.editing = '1';
    const editor = buildEditor();
    editor.classList.add('val-editor');
    valBtn.replaceWith(editor);
    editor.focus();
    if (editor.select) editor.select();
    const commit = () => {
      const v = editor.value;
      editor.replaceWith(valBtn);       // reattach before syncing the readout
      delete valBtn.dataset.editing;
      commitValue(v);
      syncSliderReadout();
    };
    editor.addEventListener('blur', commit);
    editor.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === 'Escape') editor.blur();
    });
  });
}

const setSlider = (el, v) => {
  el.value = Math.max(+el.min, Math.min(+el.max, Math.round(v) || +el.value));
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

inlineEdit($('#val-year'), () => {
  const inp = document.createElement('input');
  inp.type = 'number'; inp.min = sl.year.min; inp.max = sl.year.max; inp.value = sl.year.value;
  return inp;
}, (v) => setSlider(sl.year, parseInt(v, 10)));

inlineEdit($('#val-month'), () => {
  const sel = document.createElement('select');
  MONTH_NAMES.forEach((m, i) => {
    const o = document.createElement('option');
    o.value = i + 1; o.textContent = m;
    if (i + 1 === +sl.month.value) o.selected = true;
    sel.appendChild(o);
  });
  return sel;
}, (v) => setSlider(sl.month, parseInt(v, 10)));

inlineEdit($('#val-day'), () => {
  const inp = document.createElement('input');
  inp.type = 'number'; inp.min = 1; inp.max = sl.day.max; inp.value = sl.day.value;
  return inp;
}, (v) => setSlider(sl.day, parseInt(v, 10)));

inlineEdit($('#val-time'), () => {
  const inp = document.createElement('input');
  inp.type = 'time';
  const mins = +sl.time.value;
  inp.value = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return inp;
}, (v) => {
  const [h, m] = String(v).split(':').map(Number);
  if (!Number.isNaN(h) && !Number.isNaN(m)) setSlider(sl.time, h * 60 + m);
});

// --- birthplace picker: live search over all WA cities + world cities ----------

const cityInput = $('#in-city-search');
const cityResults = $('#city-results');

const PLACES = [
  ...WA_CITIES.map(([n, la, lo]) => ({ name: `${n}, WA`, lat: la, lon: lo, utc: -8, rule: 'us' })),
  ...WORLD_CITIES.map(([n, la, lo, u, rule]) => ({ name: n, lat: la, lon: lo, utc: u, rule: rule || 'none' })),
];

function hideCityResults() { cityResults.classList.add('hidden'); }

function applyPlace(p) {
  $('#in-lat').value = p.lat;
  $('#in-lon').value = p.lon;
  $('#in-utc').value = p.utc;
  $('#custom-place').classList.add('hidden');
  $('#tz-hint').textContent =
    `Standard time UTC${p.utc >= 0 ? '+' : ''}${p.utc} — daylight saving is detected automatically.`;
  cityInput.value = p.name;
  dstRule = p.rule || 'none';
  dstManual = false;
  hideCityResults();
  onSliderInput();
}

function useCustomPlace() {
  $('#custom-place').classList.remove('hidden');
  $('#tz-hint').textContent = 'Enter coordinates (+N / +E) and the UTC offset in effect at birth.';
  cityInput.value = 'Custom location';
  dstRule = 'manual';
  hideCityResults();
  onSliderInput();
}

function renderCityResults(query) {
  const q = query.trim().toLowerCase();
  let list;
  if (!q) {
    list = PLACES.slice(0, 8);
  } else {
    const starts = [], contains = [];
    for (const p of PLACES) {
      const n = p.name.toLowerCase();
      if (n.startsWith(q)) starts.push(p);
      else if (n.includes(q)) contains.push(p);
    }
    list = [...starts, ...contains].slice(0, 14);
  }
  cityResults.innerHTML = list.map((p) =>
    `<button type="button" class="city-opt" data-i="${PLACES.indexOf(p)}">${p.name}</button>`).join('')
    + '<button type="button" class="city-opt is-custom">✎ Custom coordinates…</button>';
  cityResults.classList.remove('hidden');
  // mousedown (not click) so selection wins the race against the input's blur.
  cityResults.querySelectorAll('.city-opt').forEach((btn) => {
    btn.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      if (btn.classList.contains('is-custom')) useCustomPlace();
      else applyPlace(PLACES[+btn.dataset.i]);
    });
  });
}

cityInput.addEventListener('input', () => renderCityResults(cityInput.value));
cityInput.addEventListener('focus', () => { cityInput.select(); renderCityResults(''); });
cityInput.addEventListener('blur', () => setTimeout(hideCityResults, 150));
$('#in-dst').addEventListener('change', () => { dstManual = true; onSliderInput(); });
applyPlace(PLACES.find((p) => p.name === 'Seattle, WA'));

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
  scene.clearHouseOverlay();
  scene.clearHighlights();
  scene.highlightConstellation(SIGNS[chart.sun.sign], HIGHLIGHT.sun);
  scene.highlightConstellation(SIGNS[chart.moon.sign], HIGHLIGHT.moon);
  scene.highlightConstellation(SIGNS[chart.ascendant.sign], HIGHLIGHT.rising);
  scene.showChartGeometry(chart, loc.latitude, loc.longitude);
  scene.setRetrogrades(chart.planets.filter((p) => p.retro).map((p) => p.name));

  $('#results-title').textContent = name ? `${name}` : 'Your Chart';
  const note = $('#chart-note');
  if (name && !timeKnown) {
    note.textContent = 'Birth time uncertain or unrecorded — the Moon may shift a sign, and Rising/houses are speculative.';
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
      ? `${name}'s birth sky ✶ ${SIGNS[chart.sun.sign]} Sun · ${SIGNS[chart.ascendant.sign]} Rising`
      : 'Mapping your birth sky — Sun, Moon and horizon lines point to your signs ✶');
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
  dstRule = 'manual'; // their utc offset already includes any DST/war time
  dstManual = false;
  cityInput.value = `${person.name}'s birthplace`;
  $('#custom-place').classList.remove('hidden');
  $('#tz-hint').textContent =
    `UTC${person.utc >= 0 ? '+' : ''}${person.utc} — the offset in effect at their birth.`;
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
  // Only true chart twins count: the same Sun sign AND the same Moon sign.
  const matches = famousCharts
    .filter((p) => p.name !== profileName
      && p.chart.sun.sign === chart.sun.sign
      && p.chart.moon.sign === chart.moon.sign)
    .slice(0, 8);

  box.classList.remove('hidden');
  const combo = `${SIGNS[chart.sun.sign]} Sun + ${SIGNS[chart.moon.sign]} Moon`;
  box.innerHTML = `
    <h3>Kindred charts</h3>
    ${matches.length
      ? matches.map((m) => `
        <button type="button" class="kindred-row" data-name="${m.name}">
          <span class="f-name">${m.name}</span>
          <span class="k-match">${combo}</span>
        </button>`).join('')
      : `<p class="k-empty">No famous chart shares your ${combo} — a rare combination.</p>`}`;
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
      if (!chart) { toast('Reveal your chart first ✶'); return; }
      toast('Your birth sky — each line shows how a sign is assigned ✶');
      cinematic(scene.focusChartGeometry());
      return;
    }
    if (where === 'earth') {
      toast('Earth — as it stood in your birth sky ♁');
      cinematic(scene.focusEarth());
      return;
    }
    if (!chart) { toast('Reveal your chart first ✶'); return; }
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
      }).join('')}
      <div class="lilith-block">
        <div class="planet-row">
          <div class="p-glyph lilith-glyph">${LILITH_INFO.glyph}</div>
          <div>
            <div class="p-title">${LILITH_INFO.title}
              <span class="h-sign" style="color:#b48ae0">
                ${SIGN_GLYPHS[chart.lilith.sign]} ${fmtLongitude(chart.lilith.longitude)}</span>
            </div>
            <div class="p-domain">${LILITH_INFO.domain}</div>
            <div class="h-text">${LILITH_INFO.intro}</div>
            <div class="h-text lilith-reading">${LILITH_INFO.signs[SIGNS[chart.lilith.sign]]}</div>
          </div>
        </div>
      </div>`;
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
      and each following sign rules the next arena of life. Tap a house to
      see its wedge overlaid on your sky.</p>
      ${chart.houses.map((h) => {
        const hm = HOUSE_MEANINGS[h.house - 1];
        return `
        <div class="house-row" data-house="${h.house}" role="button" tabindex="0">
          <div class="num">${h.house}</div>
          <div>
            <div class="h-title">${hm.title}
              <span class="h-sign" style="color:${ELEMENTS[elementOfSign(h.sign)].color}">
                ${SIGN_GLYPHS[h.sign]} ${SIGNS[h.sign]}</span></div>
            <div class="h-text">${hm.text}</div>
          </div>
        </div>`;
      }).join('')}`;
    const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 3 && n % 100 < 21) ? 0 : Math.min(n % 10, 4)] || 'th');
    box.querySelectorAll('.house-row').forEach((row) => {
      row.addEventListener('click', () => {
        const num = +row.dataset.house;
        const hm = HOUSE_MEANINGS[num - 1];
        const h = chart.houses[num - 1];
        box.querySelectorAll('.house-row').forEach((r) => r.classList.remove('active'));
        row.classList.add('active');
        scene.showHouseOverlay(chart, num, `${ordinal(num)} House — ${hm.title}`);
        toast(`${ordinal(num)} house · ${hm.title} · ${SIGNS[h.sign]}`);
        cinematic(scene.focusHouse());
      });
    });
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
