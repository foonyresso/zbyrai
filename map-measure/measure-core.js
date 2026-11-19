// Що тут: логіка вимірювань на карті без DOM: відстань, периметр, площа на сфері, одиниці, GeoJSON.
(function (root) {
  const R = 6371008.8; // середній радіус Землі, м
  const rad = d => d * Math.PI / 180;

  // відстань між двома точками {lat,lng}, метри (гаверсинус)
  function dist(a, b) {
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  // довжина ламаної; closed=true додає відрізок від останньої точки до першої (периметр)
  function pathLength(pts, closed) {
    let s = 0;
    for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]);
    if (closed && pts.length > 2) s += dist(pts[pts.length - 1], pts[0]);
    return s;
  }
  // площа полігона, м² (сферичний надлишок за формулою Чемберлена-Дюкьюетта)
  function polyArea(pts) {
    if (pts.length < 3) return 0;
    let t = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      t += rad(q.lng - p.lng) * (2 + Math.sin(rad(p.lat)) + Math.sin(rad(q.lat)));
    }
    return Math.abs(t * R * R / 2);
  }

  const LEN = { m: 'м', km: 'км', mi: 'миль', ft: 'фути' };
  const AREA = { m2: 'м²', ha: 'га', km2: 'км²', ac: 'акри' };
  const nf = (v, d) => v.toLocaleString('uk-UA', { maximumFractionDigits: d, minimumFractionDigits: 0 });

  // відстань у вибраній одиниці: 'auto' = м до 1 км, далі км
  function fmtLen(m, unit) {
    unit = unit || 'auto';
    if (unit === 'auto') unit = m < 1000 ? 'm' : 'km';
    if (unit === 'm') return nf(m, 1) + ' м';
    if (unit === 'km') return nf(m / 1000, 3) + ' км';
    if (unit === 'mi') return nf(m / 1609.344, 3) + ' миль';
    if (unit === 'ft') return nf(m / 0.3048, 0) + ' фут';
    return nf(m, 1) + ' м';
  }
  // площа у вибраній одиниці: 'auto' = м² до 1 га, га до 1 км², далі км²
  function fmtArea(m2, unit) {
    unit = unit || 'auto';
    if (unit === 'auto') unit = m2 < 10000 ? 'm2' : m2 < 1e6 ? 'ha' : 'km2';
    if (unit === 'm2') return nf(m2, 1) + ' м²';
    if (unit === 'ha') return nf(m2 / 10000, 3) + ' га';
    if (unit === 'km2') return nf(m2 / 1e6, 4) + ' км²';
    if (unit === 'ac') return nf(m2 / 4046.8564224, 3) + ' акрів';
    return nf(m2, 1) + ' м²';
  }

  // фігури: [{type:'line'|'polygon', pts:[{lat,lng}]}] -> GeoJSON FeatureCollection (координати [lng,lat])
  function toGeoJSON(shapes) {
    const features = shapes.filter(s => s.pts.length > (s.type === 'polygon' ? 2 : 1)).map(s => {
      const c = s.pts.map(p => [+p.lng.toFixed(7), +p.lat.toFixed(7)]);
      const props = { type: s.type, length_m: Math.round(pathLength(s.pts, s.type === 'polygon') * 100) / 100 };
      if (s.type === 'polygon') props.area_m2 = Math.round(polyArea(s.pts) * 100) / 100;
      return { type: 'Feature', properties: props,
        geometry: s.type === 'polygon' ? { type: 'Polygon', coordinates: [c.concat([c[0]])] } : { type: 'LineString', coordinates: c } };
    });
    return { type: 'FeatureCollection', features };
  }
  // GeoJSON (або наш JSON) -> фігури; кидає помилку з українським текстом
  function fromGeoJSON(data) {
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { throw new Error('Це не схоже на JSON'); } }
    const feats = data && data.type === 'FeatureCollection' ? data.features : data && data.type === 'Feature' ? [data] : null;
    if (!feats) throw new Error('Очікується GeoJSON (FeatureCollection)');
    const out = [];
    const ok = c => Array.isArray(c) && isFinite(c[0]) && isFinite(c[1]) && Math.abs(c[1]) <= 90 && Math.abs(c[0]) <= 180;
    for (const f of feats) {
      const g = f && f.geometry; if (!g) continue;
      if (g.type === 'LineString' && g.coordinates.every(ok)) out.push({ type: 'line', pts: g.coordinates.map(c => ({ lat: +c[1], lng: +c[0] })) });
      else if (g.type === 'Polygon' && g.coordinates[0] && g.coordinates[0].every(ok)) {
        const r = g.coordinates[0].map(c => ({ lat: +c[1], lng: +c[0] }));
        if (r.length > 1 && r[0].lat === r[r.length - 1].lat && r[0].lng === r[r.length - 1].lng) r.pop();
        out.push({ type: 'polygon', pts: r });
      }
    }
    if (!out.length) throw new Error('У файлі немає ліній чи полігонів');
    return out;
  }


  const deg = r => r * 180 / Math.PI;
  // початковий азимут a -> b, радіани
  function bearing(a, b) {
    const dl = rad(b.lng - a.lng), y = Math.sin(dl) * Math.cos(rad(b.lat));
    return Math.atan2(y, Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(dl));
  }
  // точка на відстані d (м) за азимутом brg (рад) від p
  function dest(p, brg, d) {
    const f = rad(p.lat), l = rad(p.lng), g = d / R;
    const f2 = Math.asin(Math.sin(f) * Math.cos(g) + Math.cos(f) * Math.sin(g) * Math.cos(brg));
    const l2 = l + Math.atan2(Math.sin(brg) * Math.sin(g) * Math.cos(f), Math.cos(g) - Math.sin(f) * Math.sin(f2));
    return { lat: deg(f2), lng: ((deg(l2) + 540) % 360) - 180 };
  }
  // коло радіуса r (м) навколо c як полігон із n точок
  function circlePts(c, r, n) { n = n || 72; const o = []; for (let i = 0; i < n; i++) o.push(dest(c, 2 * Math.PI * i / n, r)); return o; }
  // центр фігури: середній вектор на сфері
  function centroid(pts) {
    let x = 0, y = 0, z = 0;
    pts.forEach(p => { x += Math.cos(rad(p.lat)) * Math.cos(rad(p.lng)); y += Math.cos(rad(p.lat)) * Math.sin(rad(p.lng)); z += Math.sin(rad(p.lat)); });
    return { lat: deg(Math.atan2(z, Math.hypot(x, y))), lng: deg(Math.atan2(y, x)) };
  }
  // перенесення фігури в нове місце зі збереженням справжнього розміру й форми (відстань і азимут від центру)
  function moveShape(pts, to) {
    const c = centroid(pts);
    return pts.map(p => dest(to, bearing(c, p), dist(c, p)));
  }
  // антипод: точка на протилежному боці Землі
  function antipode(p) { return { lat: -p.lat, lng: ((p.lng + 360) % 360) - 180 }; }
  const fmtCoord = p => p.lat.toFixed(5) + ', ' + p.lng.toFixed(5);

  const api = { bearing, dest, circlePts, centroid, moveShape, antipode, fmtCoord, dist, pathLength, polyArea, fmtLen, fmtArea, toGeoJSON, fromGeoJSON, LEN, AREA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MeasureCore = api;
})(typeof self !== 'undefined' ? self : this);
