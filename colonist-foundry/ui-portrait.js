/* Colonist Foundry: портрет колоніста (процедурний SVG за зерном). Глобал CFPortrait. */
const CFPortrait = (() => {
  const C = ColonistCore, NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  function avatar(c) {
    const R = C.rngFromSeed('face:' + c.seed + ':' + c.name), pickA = l => l[Math.floor(R() * l.length)];
    const skin = pickA(['#f1c9a5', '#e0ac82', '#c68b62', '#a56b45', '#7d4d33', '#f6d9bd']), hair = pickA(['#2b1d14', '#4b2f1c', '#8a5a2b', '#c9a24a', '#a63d2a', '#d8d4cf', '#14110f']);
    const cloth = { farm: '#6f9e5a', mine: '#8a7f73', craft: '#c27a3a', cook: '#c9a766', heal: '#d9d9e8', fight: '#8a4b4b', shoot: '#5a7a5a', think: '#5a6fa8', build: '#b08a4a', talk: '#9c6ab0' }[Object.entries(c.skills).sort((a, b) => b[1] - a[1])[0][0]];
    const s = svg('svg', { viewBox: '0 0 64 64', role: 'img', 'aria-label': 'Портрет ' + c.name });
    const add = (tag, a) => s.append(svg(tag, a));
    add('rect', { width: 64, height: 64, fill: '#1a1822' });
    add('path', { d: 'M10 64c1-14 9-19 22-19s21 5 22 19z', fill: cloth });
    add('rect', { x: 27, y: 38, width: 10, height: 10, rx: 3, fill: skin });
    if (c.female && R() < .8) add('path', { d: 'M16 36c-2-18 8-26 16-26s18 8 16 26c-2 6-6 6-8 0H24c-2 6-6 6-8 0z', fill: hair });
    add('ellipse', { cx: 32, cy: 28, rx: 12, ry: 14, fill: skin });
    const style = Math.floor(R() * 3);
    if (style === 0) add('path', { d: 'M19 27c-1-12 6-17 13-17s14 5 13 17c-3-6-7-8-13-8s-10 2-13 8z', fill: hair });
    else if (style === 1) add('path', { d: 'M18 26c0-13 7-17 14-17s14 4 14 17c-2-4-4-6-6-7-4 3-14 3-16 0-2 1-4 3-6 7z', fill: hair });
    else add('path', { d: 'M19 24c2-9 8-12 13-12s11 3 13 12c-5-3-9-4-13-4s-8 1-13 4z', fill: hair });
    if (!c.female && c.age > 28 && R() < .45) add('path', { d: 'M22 32c1 9 6 12 10 12s9-3 10-12c-3 4-6 5-10 5s-7-1-10-5z', fill: hair, opacity: .9 });
    add('circle', { cx: 27, cy: 28, r: 1.6, fill: '#1a1214' }); add('circle', { cx: 37, cy: 28, r: 1.6, fill: '#1a1214' });
    add('path', { d: c.traits.some(t => ['gloomy', 'pessimist', 'cruel'].includes(t)) ? 'M28 36q4-2 8 0' : 'M28 35q4 3 8 0', fill: 'none', stroke: '#3a1d1d', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
    if (c.age > 45) add('path', { d: 'M24 24q3-1 6 0M34 24q3-1 6 0', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1, fill: 'none' });
    return s;
  }
  return { avatar };
})();
