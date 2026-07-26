# ✦ Celestial Atlas — Interactive Astrology Map

A highly visual, interactive 3D astrology map, seen from space. Fly through a
realistic solar system — glowing Sun, procedurally-textured planets, Earth with
drifting clouds and its Moon, thousands of stars, the Milky Way, and all twelve
zodiac constellations drawn from real star positions. Enter your birth date,
time, and place, and the camera flies to your sign while the app computes and
explains your **Sun, Moon, Rising sign, and all twelve houses**.

## Running it

The app is 100% static and fully self-contained (Three.js is vendored, all
textures are generated procedurally) — no build step, no network needed.
Because it uses ES modules, it must be served over HTTP:

```bash
# from the repo root — pick whichever you have:
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>. It also works out of the box on GitHub
Pages (Settings → Pages → deploy from branch).

## Using it

1. **Explore** — drag to orbit, scroll to zoom. Planets, orbits, the golden
   ecliptic ring with sign glyphs, and the constellations are all live.
2. **Enter your birth details** in the *Your Birth Sky* panel: date, time,
   and birthplace (pick a city or enter coordinates + UTC offset; tick the
   DST box if daylight saving was in effect when you were born).
3. **Reveal My Chart** — the planets snap to their positions on your birth
   date, your Sun / Moon / Rising constellations light up in gold, silver,
   and rose, and the camera flies to your Sun sign.
4. **Read your chart** — the results panel explains your Sun sign (core
   identity), Moon sign (inner world), Rising sign (how you meet the world),
   and every house with its whole-sign ruler.
5. **Fly to…** buttons jump between your Sun, Moon, and Rising
   constellations, Earth as it stood in your birth sky, and the full solar
   system overview.

## How the astrology is computed

All math lives in [`js/astro.js`](js/astro.js) and is verified against
reference values from Meeus, *Astronomical Algorithms*:

| Quantity | Method | Accuracy |
| --- | --- | --- |
| Sun longitude | Low-precision solar ephemeris | ~0.01° |
| Moon longitude | Truncated ELP-2000 series (16 terms) | ~0.3° |
| Ascendant | Rigorous formula from local sidereal time, obliquity, latitude | sign-accurate |
| Houses | Whole-sign system (house 1 = rising sign) | — |

The zodiac used is **tropical** (Western astrology). Scene distances and
planet sizes are stylized so everything stays visible; planet *directions*
(heliocentric longitudes) match your birth date. Constellation figures use
real J2000 star coordinates. Note that time-zone handling is simplified
(standard offset + optional DST hour) — for cusp-line birth times, verify
against a full ephemeris service.

## Project layout

```
index.html               UI shell (menu, results panel, import map)
css/style.css            Glassmorphism space UI
js/main.js               Form → chart → camera tour wiring
js/astro.js              Ephemeris + birth-chart math
js/scene.js              Three.js scene: sun, planets, stars, constellations
js/textures.js           Procedural planet/sun/Milky Way texture generation
js/data/constellations.js  Zodiac star positions (J2000) + stick figures
js/data/meanings.js      Sign & house interpretations
vendor/                  Three.js r160 + OrbitControls (MIT)
```

*For entertainment & wonder.* ✨
