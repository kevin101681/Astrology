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
  { name: 'Audrey Hepburn', cat: 'Celebrities', year: 1929, month: 5, day: 4, hour: 3, minute: 0, lat: 50.85, lon: 4.35, utc: 0, timeKnown: true },
  { name: 'Elvis Presley', cat: 'Celebrities', year: 1935, month: 1, day: 8, hour: 4, minute: 35, lat: 34.26, lon: -88.7, utc: -6, timeKnown: true },
  { name: 'Elizabeth Taylor', cat: 'Celebrities', year: 1932, month: 2, day: 27, hour: 2, minute: 30, lat: 51.51, lon: -0.13, utc: 0, timeKnown: true },
  { name: 'Johnny Depp', cat: 'Celebrities', year: 1963, month: 6, day: 9, hour: 8, minute: 44, lat: 37.77, lon: -87.11, utc: -6, timeKnown: true },
  { name: 'Angelina Jolie', cat: 'Celebrities', year: 1975, month: 6, day: 4, hour: 9, minute: 9, lat: 34.05, lon: -118.24, utc: -7, timeKnown: true },
  { name: 'Brad Pitt', cat: 'Celebrities', year: 1963, month: 12, day: 18, hour: 6, minute: 31, lat: 35.33, lon: -96.93, utc: -6, timeKnown: true },
  { name: 'Kim Kardashian', cat: 'Celebrities', year: 1980, month: 10, day: 21, hour: 10, minute: 46, lat: 34.05, lon: -118.24, utc: -7, timeKnown: true },
  { name: 'Zendaya', cat: 'Celebrities', year: 1996, month: 9, day: 1, hour: 12, minute: 0, lat: 37.8, lon: -122.27, utc: -7, timeKnown: false },
  { name: 'Tom Cruise', cat: 'Celebrities', year: 1962, month: 7, day: 3, hour: 12, minute: 5, lat: 43.05, lon: -76.15, utc: -4, timeKnown: false },
  { name: 'Dolly Parton', cat: 'Celebrities', year: 1946, month: 1, day: 19, hour: 20, minute: 25, lat: 35.87, lon: -83.56, utc: -5, timeKnown: true },
  { name: 'Robin Williams', cat: 'Celebrities', year: 1951, month: 7, day: 21, hour: 13, minute: 34, lat: 41.88, lon: -87.63, utc: -5, timeKnown: true },
  { name: 'Whitney Houston', cat: 'Celebrities', year: 1963, month: 8, day: 9, hour: 20, minute: 55, lat: 40.74, lon: -74.17, utc: -4, timeKnown: true },

  // ── Musicians ──
  { name: 'David Bowie', cat: 'Musicians', year: 1947, month: 1, day: 8, hour: 9, minute: 0, lat: 51.51, lon: -0.13, utc: 0, timeKnown: true },
  { name: 'John Lennon', cat: 'Musicians', year: 1940, month: 10, day: 9, hour: 18, minute: 30, lat: 53.41, lon: -2.99, utc: 1, timeKnown: true },
  { name: 'Freddie Mercury', cat: 'Musicians', year: 1946, month: 9, day: 5, hour: 12, minute: 0, lat: -6.17, lon: 39.19, utc: 3, timeKnown: false },
  { name: 'Prince', cat: 'Musicians', year: 1958, month: 6, day: 7, hour: 18, minute: 17, lat: 44.98, lon: -93.27, utc: -5, timeKnown: true },
  { name: 'Kurt Cobain', cat: 'Musicians', year: 1967, month: 2, day: 20, hour: 19, minute: 38, lat: 46.98, lon: -123.82, utc: -8, timeKnown: true },
  { name: 'Madonna', cat: 'Musicians', year: 1958, month: 8, day: 16, hour: 7, minute: 5, lat: 43.59, lon: -83.89, utc: -5, timeKnown: true },
  { name: 'Michael Jackson', cat: 'Musicians', year: 1958, month: 8, day: 29, hour: 19, minute: 33, lat: 41.59, lon: -87.35, utc: -5, timeKnown: true },
  { name: 'Bob Dylan', cat: 'Musicians', year: 1941, month: 5, day: 24, hour: 21, minute: 5, lat: 46.79, lon: -92.1, utc: -6, timeKnown: true },
  { name: 'Jimi Hendrix', cat: 'Musicians', year: 1942, month: 11, day: 27, hour: 10, minute: 15, lat: 47.61, lon: -122.33, utc: -7, timeKnown: true },
  { name: 'Janis Joplin', cat: 'Musicians', year: 1943, month: 1, day: 19, hour: 9, minute: 45, lat: 29.9, lon: -93.93, utc: -5, timeKnown: true },
  { name: 'Elton John', cat: 'Musicians', year: 1947, month: 3, day: 25, hour: 2, minute: 0, lat: 51.59, lon: -0.38, utc: 1, timeKnown: true },
  { name: 'Billie Eilish', cat: 'Musicians', year: 2001, month: 12, day: 18, hour: 11, minute: 30, lat: 34.05, lon: -118.24, utc: -8, timeKnown: true },
  { name: 'Drake', cat: 'Musicians', year: 1986, month: 10, day: 24, hour: 12, minute: 0, lat: 43.65, lon: -79.38, utc: -4, timeKnown: false },
  { name: 'Adele', cat: 'Musicians', year: 1988, month: 5, day: 5, hour: 12, minute: 0, lat: 51.51, lon: -0.13, utc: 1, timeKnown: false },
  { name: 'Bob Marley', cat: 'Musicians', year: 1945, month: 2, day: 6, hour: 14, minute: 30, lat: 18.27, lon: -77.4, utc: -5, timeKnown: true },

  // ── World Leaders ──
  { name: 'Barack Obama', cat: 'World Leaders', year: 1961, month: 8, day: 4, hour: 19, minute: 24, lat: 21.31, lon: -157.86, utc: -10, timeKnown: true },
  { name: 'Queen Elizabeth II', cat: 'World Leaders', year: 1926, month: 4, day: 21, hour: 2, minute: 40, lat: 51.51, lon: -0.13, utc: 1, timeKnown: true },
  { name: 'John F. Kennedy', cat: 'World Leaders', year: 1917, month: 5, day: 29, hour: 15, minute: 0, lat: 42.33, lon: -71.12, utc: -5, timeKnown: true },
  { name: 'Mahatma Gandhi', cat: 'World Leaders', year: 1869, month: 10, day: 2, hour: 7, minute: 11, lat: 21.64, lon: 69.61, utc: 4.64, timeKnown: true },
  { name: 'Abraham Lincoln', cat: 'World Leaders', year: 1809, month: 2, day: 12, hour: 6, minute: 54, lat: 37.57, lon: -85.74, utc: -5.72, timeKnown: true },
  { name: 'Winston Churchill', cat: 'World Leaders', year: 1874, month: 11, day: 30, hour: 1, minute: 30, lat: 51.85, lon: -1.35, utc: -0.09, timeKnown: true },
  { name: 'Martin Luther King Jr.', cat: 'World Leaders', year: 1929, month: 1, day: 15, hour: 12, minute: 0, lat: 33.75, lon: -84.39, utc: -5, timeKnown: true },
  { name: 'Nelson Mandela', cat: 'World Leaders', year: 1918, month: 7, day: 18, hour: 14, minute: 54, lat: -31.96, lon: 28.49, utc: 2, timeKnown: false },
  { name: 'Franklin D. Roosevelt', cat: 'World Leaders', year: 1882, month: 1, day: 30, hour: 20, minute: 45, lat: 41.79, lon: -73.93, utc: -4.93, timeKnown: true },
  { name: 'Princess Diana', cat: 'World Leaders', year: 1961, month: 7, day: 1, hour: 19, minute: 45, lat: 52.83, lon: 0.51, utc: 1, timeKnown: true },
  { name: 'Donald Trump', cat: 'World Leaders', year: 1946, month: 6, day: 14, hour: 10, minute: 54, lat: 40.73, lon: -73.79, utc: -4, timeKnown: true },
  { name: 'Queen Victoria', cat: 'World Leaders', year: 1819, month: 5, day: 24, hour: 4, minute: 15, lat: 51.51, lon: -0.13, utc: 0, timeKnown: true },
  { name: 'Theodore Roosevelt', cat: 'World Leaders', year: 1858, month: 10, day: 27, hour: 20, minute: 0, lat: 40.71, lon: -74.01, utc: -4.94, timeKnown: false },

  // ── Visionaries ──
  { name: 'Albert Einstein', cat: 'Visionaries', year: 1879, month: 3, day: 14, hour: 11, minute: 30, lat: 48.4, lon: 9.99, utc: 0.67, timeKnown: true },
  { name: 'Nikola Tesla', cat: 'Visionaries', year: 1856, month: 7, day: 10, hour: 0, minute: 0, lat: 44.6, lon: 15.31, utc: 1.02, timeKnown: true },
  { name: 'Marie Curie', cat: 'Visionaries', year: 1867, month: 11, day: 7, hour: 12, minute: 0, lat: 52.23, lon: 21.01, utc: 1.4, timeKnown: false },
  { name: 'Steve Jobs', cat: 'Visionaries', year: 1955, month: 2, day: 24, hour: 19, minute: 15, lat: 37.77, lon: -122.42, utc: -8, timeKnown: true },
  { name: 'Elon Musk', cat: 'Visionaries', year: 1971, month: 6, day: 28, hour: 7, minute: 30, lat: -25.75, lon: 28.19, utc: 2, timeKnown: false },
  { name: 'Charles Darwin', cat: 'Visionaries', year: 1809, month: 2, day: 12, hour: 3, minute: 0, lat: 52.71, lon: -2.75, utc: -0.18, timeKnown: false },
  { name: 'Thomas Edison', cat: 'Visionaries', year: 1847, month: 2, day: 11, hour: 3, minute: 0, lat: 41.3, lon: -82.6, utc: -5.51, timeKnown: true },
  { name: 'Vincent van Gogh', cat: 'Visionaries', year: 1853, month: 3, day: 30, hour: 11, minute: 0, lat: 51.47, lon: 4.66, utc: 0.31, timeKnown: true },
  { name: 'Frida Kahlo', cat: 'Visionaries', year: 1907, month: 7, day: 6, hour: 8, minute: 30, lat: 19.35, lon: -99.16, utc: -6.61, timeKnown: true },
  { name: 'Pablo Picasso', cat: 'Visionaries', year: 1881, month: 10, day: 25, hour: 23, minute: 15, lat: 36.72, lon: -4.42, utc: -0.29, timeKnown: true },
  { name: 'Stephen Hawking', cat: 'Visionaries', year: 1942, month: 1, day: 8, hour: 12, minute: 0, lat: 51.75, lon: -1.26, utc: 1, timeKnown: false },
  { name: 'Carl Jung', cat: 'Visionaries', year: 1875, month: 7, day: 26, hour: 19, minute: 32, lat: 47.6, lon: 9.32, utc: 0.62, timeKnown: true },
  { name: 'Ada Lovelace', cat: 'Visionaries', year: 1815, month: 12, day: 10, hour: 12, minute: 0, lat: 51.51, lon: -0.13, utc: 0, timeKnown: false },
  { name: 'Bill Gates', cat: 'Visionaries', year: 1955, month: 10, day: 28, hour: 22, minute: 0, lat: 47.61, lon: -122.33, utc: -8, timeKnown: true },
  { name: 'Alan Turing', cat: 'Visionaries', year: 1912, month: 6, day: 23, hour: 2, minute: 15, lat: 51.51, lon: -0.13, utc: 0, timeKnown: true },

  // ── Athletes ──
  { name: 'Muhammad Ali', cat: 'Athletes', year: 1942, month: 1, day: 17, hour: 18, minute: 35, lat: 38.25, lon: -85.76, utc: -6, timeKnown: true },
  { name: 'Michael Jordan', cat: 'Athletes', year: 1963, month: 2, day: 17, hour: 13, minute: 40, lat: 40.68, lon: -73.94, utc: -5, timeKnown: false },
  { name: 'Serena Williams', cat: 'Athletes', year: 1981, month: 9, day: 26, hour: 20, minute: 28, lat: 43.42, lon: -83.95, utc: -4, timeKnown: true },
  { name: 'Kobe Bryant', cat: 'Athletes', year: 1978, month: 8, day: 23, hour: 12, minute: 0, lat: 39.95, lon: -75.17, utc: -4, timeKnown: false },
  { name: 'LeBron James', cat: 'Athletes', year: 1984, month: 12, day: 30, hour: 12, minute: 0, lat: 41.08, lon: -81.52, utc: -5, timeKnown: false },
  { name: 'Simone Biles', cat: 'Athletes', year: 1997, month: 3, day: 14, hour: 12, minute: 0, lat: 39.96, lon: -83.0, utc: -5, timeKnown: false },
  { name: 'Tiger Woods', cat: 'Athletes', year: 1975, month: 12, day: 30, hour: 22, minute: 50, lat: 33.77, lon: -118.19, utc: -8, timeKnown: true },
  { name: 'Babe Ruth', cat: 'Athletes', year: 1895, month: 2, day: 6, hour: 12, minute: 0, lat: 39.29, lon: -76.61, utc: -5, timeKnown: false },
  { name: 'Lionel Messi', cat: 'Athletes', year: 1987, month: 6, day: 24, hour: 6, minute: 0, lat: -32.95, lon: -60.64, utc: -3, timeKnown: false },

  // ── Infamous ──
  { name: 'Ted Bundy', cat: 'Infamous', year: 1946, month: 11, day: 24, hour: 22, minute: 35, lat: 44.48, lon: -73.21, utc: -5, timeKnown: true },
  { name: 'Jeffrey Dahmer', cat: 'Infamous', year: 1960, month: 5, day: 21, hour: 16, minute: 34, lat: 43.04, lon: -87.91, utc: -5, timeKnown: true },
  { name: 'Charles Manson', cat: 'Infamous', year: 1934, month: 11, day: 12, hour: 16, minute: 40, lat: 39.1, lon: -84.51, utc: -5, timeKnown: true },
  { name: 'John Wayne Gacy', cat: 'Infamous', year: 1942, month: 3, day: 17, hour: 0, minute: 29, lat: 41.88, lon: -87.63, utc: -5, timeKnown: true },
  { name: 'Aileen Wuornos', cat: 'Infamous', year: 1956, month: 2, day: 29, hour: 12, minute: 0, lat: 42.68, lon: -83.13, utc: -5, timeKnown: false },
  { name: 'Ed Gein', cat: 'Infamous', year: 1906, month: 8, day: 27, hour: 23, minute: 30, lat: 43.8, lon: -91.24, utc: -6, timeKnown: false },
  { name: 'Richard Ramirez', cat: 'Infamous', year: 1960, month: 2, day: 29, hour: 2, minute: 7, lat: 31.76, lon: -106.49, utc: -7, timeKnown: true },
  { name: 'Dennis Rader (BTK)', cat: 'Infamous', year: 1945, month: 3, day: 9, hour: 12, minute: 0, lat: 37.41, lon: -94.7, utc: -5, timeKnown: false },
  { name: 'Al Capone', cat: 'Infamous', year: 1899, month: 1, day: 17, hour: 12, minute: 0, lat: 40.68, lon: -73.94, utc: -5, timeKnown: false },
  { name: 'Bonnie Parker', cat: 'Infamous', year: 1910, month: 10, day: 1, hour: 12, minute: 0, lat: 31.65, lon: -100.05, utc: -6, timeKnown: false },
  { name: 'Pablo Escobar', cat: 'Infamous', year: 1949, month: 12, day: 1, hour: 12, minute: 0, lat: 6.15, lon: -75.37, utc: -5, timeKnown: false },
  { name: 'Gary Ridgway', cat: 'Infamous', year: 1949, month: 2, day: 18, hour: 12, minute: 0, lat: 40.76, lon: -111.89, utc: -7, timeKnown: false },
  { name: 'Ted Kaczynski', cat: 'Infamous', year: 1942, month: 5, day: 22, hour: 9, minute: 12, lat: 41.88, lon: -87.63, utc: -5, timeKnown: true },
];
