// Що тут: орієнтування на карті: шари назв і кордонів, пошук з підказками (Nominatim), «Де я», «Що тут», сховати інтерфейс.
(function () {
  const C = MeasureCore, $ = id => document.getElementById(id), { map, S, save, toast } = window.MM;
  const NOM = 'https://nominatim.openstreetmap.org/';

  // шари назв і кордонів
  const ov = {
    names: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', { subdomains: 'abcd', maxZoom: 19, pane: 'overlayPane', attribution: '© CARTO, © OpenStreetMap' }),
    borders: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Кордони © Esri' })
  };
  if (S.ovNames === undefined) S.ovNames = true;
  function applyOv() {
    [['names', 'ovNames'], ['borders', 'ovBorders']].forEach(([k, id]) => {
      $(id).checked = !!S[id]; $(id === 'ovNames' ? 'btnNames' : 'btnBorders').classList.toggle('on', !!S[id]);
      if (S[id] && !map.hasLayer(ov[k])) ov[k].addTo(map); else if (!S[id] && map.hasLayer(ov[k])) map.removeLayer(ov[k]);
    });
    save();
  }
  ['ovNames', 'ovBorders'].forEach(id => $(id).onchange = e => { S[id] = e.target.checked; applyOv(); });
  $('btnNames').onclick = () => { S.ovNames = !S.ovNames; applyOv(); };
  $('btnBorders').onclick = () => { S.ovBorders = !S.ovBorders; applyOv(); };
  $('btnLayer').onclick = () => document.querySelector(`#layerSeg button[data-layer="${S.layer === 'sat' ? 'osm' : 'sat'}"]`).click();
  applyOv();

  // сховати інтерфейс
  function setClean(on) { document.body.classList.toggle('clean', on); $('btnUi').classList.toggle('on', on); try { localStorage.setItem('mm_clean', on ? '1' : ''); } catch (e) { /* не критично */ } setTimeout(() => map.invalidateSize(), 50); }
  $('btnUi').onclick = () => setClean(!document.body.classList.contains('clean'));
  try { if (localStorage.getItem('mm_clean')) setClean(true); } catch (e) { /* не критично */ }

  // «що це за місце»: зворотний геокодинг
  async function reverse(latlng, zoom) {
    const r = await fetch(`${NOM}reverse?format=jsonv2&zoom=${zoom || 14}&accept-language=uk&lat=${latlng.lat}&lon=${latlng.lng}`);
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  function popup(latlng, title, extra) {
    const p = L.popup().setLatLng(latlng), box = document.createElement('div'); box.className = 'pp';
    const b = document.createElement('b'), c = document.createElement('div'), x = document.createElement('div'), cp = document.createElement('button');
    b.textContent = title; x.textContent = extra || ''; c.className = 'c'; const w = latlng.wrap(); c.textContent = C.fmtCoord({ lat: w.lat, lng: w.lng });
    cp.textContent = 'Копіювати координати'; cp.title = 'Скопіювати широту й довготу';
    cp.onclick = async () => { try { await navigator.clipboard.writeText(c.textContent); toast('Скопійовано'); } catch (e) { toast('Браузер не дозволив копіювання'); } };
    box.append(b, x, c, cp); p.setContent(box).openOn(map);
    return { setTitle: t => { b.textContent = t; }, setExtra: t => { x.textContent = t; } };
  }
  async function probe(latlng) {
    const ui = popup(latlng, 'Шукаю назву…');
    try {
      const d = await reverse(latlng, 14), a = d.address || {};
      ui.setTitle(d.name || a.city || a.town || a.village || a.state || d.display_name || 'Безіменне місце');
      ui.setExtra([a.state, a.country].filter(Boolean).join(', ') || d.display_name || '');
    } catch (e) { ui.setTitle(e.message === '404' || !navigator.onLine ? 'Назву не знайдено' : 'Назву не знайдено (немає зв\'язку із сервісом)'); }
  }
  window.MM.onClick = e => { if (S.mode !== 'probe') return false; probe(e.latlng); return true; };

  // «Де я»
  let me = null;
  $('btnLoc').onclick = () => {
    if (!navigator.geolocation) return toast('Браузер не підтримує геолокацію');
    toast('Визначаю місце… дозволь доступ у браузері');
    navigator.geolocation.getCurrentPosition(pos => {
      const ll = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (me) map.removeLayer(me);
      me = L.layerGroup([L.circle(ll, { radius: pos.coords.accuracy, color: '#3b82f6', weight: 1, fillOpacity: .12, interactive: false }),
        L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }) }).on('click', () => whereAmI(ll, pos.coords.accuracy))]).addTo(map);
      map.setView(ll, Math.max(map.getZoom(), 15)); whereAmI(ll, pos.coords.accuracy);
    }, err => toast(err.code === 1 ? 'Доступ до місця заборонено в браузері' : 'Не вдалося визначити місце'), { enableHighAccuracy: true, timeout: 15000 });
  };
  async function whereAmI(ll, acc) {
    const ui = popup(ll, 'Ти тут', 'Точність: ±' + Math.round(acc) + ' м');
    try { const d = await reverse(ll, 18); ui.setTitle(d.display_name || 'Ти тут'); } catch (e) { /* лишаємо «Ти тут» */ }
  }

  // пошук з підказками
  const inp = $('sq'), list = $('sList'), clr = $('sClear');
  let timer = 0, seq = 0, outline = null, last = [];
  function clearOutline() { if (outline) { map.removeLayer(outline); outline = null; } }
  function go(it) {
    list.hidden = true; clearOutline(); inp.value = it.display_name.split(',').slice(0, 2).join(',');
    if (it.geojson && /Polygon/.test(it.geojson.type) && ['country', 'state', 'region', 'county'].includes(it.addresstype || it.type)) {
      outline = L.geoJSON(it.geojson, { style: { color: '#e0a458', weight: 3, dashArray: '6 4', fillOpacity: .06 }, interactive: false }).addTo(map);
      map.fitBounds(outline.getBounds(), { padding: [40, 40] }); return;
    }
    const bb = it.boundingbox;
    if (bb) map.fitBounds([[+bb[0], +bb[2]], [+bb[1], +bb[3]]], { maxZoom: 17 }); else map.setView([+it.lat, +it.lon], 15);
  }
  async function find(q) {
    const my = ++seq; list.hidden = false; list.innerHTML = '<div class="none">Шукаю…</div>';
    try {
      const r = await fetch(`${NOM}search?format=jsonv2&limit=6&accept-language=uk&polygon_geojson=1&polygon_threshold=0.02&addressdetails=0&q=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error(r.status);
      const res = await r.json(); if (my !== seq) return; last = res; list.textContent = '';
      if (!res.length) { list.innerHTML = '<div class="none">Нічого не знайдено</div>'; return; }
      res.forEach(it => {
        const b = document.createElement('button'), parts = it.display_name.split(',');
        b.type = 'button'; b.title = 'Перейти на це місце'; b.textContent = parts[0];
        const s = document.createElement('small'); s.textContent = parts.slice(1, 4).join(',').trim(); b.appendChild(s);
        b.onclick = () => go(it); list.appendChild(b);
      });
    } catch (e) { if (my === seq) list.innerHTML = '<div class="none">Пошук недоступний, спробуй пізніше</div>'; }
  }
  inp.addEventListener('input', () => {
    clearTimeout(timer); clr.hidden = !inp.value; const q = inp.value.trim();
    if (q.length < 3) { list.hidden = true; seq++; return; }
    timer = setTimeout(() => find(q), 600); // не частіше за правила Nominatim
  });
  $('sBox').onsubmit = e => { e.preventDefault(); clearTimeout(timer); if (last.length && !list.hidden) go(last[0]); else if (inp.value.trim().length > 2) find(inp.value.trim()); };
  clr.onclick = () => { inp.value = ''; list.hidden = true; clr.hidden = true; seq++; clearOutline(); };
  document.addEventListener('click', e => { if (!$('sBox').contains(e.target)) list.hidden = true; });
})();
