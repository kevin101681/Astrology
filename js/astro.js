// ---------------------------------------------------------------------------
// astro.js — lightweight ephemeris + birth-chart math (no dependencies)
//
// Accuracy notes:
//  * Sun longitude:  low-precision formula, good to ~0.01°  (sign-accurate)
//  * Moon longitude: truncated ELP series, good to ~0.3°    (sign-accurate
//    except within minutes of a sign cusp)
//  * Ascendant:      standard rigorous formula from local sidereal time,
//    obliquity and geographic latitude
//  * Houses:         whole-sign system (house 1 = rising sign)
// All angles in degrees unless noted.
// ---------------------------------------------------------------------------

const DEG = Math.PI / 180;

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export function norm360(x) {
  x %= 360;
  return x < 0 ? x + 360 : x;
}

export function signOf(longitude) {
  return Math.floor(norm360(longitude) / 30);
}

export function degreeInSign(longitude) {
  return norm360(longitude) % 30;
}

export function fmtLongitude(longitude) {
  const d = degreeInSign(longitude);
  const whole = Math.floor(d);
  const min = Math.round((d - whole) * 60);
  return `${whole}°${String(min).padStart(2, '0')}′ ${SIGNS[signOf(longitude)]}`;
}

// Julian Day from a UTC calendar date/time.
export function julianDay(year, month, day, hourUTC) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + B - 1524.5 + hourUTC / 24;
}

// Days since J2000.0
const j2000 = (jd) => jd - 2451545.0;

// Mean obliquity of the ecliptic.
export function obliquity(jd) {
  const T = j2000(jd) / 36525;
  return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T;
}

// Apparent-ish ecliptic longitude of the Sun (geocentric).
export function sunLongitude(jd) {
  const n = j2000(jd);
  const L = norm360(280.460 + 0.9856474 * n);       // mean longitude
  const g = norm360(357.528 + 0.9856003 * n) * DEG; // mean anomaly
  return norm360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
}

// Geocentric ecliptic longitude of the Moon (truncated ELP-2000 series).
export function moonLongitude(jd) {
  const T = j2000(jd) / 36525;
  const Lp = norm360(218.3164477 + 481267.88123421 * T);  // mean longitude
  const D  = norm360(297.8501921 + 445267.1114034 * T) * DEG;  // elongation
  const M  = norm360(357.5291092 + 35999.0502909 * T) * DEG;   // sun anomaly
  const Mp = norm360(134.9633964 + 477198.8675055 * T) * DEG;  // moon anomaly
  const F  = norm360(93.2720950 + 483202.0175233 * T) * DEG;   // arg. latitude

  const dL =
      6.288774 * Math.sin(Mp)
    + 1.274027 * Math.sin(2 * D - Mp)
    + 0.658314 * Math.sin(2 * D)
    + 0.213618 * Math.sin(2 * Mp)
    - 0.185116 * Math.sin(M)
    - 0.114332 * Math.sin(2 * F)
    + 0.058793 * Math.sin(2 * D - 2 * Mp)
    + 0.057066 * Math.sin(2 * D - M - Mp)
    + 0.053322 * Math.sin(2 * D + Mp)
    + 0.045758 * Math.sin(2 * D - M)
    - 0.040923 * Math.sin(M - Mp)
    - 0.034720 * Math.sin(D)
    - 0.030383 * Math.sin(M + Mp)
    + 0.015327 * Math.sin(2 * D - 2 * F)
    - 0.012528 * Math.sin(Mp + 2 * F)
    + 0.010980 * Math.sin(Mp - 2 * F);

  return norm360(Lp + dL);
}

// Greenwich mean sidereal time, degrees.
export function gmst(jd) {
  const n = j2000(jd);
  const T = n / 36525;
  return norm360(280.46061837 + 360.98564736629 * n + 0.000387933 * T * T);
}

// Ascendant (rising degree of the ecliptic) for a UTC instant and place.
// latitude: geographic degrees (+N), longitude: degrees (+E).
export function ascendant(jd, latitude, longitude) {
  const lst = norm360(gmst(jd) + longitude);   // local sidereal time = RAMC
  const ramc = lst * DEG;
  const eps = obliquity(jd) * DEG;
  const phi = latitude * DEG;
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  ) / DEG;
  return norm360(asc);
}

// Midheaven (MC): ecliptic longitude on the meridian.
export function midheaven(jd, longitude) {
  const ramc = norm360(gmst(jd) + longitude) * DEG;
  const eps = obliquity(jd) * DEG;
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG;
  return norm360(mc);
}

// Approximate heliocentric mean longitudes of the planets (for scene
// placement — visually faithful, not chart-grade). J2000 elements + rates.
const PLANET_ELEMENTS = {
  mercury: { L0: 252.25084, rate: 4.09233445, a: 0.387 },
  venus:   { L0: 181.97973, rate: 1.60213034, a: 0.723 },
  earth:   { L0: 100.46435, rate: 0.98560910, a: 1.000 },
  mars:    { L0: 355.45332, rate: 0.52402068, a: 1.524 },
  jupiter: { L0:  34.40438, rate: 0.08308529, a: 5.203 },
  saturn:  { L0:  49.94432, rate: 0.03344414, a: 9.537 },
  uranus:  { L0: 313.23218, rate: 0.01172834, a: 19.191 },
  neptune: { L0: 304.88003, rate: 0.00598103, a: 30.069 },
};

export function planetHelioLongitude(name, jd) {
  const el = PLANET_ELEMENTS[name];
  return norm360(el.L0 + el.rate * j2000(jd));
}

export function planetNames() {
  return Object.keys(PLANET_ELEMENTS);
}

// Moon's geocentric position expressed as an angle around Earth for the
// scene (ecliptic longitude relative to Earth).
export function moonPhaseAngle(jd) {
  return norm360(moonLongitude(jd) - sunLongitude(jd));
}

// ---------------------------------------------------------------------------
// Full birth chart
// ---------------------------------------------------------------------------

export function computeChart({ year, month, day, hour, minute, utcOffset, latitude, longitude }) {
  const hourUTC = hour + minute / 60 - utcOffset;
  const jd = julianDay(year, month, day, hourUTC);

  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);
  const ascLon = ascendant(jd, latitude, longitude);
  const mcLon = midheaven(jd, longitude);

  const risingSign = signOf(ascLon);

  // Whole-sign houses: house 1 spans the entire rising sign, and each
  // subsequent house is the next sign in zodiacal order.
  const houses = [];
  for (let i = 0; i < 12; i++) {
    houses.push({ house: i + 1, sign: (risingSign + i) % 12 });
  }

  return {
    jd,
    sun: { longitude: sunLon, sign: signOf(sunLon) },
    moon: { longitude: moonLon, sign: signOf(moonLon) },
    ascendant: { longitude: ascLon, sign: risingSign },
    midheaven: { longitude: mcLon, sign: signOf(mcLon) },
    houses,
  };
}
