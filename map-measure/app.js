// Що тут: інтерфейс «Вимірювача на карті»: карта Leaflet, точки й фігури, картка результату, пошук, файли.
(function () {
  const C = MeasureCore, $ = id => document.getElementById(id);
  const LS = 'mm_state';
  const S = { shapes: [], cur: -1, mode: 'line', layer: 'sat', uLen: 'auto', uArea: 'auto', segLabels: false, view: [48.5, 31.2, 5] };
  try { Object.assign(S, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* не критично */ }
  if (!Array.isArray(S.shapes)) S.shapes = [];
  if (S.cur >= S.shapes.length) S.cur = S.shapes.length - 1;
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* не критично */ } };
  const toast = t => { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600); };

  const map = L.map('map', { worldCopyJump: true, zoomControl: true, minZoom: 2, maxZoom: 19, attributionControl: true, doubleClickZoom: false })
    .setView([S.view[0], S.view[1]], S.view[2]);
  const tiles = {
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Знімки © Esri, Maxar, Earthstar Geographics' }),
    osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' })
  };
  const grp = L.layerGroup().addTo(map);
  function setLayer(n) {
    Object.values(tiles).forEach(t => map.hasLayer(t) && map.removeLayer(t));
    S.layer = tiles[n] ? n : 'sat'; tiles[S.layer].addTo(map).bringToBack();
    document.querySelectorAll('#layerSeg button').forEach(b => b.classList.toggle('on', b.dataset.layer === S.layer));
    save();
  }

  const active = () => S.shapes[S.cur];
  function ensureShape() {
    const a = active();
    if (!a || a.type !== S.mode) { S.shapes.push({ type: S.mode, pts: [] }); S.cur = S.shapes.length - 1; }
    return active();
  }
  const ptsOf = s => s.pts.map(p => L.latLng(p.lat, p.lng));
  function info() {
    const a = active(), el = $('info');
    if (!a || !a.pts.length) { el.innerHTML = '<span class="sub">Клікни на карті, щоб поставити першу точку.</span>'; return; }
    const len = C.pathLength(a.pts, false);
    let h = '';
    if (a.type === 'polygon' && a.pts.length > 2) {
      h = `<div class="big">${C.fmtArea(C.polyArea(a.pts), S.uArea)}</div><div>Периметр: <b>${C.fmtLen(C.pathLength(a.pts, true), S.uLen)}</b></div><div class="sub">Точок: ${a.pts.length}</div>`;
    } else if (a.type === 'polygon') {
      h = `<div class="sub">Фігура: став ще ${3 - a.pts.length} точк(и) для площі.</div>` + (a.pts.length > 1 ? `<div>Відстань: <b>${C.fmtLen(len, S.uLen)}</b></div>` : '');
    } else {
      const last = a.pts.length > 1 ? C.dist(a.pts[a.pts.length - 2], a.pts[a.pts.length - 1]) : 0;
      h = a.pts.length > 1 ? `<div class="big">${C.fmtLen(len, S.uLen)}</div><div class="sub">Останній відрізок: ${C.fmtLen(last, S.uLen)} · точок: ${a.pts.length}</div>` : '<div class="sub">Став другу точку.</div>';
    }
    if (S.shapes.length > 1) h += `<div class="sub">Усього фігур: ${S.shapes.length}</div>`;
    el.innerHTML = h;
  }

  function render() {
    grp.clearLayers();
    S.shapes.forEach((s, si) => {
      const col = si === S.cur ? '#70c1b3' : '#9aa7b3';
      const ll = ptsOf(s);
      let shape = null;
      if (s.type === 'polygon' && ll.length > 2) shape = L.polygon(ll, { color: col, weight: 3, fillColor: col, fillOpacity: .22 });
      else if (ll.length > 1) shape = L.polyline(ll, { color: col, weight: 3 });
      if (shape) { shape.addTo(grp); shape.on('click', e => { L.DomEvent.stopPropagation(e); S.cur = si; render(); }); }
      if (S.segLabels) {
        const n = s.type === 'polygon' && s.pts.length > 2 ? s.pts.length : s.pts.length - 1;
        for (let i = 0; i < n; i++) {
          const a = s.pts[i], b = s.pts[(i + 1) % s.pts.length];
          L.marker([(a.lat + b.lat) / 2, (a.lng + b.lng) / 2], { interactive: false, icon: L.divIcon({ className: '', html: `<span class="seglab">${C.fmtLen(C.dist(a, b), S.uLen)}</span>`, iconSize: [0, 0] }) }).addTo(grp);
        }
      }
      s.pts.forEach((p, i) => {
        const m = L.marker([p.lat, p.lng], { draggable: true, icon: L.divIcon({ className: '', html: `<div class="pt${si === S.cur && i === s.pts.length - 1 ? ' cur' : ''}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(grp);
        m.on('drag', () => { const q = m.getLatLng(); p.lat = q.lat; p.lng = q.lng; if (shape) shape.setLatLngs(ptsOf(s)); info(); });
        m.on('dragend', () => { save(); render(); });
        m.on('click', e => { L.DomEvent.stopPropagation(e); S.cur = si; render(); });
      });
    });
    info(); save();
  }

  map.on('click', e => { const s = ensureShape(); const w = e.latlng.wrap(); s.pts.push({ lat: +w.lat.toFixed(7), lng: +w.lng.toFixed(7) }); render(); });
  map.on('moveend', () => { const c = map.getCenter(); S.view = [+c.lat.toFixed(5), +c.lng.toFixed(5), map.getZoom()]; save(); });

  function undo() {
    const a = active(); if (!a) return;
    a.pts.pop();
    if (!a.pts.length) { S.shapes.splice(S.cur, 1); S.cur = S.shapes.length - 1; }
    render();
  }
  $('btnUndo').onclick = undo;
  $('btnNew').onclick = () => { const a = active(); if (a && a.pts.length) { S.cur = -1; render(); toast('Нова фігура: клікни першу точку'); } };
  $('btnClear').onclick = () => { if (!S.shapes.length || confirm('Видалити всі виміри?')) { S.shapes = []; S.cur = -1; render(); } };
  document.addEventListener('keydown', e => {
    if (/INPUT|SELECT|TEXTAREA/.test((e.target.tagName || ''))) return;
    if ((e.ctrlKey || e.metaKey) && zbKey(e) === 'z') { e.preventDefault(); undo(); }
  });

  // режими, одиниці, шари
  function setMode(m) {
    S.mode = m; const a = active(); if (a && a.type !== m) S.cur = -1;
    document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.mode === m)); render();
  }
  document.querySelectorAll('#modeSeg button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  document.querySelectorAll('#layerSeg button').forEach(b => b.onclick = () => setLayer(b.dataset.layer));
  $('uLen').value = S.uLen; $('uArea').value = S.uArea; $('segLabels').checked = !!S.segLabels;
  $('uLen').onchange = e => { S.uLen = e.target.value; render(); };
  $('uArea').onchange = e => { S.uArea = e.target.value; render(); };
  $('segLabels').onchange = e => { S.segLabels = e.target.checked; render(); };

  // пошук місця (Nominatim)
  $('searchForm').onsubmit = async ev => {
    ev.preventDefault();
    const q = $('q').value.trim(), box = $('results'); if (!q) return;
    box.textContent = 'Шукаю…';
    try {
      const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=uk&q=' + encodeURIComponent(q));
      if (!r.ok) throw new Error(r.status);
      const list = await r.json(); box.textContent = '';
      if (!list.length) { box.textContent = 'Нічого не знайдено'; return; }
      list.forEach(it => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = it.display_name; b.title = 'Перейти на це місце';
        b.onclick = () => { const bb = it.boundingbox; if (bb) map.fitBounds([[+bb[0], +bb[2]], [+bb[1], +bb[3]]], { maxZoom: 17 }); else map.setView([+it.lat, +it.lon], 15); };
        box.appendChild(b);
      });
      list[0].boundingbox ? map.fitBounds([[+list[0].boundingbox[0], +list[0].boundingbox[2]], [+list[0].boundingbox[1], +list[0].boundingbox[3]]], { maxZoom: 17 }) : map.setView([+list[0].lat, +list[0].lon], 15);
    } catch (e) { box.textContent = 'Пошук недоступний, спробуй пізніше'; }
  };

  // файли
  const json = () => JSON.stringify(C.toGeoJSON(S.shapes), null, 2);
  $('btnSave').onclick = () => {
    if (!S.shapes.length) return toast('Немає вимірів для збереження');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json()], { type: 'application/geo+json' })); a.download = 'vymiry.geojson'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('btnCopy').onclick = async () => {
    if (!S.shapes.length) return toast('Немає вимірів для копіювання');
    try { await navigator.clipboard.writeText(json()); toast('Скопійовано'); } catch (e) { toast('Браузер не дозволив копіювання'); }
  };
  $('btnLoad').onclick = () => $('fileIn').click();
  $('fileIn').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const add = C.fromGeoJSON(await f.text());
      S.shapes = S.shapes.concat(add); S.cur = -1; render();
      const all = add.flatMap(s => s.pts); map.fitBounds(L.latLngBounds(all.map(p => [p.lat, p.lng])), { maxZoom: 17 });
      toast('Додано фігур: ' + add.length);
    } catch (err) { toast(err.message); }
  };
  $('btnPrintMap').onclick = () => window.print();

  setLayer(S.layer); setMode(S.mode);
})();
