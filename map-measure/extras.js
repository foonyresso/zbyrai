// Що тут: «Ідеї» для вимірювача: коло від точки, перенесення копії фігури (порівняння розміру), антипод, закладки, координати.
(function () {
  const C = MeasureCore, $ = id => document.getElementById(id), { map, S, render, save, toast } = window.MM;
  const BM = 'mm_bookmarks';
  const ll = p => [p.lat, p.lng];

  // коло: наступний клік ставить центр
  $('btnCircle').onclick = () => {
    const r = parseFloat($('cRad').value);
    if (!(r > 0)) return toast('Вкажи радіус у км');
    MM.onClick = e => {
      MM.onClick = null; document.getElementById('map').style.cursor = '';
      const pts = C.circlePts(e.latlng.wrap(), r * 1000, 72);
      S.shapes.push({ type: 'polygon', pts: pts.map(p => ({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) })) }); S.cur = S.shapes.length - 1; render();
      return true;
    };
    document.getElementById('map').style.cursor = 'copy'; toast('Клікни на карті, де має бути центр кола');
  };

  // копія фігури, яку тягнуть по карті
  let ghost = null, gLayer = L.layerGroup().addTo(map);
  const ghostBtns = on => { $('btnGhostKeep').hidden = $('btnGhostDrop').hidden = !on; $('btnGhost').hidden = on; };
  function drawGhost() {
    gLayer.clearLayers();
    L.polygon(ghost.pts.map(ll), { color: '#e0a458', weight: 3, dashArray: '6 4', fillColor: '#e0a458', fillOpacity: .25 }).addTo(gLayer);
    const m = L.marker(ll(ghost.c), { draggable: true, icon: L.divIcon({ className: '', html: '<div class="pt cur"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(gLayer);
    m.bindTooltip('Тягни мене: копія фігури в справжньому розмірі', { permanent: false });
    m.on('drag', ev => { const q = ev.target.getLatLng().wrap(); ghost.c = { lat: q.lat, lng: q.lng }; ghost.pts = C.moveShape(ghost.orig, ghost.c); gLayer.eachLayer(l => l instanceof L.Polygon && l.setLatLngs(ghost.pts.map(ll))); });
  }
  $('btnGhost').onclick = () => {
    const src = [...S.shapes].reverse().find(s => s.type === 'polygon' && s.pts.length > 2);
    if (!src) return toast('Спершу намалюй фігуру (режим «Фігура», від трьох точок)');
    const c = map.getCenter();
    ghost = { orig: src.pts, c: { lat: c.lat, lng: c.lng } }; ghost.pts = C.moveShape(ghost.orig, ghost.c);
    drawGhost(); ghostBtns(true); toast('Тягни помаранчеву точку, щоб перенести копію');
  };
  $('btnGhostKeep').onclick = () => { S.shapes.push({ type: 'polygon', pts: ghost.pts.map(p => ({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) })) }); S.cur = S.shapes.length - 1; $('btnGhostDrop').onclick(); render(); };
  $('btnGhostDrop').onclick = () => { ghost = null; gLayer.clearLayers(); ghostBtns(false); };

  // антипод і координати центру
  const center = () => { const c = map.getCenter().wrap(); return { lat: c.lat, lng: c.lng }; };
  const upd = () => { $('cCenter').textContent = C.fmtCoord(center()); };
  map.on('move', upd); upd();
  let back = null;
  $('btnAnti').onclick = () => {
    if (back) { map.setView(back.c, back.z); back = null; $('btnAnti').textContent = 'Показати антипод'; return; }
    const a = C.antipode(center()); back = { c: map.getCenter(), z: map.getZoom() };
    map.setView(ll(a), Math.min(map.getZoom(), 5)); $('btnAnti').textContent = 'Повернутись назад';
    toast('Антипод: ' + C.fmtCoord(a));
  };
  $('btnCoord').onclick = async () => { try { await navigator.clipboard.writeText(C.fmtCoord(center())); toast('Скопійовано: ' + C.fmtCoord(center())); } catch (e) { toast('Браузер не дозволив копіювання'); } };

  // закладки
  let bms = []; try { bms = JSON.parse(localStorage.getItem(BM) || '[]'); } catch (e) { /* не критично */ }
  const saveBm = () => { try { localStorage.setItem(BM, JSON.stringify(bms)); } catch (e) { /* не критично */ } };
  function listBm() {
    const box = $('bmList'); box.textContent = '';
    bms.forEach((b, i) => {
      const row = document.createElement('div'); row.className = 'srch';
      const go = document.createElement('button'); go.textContent = b.name; go.title = 'Перейти до закладки'; go.style.flex = '1'; go.style.textAlign = 'left';
      go.onclick = () => map.setView([b.lat, b.lng], b.z);
      const del = document.createElement('button'); del.textContent = '×'; del.title = 'Видалити закладку'; del.onclick = () => { bms.splice(i, 1); saveBm(); listBm(); };
      row.append(go, del); box.appendChild(row);
    });
  }
  $('btnBm').onclick = () => {
    const c = center(), name = $('bmName').value.trim() || C.fmtCoord(c);
    bms.push({ name, lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), z: map.getZoom() }); $('bmName').value = ''; saveBm(); listBm();
  };
  listBm();
})();
