// ---------------------------------------------------------------------------
// Famous birth charts. Birth data follows commonly cited astrological records
// (AstroDatabank-style); where the birth time is unknown, noon is used and
// timeKnown is false (rising sign is then approximate at best).
// utc = the UTC offset in effect at birth (LMT ≈ longitude/15 for pre-zone
// eras, DST already folded in).
// ---------------------------------------------------------------------------

export const FAMOUS_CATEGORIES = [
  'Celebrities', 'Musicians', 'World Leaders', 'Visionaries', 'Athletes', 'Infamous',
];

export const FAMOUS = [
  // ── Celebrities ──
  { name: 'Marilyn Monroe', cat: 'Celebrities', year: 1926, month: 6, day: 1, hour: 9, minute: 30, lat: 34.05, lon: -118.24, utc: -8, timeKnown: true },
  { name: 'Leonardo DiCaprio', cat: 'Celebrities', year: 1974, month: 11, day: 11, hour: 2, minute: 47, lat: 34.05, lon: -118.24, utc: -8, timeKnown: true },
  { name: 'Oprah Winfrey', cat: 'Celebrities', year: 1954, month: 1, day: 29, hour: 4, minute: 30, lat: 33.06, lon: -89.59, utc: -6, timeKnown: true },
  { name: 'Lady Gaga', cat: 'Celebrities', year: 1986, month: 3, day: 28, hour: 9, minute: 53, lat: 40.71, lon: -74.01, utc: -5, timeKnown: true },
  { name: 'Keanu Reeves', cat: 'Celebrities', year: 1964, month: 9, day: 2, hour: 5, minute: 41, lat: 33.89, lon: 35.5, utc: 2, timeKnown: true },
  { name: 'Beyoncé', cat: 'Celebrities', year: 1981, month: 9, day: 4, hour: 10, minute: 0, lat: 29.76, lon: -95.37, utc: -5, timeKnown: true },
  { name: 'Taylor Swift', cat: 'Celebrities', year: 1989, month: 12, day: 13, hour: 8, minute: 36, lat: 40.34, lon: -75.93, utc: -5, timeKnown: true },
  { name: 'Rihanna', cat: 'Celebrities', year: 1988, month: 2, day: 20, hour: 8, minute: 50, lat: 13.1, lon: -59.62, utc: -4, timeKnown: true },

  // ── Musicians ──
  { name: 'David Bowie', cat: 'Musicians', year: 1947, month: 1, day: 8, hour: 9, minute: 0, lat: 51.51, lon: -0.13, utc: 0, timeKnown: true },
  { name: 'John Lennon', cat: 'Musicians', year: 1940, month: 10, day: 9, hour: 18, minute: 30, lat: 53.41, lon: -2.99, utc: 1, timeKnown: true },
  { name: 'Freddie Mercury', cat: 'Musicians', year: 1946, month: 9, day: 5, hour: 12, minute: 0, lat: -6.17, lon: 39.19, utc: 3, timeKnown: false },
  { name: 'Prince', cat: 'Musicians', year: 1958, month: 6, day: 7, hour: 18, minute: 17, lat: 44.98, lon: -93.27, utc: -5, timeKnown: true },
  { name: 'Kurt Cobain', cat: 'Musicians', year: 1967, month: 2, day: 20, hour: 19, minute: 38, lat: 46.98, lon: -123.82, utc: -8, timeKnown: true },

  // ── World Leaders ──
  { name: 'Barack Obama', cat: 'World Leaders', year: 1961, month: 8, day: 4, hour: 19, minute: 24, lat: 21.31, lon: -157.86, utc: -10, timeKnown: true },
  { name: 'Queen Elizabeth II', cat: 'World Leaders', year: 1926, month: 4, day: 21, hour: 2, minute: 40, lat: 51.51, lon: -0.13, utc: 1, timeKnown: true },
  { name: 'John F. Kennedy', cat: 'World Leaders', year: 1917, month: 5, day: 29, hour: 15, minute: 0, lat: 42.33, lon: -71.12, utc: -5, timeKnown: true },
  { name: 'Mahatma Gandhi', cat: 'World Leaders', year: 1869, month: 10, day: 2, hour: 7, minute: 11, lat: 21.64, lon: 69.61, utc: 4.64, timeKnown: true },
  { name: 'Abraham Lincoln', cat: 'World Leaders', year: 1809, month: 2, day: 12, hour: 6, minute: 54, lat: 37.57, lon: -85.74, utc: -5.72, timeKnown: true },
  { name: 'Winston Churchill', cat: 'World Leaders', year: 1874, month: 11, day: 30, hour: 1, minute: 30, lat: 51.85, lon: -1.35, utc: -0.09, timeKnown: true },

  // ── Visionaries ──
  { name: 'Albert Einstein', cat: 'Visionaries', year: 1879, month: 3, day: 14, hour: 11, minute: 30, lat: 48.4, lon: 9.99, utc: 0.67, timeKnown: true },
  { name: 'Nikola Tesla', cat: 'Visionaries', year: 1856, month: 7, day: 10, hour: 0, minute: 0, lat: 44.6, lon: 15.31, utc: 1.02, timeKnown: true },
  { name: 'Marie Curie', cat: 'Visionaries', year: 1867, month: 11, day: 7, hour: 12, minute: 0, lat: 52.23, lon: 21.01, utc: 1.4, timeKnown: false },
  { name: 'Steve Jobs', cat: 'Visionaries', year: 1955, month: 2, day: 24, hour: 19, minute: 15, lat: 37.77, lon: -122.42, utc: -8, timeKnown: true },
  { name: 'Elon Musk', cat: 'Visionaries', year: 1971, month: 6, day: 28, hour: 7, minute: 30, lat: -25.75, lon: 28.19, utc: 2, timeKnown: false },

  // ── Athletes ──
  { name: 'Muhammad Ali', cat: 'Athletes', year: 1942, month: 1, day: 17, hour: 18, minute: 35, lat: 38.25, lon: -85.76, utc: -6, timeKnown: true },
  { name: 'Michael Jordan', cat: 'Athletes', year: 1963, month: 2, day: 17, hour: 13, minute: 40, lat: 40.68, lon: -73.94, utc: -5, timeKnown: false },
  { name: 'Serena Williams', cat: 'Athletes', year: 1981, month: 9, day: 26, hour: 20, minute: 28, lat: 43.42, lon: -83.95, utc: -4, timeKnown: true },

  // ── Infamous ──
  { name: 'Ted Bundy', cat: 'Infamous', year: 1946, month: 11, day: 24, hour: 22, minute: 35, lat: 44.48, lon: -73.21, utc: -5, timeKnown: true },
  { name: 'Jeffrey Dahmer', cat: 'Infamous', year: 1960, month: 5, day: 21, hour: 16, minute: 34, lat: 43.04, lon: -87.91, utc: -5, timeKnown: true },
  { name: 'Charles Manson', cat: 'Infamous', year: 1934, month: 11, day: 12, hour: 16, minute: 40, lat: 39.1, lon: -84.51, utc: -5, timeKnown: true },
  { name: 'John Wayne Gacy', cat: 'Infamous', year: 1942, month: 3, day: 17, hour: 0, minute: 29, lat: 41.88, lon: -87.63, utc: -5, timeKnown: true },
  { name: 'Aileen Wuornos', cat: 'Infamous', year: 1956, month: 2, day: 29, hour: 12, minute: 0, lat: 42.68, lon: -83.13, utc: -5, timeKnown: false },
];
