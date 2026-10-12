// Voxel World Lab: інтерфейс. Світ, шум і експорт лежать у voxel-core.js (VoxelCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const V = VoxelCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('vx_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vx_' + k, JSON.stringify(v)); } catch {} },
  };
  const randSeed = () => Math.random().toString(36).slice(2, 8);
  const st = Object.assign({ seed: randSeed(), sx: 48, sy: 40, scale: 28, octaves: 4, rough: .5, water: .38, island: 0, flat: 0, snow: .8, caves: .35, trees: .5, ores: .5, rot: 0, cut: 99, zoom: 1, tool: 'look', block: V.ID.BRICK }, store.get('state', {}));
  const save = () => store.set('state', st);
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  let world = null, faces = [], undo = [], dirty = true;
  const genOpts = () => ({ seed: st.seed, sx: st.sx, sz: st.sx, sy: st.sy, scale: st.scale, octaves: st.octaves, rough: st.rough, water: st.water, island: st.island, flat: st.flat, snow: st.snow, caves: st.caves, trees: st.trees, ores: st.ores });
  function regenerate() { world = V.generate(genOpts()); undo = []; st.cut = Math.min(st.cut, world.sy - 1); dirty = true; syncUi(); draw(); stats(); }

  /* ---------- малювання: ізометрія з painter's order з ядра ---------- */
  const cv = $('cv'), ctx = cv.getContext('2d'), wrap = $('wrap');
  const LIGHT = [1, .8, .6];
  const hash = (x, y, z) => { let h = Math.imul(x * 73856093 ^ y * 19349663 ^ z * 83492791, 2654435761) >>> 0; return (h & 255) / 255; };
  function layout() {
    const [W, D] = V.extents(world, st.rot), cw = cv.clientWidth, ch = cv.clientHeight;
    const fit = Math.min(cw / (W + D + 2), ch / ((W + D) / 2 + world.sy * 1.1 + 2)), a = Math.max(2, fit * st.zoom);
    const v = a * 1.1, totalW = (W + D) * a, totalH = (W + D) * a / 2 + world.sy * v;
    return { a, v, W, D, ox: cw / 2 + (D - W) * a / 2 * 0 + 0, oy: (ch - totalH) / 2 + world.sy * v };
  }
  function draw() {
    if (!world) return;
    const dpr = devicePixelRatio || 1, cw = wrap.clientWidth, ch = wrap.clientHeight;
    if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, cw, ch);
    const L = layout(), { a, v } = L, dirs = V.SCREEN_DIRS[st.rot], [xd, zd] = [dirs[0], dirs[1]];
    faces = []; const outline = a >= 7;
    if (outline) { ctx.lineWidth = .6; ctx.strokeStyle = 'rgba(0,0,0,.22)'; }
    const poly = (p, col, alpha) => { ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); ctx.fill(); if (outline && alpha === 1) ctx.stroke(); };
    V.walk(world, st.rot, st.cut, (x, y, z, xs, zs) => {
      const b = world.blocks[V.idx(world, x, y, z)], B = V.BLOCKS[b], px = L.ox + (xs - zs) * a, py = L.oy + (xs + zs) * a / 2 - (y + 1) * v, alpha = B.liquid ? .72 : 1;
      const tint = .94 + hash(x, y, z) * .1, depthShade = B.liquid ? 1 : .86 + .14 * Math.min(1, (y + 1) / world.sy);
      const col = k => { const c = B.color, m = LIGHT[k] * tint * depthShade; return `rgb(${Math.min(255, c[0] * m) | 0},${Math.min(255, c[1] * m) | 0},${Math.min(255, c[2] * m) | 0})`; };
      if (V.visibleDir(world, x, y, z, 0, 1, 0)) { const p = [px, py, px + a, py + a / 2, px, py + a, px - a, py + a / 2]; poly(p, col(0), alpha); faces.push({ p, x, y, z, k: 0 }); }
      if (V.visibleDir(world, x, y, z, zd[0], 0, zd[1])) { const p = [px - a, py + a / 2, px, py + a, px, py + a + v, px - a, py + a / 2 + v]; poly(p, col(1), alpha); faces.push({ p, x, y, z, k: 1 }); }
      if (V.visibleDir(world, x, y, z, xd[0], 0, xd[1])) { const p = [px, py + a, px + a, py + a / 2, px + a, py + a / 2 + v, px, py + a + v]; poly(p, col(2), alpha); faces.push({ p, x, y, z, k: 2 }); }
    });
    ctx.globalAlpha = 1; dirty = false;
  }
  // яка грань під курсором: останні намальовані лежать «ближче»
  const inQuad = (p, x, y) => { let s = 0; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, c = (p[j * 2] - p[i * 2]) * (y - p[i * 2 + 1]) - (p[j * 2 + 1] - p[i * 2 + 1]) * (x - p[i * 2]); if (c !== 0) { if (s && Math.sign(c) !== s) return false; s = Math.sign(c); } } return true; };
  function pickAt(clientX, clientY) {
    const r = cv.getBoundingClientRect(), x = clientX - r.left, y = clientY - r.top;
    for (let i = faces.length - 1; i >= 0; i--) if (inQuad(faces[i].p, x, y)) return faces[i];
    return null;
  }
  function neighborDir(f) { const d = V.SCREEN_DIRS[st.rot]; return f.k === 0 ? [0, 1, 0] : f.k === 1 ? [d[1][0], 0, d[1][1]] : [d[0][0], 0, d[0][1]]; }

  /* ---------- редагування ---------- */
  function edit(f, remove) {
    let x = f.x, y = f.y, z = f.z;
    if (!remove) { const d = neighborDir(f); x += d[0]; y += d[1]; z += d[2]; }
    if (!V.inb(world, x, y, z)) return toast('Поза межами світу');
    const i = V.idx(world, x, y, z), from = world.blocks[i], to = remove ? 0 : st.block;
    if (remove && from === V.ID.BEDROCK) return toast('Основу ламати не можна');
    if (from === to) return;
    if (!remove && from !== 0 && !V.BLOCKS[from].liquid) return;
    world.blocks[i] = to; undo.push({ i, from, to }); if (undo.length > 500) undo.shift(); draw(); stats();
  }
  function doUndo() { const u = undo.pop(); if (!u) return toast('Немає що скасовувати'); world.blocks[u.i] = u.from; draw(); stats(); }
  $('btnUndo').onclick = doUndo;
  let down = null;
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', e => {
    if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 5 || st.tool === 'look') return;
    const f = pickAt(e.clientX, e.clientY); if (f) edit(f, st.tool === 'break' || e.shiftKey);
  });
  cv.addEventListener('contextmenu', e => { if (st.tool !== 'look') { e.preventDefault(); const f = pickAt(e.clientX, e.clientY); if (f) edit(f, true); } });
  let moveRaf = 0;
  cv.addEventListener('pointermove', e => {
    if (moveRaf) return; const cx = e.clientX, cy = e.clientY;
    moveRaf = requestAnimationFrame(() => { moveRaf = 0; const f = pickAt(cx, cy); $('status').textContent = f ? `${V.BLOCKS[V.get(world, f.x, f.y, f.z)].name} · x ${f.x}, z ${f.z}, висота ${f.y}` : 'Колесо миші масштабує, Q/E обертають. «Ставити» додає блок до грані, «Ламати» прибирає блок (Shift+клік теж ламає).'; });
  });
  wrap.addEventListener('wheel', e => { e.preventDefault(); st.zoom = Math.min(3, Math.max(.4, st.zoom * (e.deltaY < 0 ? 1.1 : .9))); syncUi(); draw(); save(); }, { passive: false });

  /* ---------- інтерфейс ---------- */
  const SL = [['rSize', 'oSize', () => st.sx, v => { st.sx = v; }, v => v + '×' + v], ['rSy', 'oSy', () => st.sy, v => { st.sy = v; }, v => v],
    ['rScale', 'oScale', () => st.scale, v => { st.scale = v; }, v => v], ['rOct', 'oOct', () => st.octaves, v => { st.octaves = v; }, v => v], ['rRough', 'oRough', () => Math.round(st.rough * 100), v => { st.rough = v / 100; }, v => v + '%'],
    ['rWater', 'oWater', () => Math.round(st.water * 100), v => { st.water = v / 100; }, v => v + '%'], ['rIsland', 'oIsland', () => Math.round(st.island * 100), v => { st.island = v / 100; }, v => v + '%'], ['rFlat', 'oFlat', () => Math.round(st.flat * 100), v => { st.flat = v / 100; }, v => v + '%'],
    ['rSnow', 'oSnow', () => Math.round(st.snow * 100), v => { st.snow = v / 100; }, v => v + '%'], ['rCaves', 'oCaves', () => Math.round(st.caves * 100), v => { st.caves = v / 100; }, v => v + '%'],
    ['rTrees', 'oTrees', () => Math.round(st.trees * 100), v => { st.trees = v / 100; }, v => v + '%'], ['rOres', 'oOres', () => Math.round(st.ores * 100), v => { st.ores = v / 100; }, v => v + '%']];
  function syncUi() {
    for (const [r, o, get, , fmt] of SL) { $(r).value = get(); $(o).textContent = fmt(get()); }
    $('tSeed').value = st.seed;
    const sy = world ? world.sy : st.sy; $('rCut').max = sy - 1; $('rCut').value = Math.min(st.cut, sy - 1); $('oCut').textContent = Math.min(st.cut, sy - 1) >= sy - 1 ? 'усе' : Math.min(st.cut, sy - 1);
    $('rZoom').value = Math.round(st.zoom * 100); $('oZoom').textContent = Math.round(st.zoom * 100) + '%';
    document.querySelectorAll('#tools button').forEach(b => b.classList.toggle('on', b.dataset.tool === st.tool)); $('palette').hidden = st.tool !== 'place'; wrap.classList.toggle('tool', st.tool !== 'look');
    document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.id === st.block));
  }
  for (const [r, , , setv] of SL) $(r).addEventListener('input', e => { setv(+e.target.value); save(); clearTimeout(regenerate.t); regenerate.t = setTimeout(regenerate, 120); syncUi(); });
  $('tSeed').onchange = e => { st.seed = e.target.value.trim() || randSeed(); save(); regenerate(); };
  $('btnNew').onclick = () => { st.seed = randSeed(); save(); regenerate(); };
  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && document.activeElement.type !== 'range') return;
    if (e.code === 'Space') { e.preventDefault(); $('btnNew').click(); } else if (e.code === 'KeyQ') rotate(-1); else if (e.code === 'KeyE') rotate(1);
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); doUndo(); }
  });
  function rotate(d) { st.rot = (st.rot + d + 4) % 4; save(); draw(); }
  $('btnRotL').onclick = () => rotate(-1); $('btnRotR').onclick = () => rotate(1);
  $('rCut').oninput = e => { st.cut = +e.target.value; syncUi(); draw(); save(); };
  $('rZoom').oninput = e => { st.zoom = +e.target.value / 100; syncUi(); draw(); save(); };
  document.querySelectorAll('#tools button').forEach(b => { b.onclick = () => { st.tool = b.dataset.tool; syncUi(); save(); }; });
  const pal = $('palette');
  for (const id of [V.ID.BRICK, V.ID.PLANKS, V.ID.STONE, V.ID.WOOD, V.ID.GRASS, V.ID.DIRT, V.ID.SAND, V.ID.WATER, V.ID.SNOW, V.ID.LEAVES, V.ID.GRAVEL, V.ID.GOLD]) {
    const B = V.BLOCKS[id], b = document.createElement('button'); b.className = 'sw'; b.dataset.id = id; b.type = 'button';
    const i = document.createElement('i'); i.style.background = `rgb(${B.color.join(',')})`; b.append(i, B.name); b.onclick = () => { st.block = id; syncUi(); save(); }; pal.append(b);
  }
  function stats() {
    const c = V.counts(world), box = $('counts'); box.replaceChildren();
    c.forEach((n, id) => { if (!id || !n) return; const d = document.createElement('div'), i = document.createElement('i'), s = document.createElement('span'), b = document.createElement('b'); i.style.background = `rgb(${V.BLOCKS[id].color.join(',')})`; s.textContent = V.BLOCKS[id].name; b.textContent = n; d.append(i, s, b); box.append(d); });
  }

  /* ---------- експорт ---------- */
  $('btnVox').onclick = () => { try { download(new Blob([V.toVox(world)], { type: 'application/octet-stream' }), `voxel-${st.seed}.vox`); toast('Збережено .vox: відкрийте в MagicaVoxel'); } catch (e) { toast(e.message); } };
  $('btnJson').onclick = () => { download(new Blob([JSON.stringify(V.toJson(world))], { type: 'application/json' }), `voxel-${st.seed}.json`); toast('Збережено JSON'); };
  $('btnPng').onclick = () => cv.toBlob(b => { download(b, `voxel-${st.seed}.png`); toast('Збережено картинку'); });
  $('btnHm').onclick = () => {
    const hm = V.heightmap(world), c = document.createElement('canvas'); c.width = world.sx; c.height = world.sz; const g = c.getContext('2d'), im = g.createImageData(world.sx, world.sz);
    for (let i = 0; i < hm.length; i++) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = hm[i]; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); c.toBlob(b => { download(b, `heightmap-${st.seed}.png`); toast('Збережено карту висот'); });
  };
  $('btnImport').onclick = () => $('file').click();
  $('file').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try { world = V.fromJson(JSON.parse(await f.text())); st.sx = world.sx; st.sy = world.sy; undo = []; st.cut = world.sy - 1; syncUi(); draw(); stats(); toast('Світ імпортовано'); } catch { toast('Не вдалося прочитати файл'); }
  };
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(wrap);
  regenerate();
})();
