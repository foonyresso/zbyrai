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
  const st = Object.assign({ seed: randSeed(), sx: 48, sy: 56, scale: 28, octaves: 4, rough: .5, water: .38, island: 0, flat: 0, snow: .8, caves: .35, trees: .5, ores: .5, cut: 99, ortho: false, tool: 'look', block: V.ID.BRICK }, store.get('state', {}));
  const save = () => store.set('state', st);
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  let world = null, undo = [], cnt = [], chunks = [], ncx = 0, ncz = 0, queue = [], needDraw = true, hover = null, totalFaces = 0, meshed = 0;
  const genOpts = () => ({ seed: st.seed, sx: st.sx, sz: st.sx, sy: st.sy, scale: st.scale, octaves: st.octaves, rough: st.rough, water: st.water, island: st.island, flat: st.flat, snow: st.snow, caves: st.caves, trees: st.trees, ores: st.ores });
  const cutY = () => Math.min(st.cut, world.sy - 1);

  /* ---------- WebGL: чанковий меш, орбітальна камера ---------- */
  const cv = $('cv'), wrap = $('wrap');
  const gl = cv.getContext('webgl', { antialias: true, alpha: false }) || cv.getContext('experimental-webgl');
  const ext32 = gl && gl.getExtension('OES_element_index_uint');
  if (!gl || !ext32) { $('status').textContent = 'Для цього інструмента потрібен WebGL, а ваш браузер його не надає.'; throw new Error('WebGL недоступний'); }
  const VS = 'attribute vec4 a_pos;attribute vec4 a_col;uniform mat4 u_vp;uniform vec3 u_off;uniform float u_sc;varying vec4 v_col;void main(){gl_Position=u_vp*vec4(a_pos.xyz*u_sc+u_off,1.0);v_col=a_col;}';
  const FS = 'precision mediump float;varying vec4 v_col;uniform vec4 u_tint;void main(){gl_FragColor=v_col*u_tint;}';
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const aPos = gl.getAttribLocation(prog, 'a_pos'), aCol = gl.getAttribLocation(prog, 'a_col'), uVp = gl.getUniformLocation(prog, 'u_vp'), uOff = gl.getUniformLocation(prog, 'u_off'), uSc = gl.getUniformLocation(prog, 'u_sc'), uTint = gl.getUniformLocation(prog, 'u_tint');
  gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aCol); gl.clearColor(.075, .105, .14, 1); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  // спільний індексний буфер для всіх граней (кожна грань = 4 вершини, 6 індексів); росте за потреби
  const ibo = gl.createBuffer(); let iboFaces = 0;
  function needIndices(n) { if (n <= iboFaces) return; iboFaces = Math.max(n, iboFaces * 2, 4096); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, V.quadIndices(iboFaces), gl.STATIC_DRAW); }
  // рамка-підсвітка блока під курсором: 12 ребер одиничного куба
  const edges = new Uint8Array(24 * 8), cube = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([p, q], i) => [p, q].forEach((c, k) => edges.set([...cube[c], 0, 255, 255, 255, 255], (i * 2 + k) * 8)));
  const eb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, eb); gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);

  // матриці (стовпчикові, як у WebGL)
  const M = {
    mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
    persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
    ortho(hh, asp, n, f) { const o = new Float32Array(16); o[0] = 1 / (hh * asp); o[5] = 1 / hh; o[10] = -2 / (f - n); o[14] = -(f + n) / (f - n); o[15] = 1; return o; },
    look(e, t) {
      let z = [e[0] - t[0], e[1] - t[1], e[2] - t[2]]; const zl = Math.hypot(...z); z = z.map(v => v / zl);
      let x = [z[2], 0, -z[0]]; const xl = Math.hypot(...x); x = x.map(v => v / xl); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
      return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]);
    },
    inv(m) { // загальне обернення 4×4
      const a = Array.from(m), o = new Array(16).fill(0); for (let i = 0; i < 4; i++) o[i * 5] = 1;
      for (let c = 0; c < 4; c++) {
        let p = c; for (let r = c + 1; r < 4; r++) if (Math.abs(a[c * 4 + r]) > Math.abs(a[c * 4 + p])) p = r;
        for (let k = 0; k < 4; k++) { [a[k * 4 + c], a[k * 4 + p]] = [a[k * 4 + p], a[k * 4 + c]]; [o[k * 4 + c], o[k * 4 + p]] = [o[k * 4 + p], o[k * 4 + c]]; }
        const d = a[c * 4 + c]; for (let k = 0; k < 4; k++) { a[k * 4 + c] /= d; o[k * 4 + c] /= d; }
        for (let r = 0; r < 4; r++) if (r !== c) { const f = a[c * 4 + r]; if (f) for (let k = 0; k < 4; k++) { a[k * 4 + r] -= f * a[k * 4 + c]; o[k * 4 + r] -= f * o[k * 4 + c]; } }
      } return o;
    },
  };
  const FOV = 50 * Math.PI / 180;
  const cam = { yaw: Math.PI / 4, pitch: .62, dist: 80, tx: 0, ty: 0, tz: 0 };
  const diag = () => Math.hypot(world.sx, world.sz);
  const clampCam = () => {
    const pad = Math.max(world.sx, world.sz) * .25;
    cam.pitch = Math.min(1.5, Math.max(.05, cam.pitch)); cam.dist = Math.min(diag() * 2.5, Math.max(3, cam.dist));
    cam.tx = Math.min(world.sx + pad, Math.max(-pad, cam.tx)); cam.tz = Math.min(world.sz + pad, Math.max(-pad, cam.tz)); cam.ty = Math.min(world.sy, Math.max(0, cam.ty));
  };
  function resetView() {
    let sum = 0; for (let i = 0; i < world.heights.length; i += 7) sum += world.heights[i]; const avg = sum / Math.ceil(world.heights.length / 7);
    Object.assign(cam, { yaw: Math.PI / 4, pitch: .62, tx: world.sx / 2, ty: avg * .8, tz: world.sz / 2, dist: Math.max(30, diag() * .9) }); clampCam(); needDraw = true;
  }
  let eye = [0, 0, 0], vp = null, ivp = null, planes = [];
  function updateCamera() {
    const cw = cv.clientWidth || 1, ch = cv.clientHeight || 1, asp = cw / ch, cp = Math.cos(cam.pitch);
    eye = [cam.tx + cam.dist * Math.sin(cam.yaw) * cp, cam.ty + cam.dist * Math.sin(cam.pitch), cam.tz + cam.dist * Math.cos(cam.yaw) * cp];
    const view = M.look(eye, [cam.tx, cam.ty, cam.tz]), far = cam.dist + diag() * 2.5;
    const proj = st.ortho ? M.ortho(cam.dist * Math.tan(FOV / 2), asp, -diag(), far) : M.persp(FOV, asp, Math.max(.05, cam.dist * .01), far);
    vp = M.mul(proj, view); ivp = M.inv(vp);
    // площини відсікання (метод Гріба-Хартмана) для швидкого відкидання чанків поза кадром
    planes = []; for (let i = 0; i < 6; i++) { const s = i & 1 ? -1 : 1, r = i >> 1, p = [0, 1, 2, 3].map(k => vp[k * 4 + 3] + s * vp[k * 4 + r]), l = Math.hypot(p[0], p[1], p[2]); planes.push(p.map(v => v / l)); }
  }
  const inFrustum = (x0, y0, z0, x1, y1, z1) => { for (const p of planes) if (p[0] * (p[0] > 0 ? x1 : x0) + p[1] * (p[1] > 0 ? y1 : y0) + p[2] * (p[2] > 0 ? z1 : z0) + p[3] < 0) return false; return true; };

  /* ---------- чанки: меш будується порціями, змінений блок перебудовує лише свій чанк ---------- */
  function freeChunk(c) { for (const k of ['o', 'w']) if (c[k]) { gl.deleteBuffer(c[k].buf); c[k] = null; } }
  function upload(c, m) {
    freeChunk(c); totalFaces += m.faces - c.faces; c.faces = m.faces;
    for (const [k, src] of [['o', m.opaque], ['w', m.water]]) if (src) { const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, src.v, gl.STATIC_DRAW); c[k] = { buf, n: src.n }; needIndices(src.n); }
    if (!c.done) { c.done = true; meshed++; } needDraw = true;
  }
  const rebuild = c => upload(c, V.meshChunk(world, c.cx, c.cz, cutY()));
  function resetChunks() {
    for (const c of chunks) freeChunk(c);
    [ncx, ncz] = V.chunkCount(world); chunks = []; totalFaces = 0; meshed = 0;
    for (let cz = 0; cz < ncz; cz++) for (let cx = 0; cx < ncx; cx++) chunks.push({ cx, cz, o: null, w: null, faces: 0, done: false });
    enqueueAll();
  }
  function enqueueAll() { // найближчі до цілі камери — першими, тож світ «проростає» від центру огляду
    queue = chunks.slice().sort((a, b) => Math.hypot((a.cx + .5) * V.CS - cam.tx, (a.cz + .5) * V.CS - cam.tz) - Math.hypot((b.cx + .5) * V.CS - cam.tx, (b.cz + .5) * V.CS - cam.tz)).reverse(); needDraw = true;
  }
  function pumpQueue(budget = 9) { // кілька мілісекунд на кадр, щоб інтерфейс не підвисав на великих світах
    const t0 = performance.now(); while (queue.length && performance.now() - t0 < budget) rebuild(queue.pop());
    if (!queue.length && meshed === chunks.length) setStatus();
  }
  function touchBlock(x, y, z) { // після зміни блока: свій чанк і сусідні, якщо блок на межі
    const cx = Math.floor(x / V.CS), cz = Math.floor(z / V.CS), set = new Set([cz * ncx + cx]);
    if (x % V.CS === 0 && cx > 0) set.add(cz * ncx + cx - 1); if (x % V.CS === V.CS - 1 && cx < ncx - 1) set.add(cz * ncx + cx + 1);
    if (z % V.CS === 0 && cz > 0) set.add((cz - 1) * ncx + cx); if (z % V.CS === V.CS - 1 && cz < ncz - 1) set.add((cz + 1) * ncx + cx);
    for (const i of set) rebuild(chunks[i]);
  }

  /* ---------- малювання ---------- */
  function draw() {
    needDraw = false; if (!world) return;
    const dpr = Math.min(2, devicePixelRatio || 1), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    gl.viewport(0, 0, W, H); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); updateCamera();
    gl.useProgram(prog); gl.uniformMatrix4fv(uVp, false, vp); gl.uniform1f(uSc, 1); gl.uniform4f(uTint, 1, 1, 1, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    const vis = chunks.filter(c => (c.o || c.w) && inFrustum(c.cx * V.CS, 0, c.cz * V.CS, Math.min(world.sx, (c.cx + 1) * V.CS), world.sy, Math.min(world.sz, (c.cz + 1) * V.CS)));
    const pass = k => { for (const c of vis) { const b = c[k]; if (!b) continue; gl.uniform3f(uOff, c.cx * V.CS, 0, c.cz * V.CS); gl.bindBuffer(gl.ARRAY_BUFFER, b.buf); gl.vertexAttribPointer(aPos, 4, gl.UNSIGNED_BYTE, false, 8, 0); gl.vertexAttribPointer(aCol, 4, gl.UNSIGNED_BYTE, true, 8, 4); gl.drawElements(gl.TRIANGLES, b.n * 6, gl.UNSIGNED_INT, 0); } };
    gl.disable(gl.BLEND); gl.depthMask(true); pass('o');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    const dist = c => Math.hypot((c.cx + .5) * V.CS - eye[0], (c.cz + .5) * V.CS - eye[2]); vis.sort((a, b) => dist(b) - dist(a)); pass('w');
    gl.depthMask(true); gl.disable(gl.BLEND);
    if (hover) { // рамка навколо блока, на який дивимось (для «Ставити» — навколо клітинки, куди ляже новий блок)
      const t = st.tool === 'place' ? [hover.x + hover.nx, hover.y + hover.ny, hover.z + hover.nz] : [hover.x, hover.y, hover.z];
      gl.uniform3f(uOff, t[0] - .004, t[1] - .004, t[2] - .004); gl.uniform1f(uSc, 1.008); gl.uniform4f(uTint, ...(st.tool === 'break' ? [1, .35, .3, 1] : st.tool === 'place' ? [.5, 1, .6, 1] : [1, 1, 1, 1]));
      gl.bindBuffer(gl.ARRAY_BUFFER, eb); gl.vertexAttribPointer(aPos, 4, gl.UNSIGNED_BYTE, false, 8, 0); gl.vertexAttribPointer(aCol, 4, gl.UNSIGNED_BYTE, true, 8, 4); gl.drawArrays(gl.LINES, 0, 24);
    }
  }
  function frame(now) {
    const dt = Math.min(.1, (now - (frame.t || now)) / 1000); frame.t = now;
    if (world) {
      let moved = false; const k = keys;
      if (k.has('KeyQ')) { cam.yaw -= 1.7 * dt; moved = true; } if (k.has('KeyE')) { cam.yaw += 1.7 * dt; moved = true; }
      const fw = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0), rt = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
      if (fw || rt) { const sp = cam.dist * .7 * dt * (k.has('ShiftLeft') || k.has('ShiftRight') ? 2.5 : 1); cam.tx += (-Math.sin(cam.yaw) * fw + Math.cos(cam.yaw) * rt) * sp; cam.tz += (-Math.cos(cam.yaw) * fw - Math.sin(cam.yaw) * rt) * sp; moved = true; }
      if (moved) { clampCam(); needDraw = true; }
      if (queue.length) { pumpQueue(); setStatus(); }
      if (needDraw) draw();
    }
    requestAnimationFrame(frame);
  }
  const keys = new Set();
  function setStatus(extra) {
    if (extra) { $('status').textContent = extra; return; }
    $('status').textContent = queue.length ? `Будуємо меш: ${meshed} з ${chunks.length} чанків…` : DEFAULT_HINT;
    const solid = world.blocks.length - cnt[0] - cnt[V.ID.WATER];
    $('info').textContent = `${world.sx}×${world.sz}×${world.sy}: ${(world.blocks.length / 1e6).toFixed(2)} млн клітинок, ${(solid / 1e6).toFixed(2)} млн блоків, у мешi лише ${(totalFaces / 1e3).toFixed(0)} тис. видимих граней (${chunks.length} чанків)`;
  }
  const DEFAULT_HINT = 'Дивитись: перетягни мишею, щоб обертати, права кнопка чи Shift+перетягування панорамує, колесо наближає. Ставити/Ламати працюють з поточного ракурсу; рух камери в цих режимах: W A S D / стрілки, Q E, середня кнопка миші.';

  /* ---------- вибір блока променем ---------- */
  function rayAt(clientX, clientY) {
    const r = cv.getBoundingClientRect(), nx = (clientX - r.left) / r.width * 2 - 1, ny = 1 - (clientY - r.top) / r.height * 2;
    const un = z => { const x = ivp, v = [nx, ny, z, 1], o = [0, 0, 0, 0]; for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) o[i] += x[k * 4 + i] * v[k]; return [o[0] / o[3], o[1] / o[3], o[2] / o[3]]; };
    const a = un(-1), b = un(1), d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d);
    return V.raycast(world, a, d.map(v => v / l), 1e9, cutY());
  }

  /* ---------- редагування ---------- */
  function setBlock(x, y, z, to, record = true) {
    const i = V.idx(world, x, y, z), from = world.blocks[i]; if (from === to) return;
    world.blocks[i] = to; cnt[from]--; cnt[to]++; if (record) { undo.push({ i, from, to }); if (undo.length > 500) undo.shift(); }
    touchBlock(x, y, z); stats(); setStatus();
  }
  function edit(hit, remove) {
    let x = hit.x, y = hit.y, z = hit.z;
    if (!remove) { x += hit.nx; y += hit.ny; z += hit.nz; }
    if (!V.inb(world, x, y, z)) return toast('Поза межами світу');
    const from = world.blocks[V.idx(world, x, y, z)];
    if (remove && from === V.ID.BEDROCK) return toast('Основу ламати не можна');
    if (!remove && from !== 0 && !V.BLOCKS[from].liquid && from !== V.ID.LEAVES) return; // ставити можна в повітря, воду й листя
    setBlock(x, y, z, remove ? 0 : st.block);
  }
  function doUndo() {
    const u = undo.pop(); if (!u) return toast('Немає що скасовувати');
    const layer = world.sx * world.sz, y = Math.floor(u.i / layer), r = u.i % layer; setBlock(r % world.sx, y, Math.floor(r / world.sx), u.from, false);
  }
  $('btnUndo').onclick = doUndo;

  /* ---------- миша й дотик ---------- */
  const ptrs = new Map(); let drag = null;
  const worldPerPx = () => 2 * cam.dist * Math.tan(FOV / 2) / (cv.clientHeight || 1);
  function orbit(dx, dy) { cam.yaw -= dx * .008; cam.pitch += dy * .008; clampCam(); needDraw = true; }
  function pan(dx, dy) { // «хапаємо» землю: карта їде за курсором
    const s = worldPerPx(), sv = s / Math.max(.25, Math.sin(cam.pitch));
    cam.tx += -Math.cos(cam.yaw) * dx * s - Math.sin(cam.yaw) * dy * sv; cam.tz += Math.sin(cam.yaw) * dx * s - Math.cos(cam.yaw) * dy * sv; clampCam(); needDraw = true;
  }
  const zoomBy = f => { cam.dist *= f; clampCam(); needDraw = true; };
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; drag = { mode: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; return; }
    const look = st.tool === 'look', mode = e.button === 1 || e.button === 0 && e.shiftKey ? 'pan' : e.button === 2 ? (look ? 'pan' : 'orbit') : look ? 'orbit' : 'click';
    drag = { mode, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey, moved: 0 };
    if (e.button === 1) e.preventDefault();
  });
  cv.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (p && drag) {
      if (drag.mode === 'pinch' && ptrs.size === 2) {
        p.x = e.clientX; p.y = e.clientY; const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        if (drag.d > 0 && d > 0) zoomBy(drag.d / d); pan(cx - drag.cx, cy - drag.cy); drag.d = d; drag.cx = cx; drag.cy = cy; return;
      }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
      if (drag.mode === 'orbit') orbit(dx, dy); else if (drag.mode === 'pan') pan(dx, dy);
      p.x = e.clientX; p.y = e.clientY; if (drag.mode !== 'click') return;
    }
    if (hoverRaf) return; const cx = e.clientX, cy = e.clientY;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0; if (!world || !vp) return; const h = rayAt(cx, cy); hover = h; needDraw = true;
      if (h && !queue.length) setStatus(`${V.BLOCKS[V.get(world, h.x, h.y, h.z)].name} · x ${h.x}, z ${h.z}, висота ${h.y}`); else if (!queue.length) setStatus();
    });
  });
  let hoverRaf = 0;
  const endPtr = e => {
    ptrs.delete(e.pointerId);
    if (!drag) return;
    if (drag.mode === 'pinch') { drag = ptrs.size ? { mode: 'none' } : null; return; }
    const d = drag; drag = null;
    if (d.mode === 'click' && d.moved <= 5 && e.type === 'pointerup') { const h = rayAt(e.clientX, e.clientY); if (h) edit(h, st.tool === 'break' || d.shift); }
    else if (d.button === 2 && d.moved <= 5 && st.tool !== 'look' && e.type === 'pointerup') { const h = rayAt(e.clientX, e.clientY); if (h) edit(h, true); } // права кнопка без перетягування ламає блок
  };
  cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
  cv.addEventListener('pointerleave', () => { if (!drag && hover) { hover = null; needDraw = true; } });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  wrap.addEventListener('wheel', e => { if (e.target.closest('.drawer, .bar, .palette')) return; e.preventDefault(); zoomBy(Math.exp(e.deltaY * (e.deltaMode ? .05 : .0015))); }, { passive: false });

  /* ---------- меню-іконки ---------- */
  // меню-іконки й довідка «i»: спільний кіт zb-ui.js (ZB.showPanel)

  /* ---------- генерація ---------- */
  let lastSize = 0;
  function regenerate() {
    setBusy(true);
    setTimeout(() => { // даємо браузеру показати «Генерація…» перед важкою роботою
      const t0 = performance.now(); world = V.generate(genOpts()); undo = []; cnt = V.counts(world); st.cut = Math.min(st.cut, world.sy - 1); hover = null;
      if (lastSize !== world.sx) { lastSize = world.sx; resetView(); } else clampCam();
      resetChunks(); syncUi(); stats(); setStatus(); setBusy(false); regenerate.ms = Math.round(performance.now() - t0); needDraw = true;
    }, 20);
  }
  const setBusy = on => { $('busy').hidden = !on; };

  /* ---------- інтерфейс ---------- */
  const SL = [['rSize', 'oSize', () => st.sx, v => { st.sx = v; }, v => `${v}×${v} (${v / V.CS}×${v / V.CS} чанків)`], ['rSy', 'oSy', () => st.sy, v => { st.sy = v; }, v => v],
    ['rScale', 'oScale', () => st.scale, v => { st.scale = v; }, v => v], ['rOct', 'oOct', () => st.octaves, v => { st.octaves = v; }, v => v], ['rRough', 'oRough', () => Math.round(st.rough * 100), v => { st.rough = v / 100; }, v => v + '%'],
    ['rWater', 'oWater', () => Math.round(st.water * 100), v => { st.water = v / 100; }, v => v + '%'], ['rIsland', 'oIsland', () => Math.round(st.island * 100), v => { st.island = v / 100; }, v => v + '%'], ['rFlat', 'oFlat', () => Math.round(st.flat * 100), v => { st.flat = v / 100; }, v => v + '%'],
    ['rSnow', 'oSnow', () => Math.round(st.snow * 100), v => { st.snow = v / 100; }, v => v + '%'], ['rCaves', 'oCaves', () => Math.round(st.caves * 100), v => { st.caves = v / 100; }, v => v + '%'],
    ['rTrees', 'oTrees', () => Math.round(st.trees * 100), v => { st.trees = v / 100; }, v => v + '%'], ['rOres', 'oOres', () => Math.round(st.ores * 100), v => { st.ores = v / 100; }, v => v + '%']];
  function syncUi() {
    for (const [r, o, get, , fmt] of SL) { $(r).value = get(); $(o).textContent = fmt(get()); }
    $('tSeed').value = st.seed;
    const sy = world ? world.sy : st.sy, cut = Math.min(st.cut, sy - 1); $('rCut').max = sy - 1; $('rCut').value = cut; $('oCut').textContent = cut >= sy - 1 ? 'усе' : cut;
    document.querySelectorAll('#tools button').forEach(b => b.classList.toggle('on', b.dataset.tool === st.tool)); $('palette').hidden = st.tool !== 'place'; wrap.classList.toggle('tool', st.tool !== 'look');
    document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.id === st.block));
    $('btnProj').textContent = st.ortho ? 'Ізометрія' : 'Перспектива'; $('sizeWarn').hidden = st.sx <= 256;
  }
  for (const [r, , , setv] of SL) {
    $(r).addEventListener('input', e => { setv(+e.target.value); save(); clearTimeout(regenerate.t); regenerate.t = setTimeout(regenerate, st.sx >= 256 ? 450 : 120); syncUi(); });
  }
  $('tSeed').onchange = e => { st.seed = e.target.value.trim() || randSeed(); save(); regenerate(); };
  const newWorld = () => { st.seed = randSeed(); save(); regenerate(); };
  $('btnNew').onclick = newWorld; $('btnNew2').onclick = newWorld;
  const CAM_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
  addEventListener('keydown', e => {
    const t = document.activeElement, field = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName), range = field && t.type === 'range';
    if (field && !range) return;
    if (e.code === 'Space') { e.preventDefault(); newWorld(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); doUndo(); }
    else if (e.code === 'Home' || e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) { if (world) resetView(); }
    else if (CAM_KEYS.has(e.code) && !e.ctrlKey && !e.metaKey && !(range && e.code.startsWith('Arrow'))) { keys.add(e.code); if (e.code.startsWith('Arrow')) e.preventDefault(); }
  });
  addEventListener('keyup', e => keys.delete(e.code)); addEventListener('blur', () => keys.clear());
  const turn = a => { cam.yaw += a; needDraw = true; };
  $('btnRotL').onclick = () => turn(-Math.PI / 4); $('btnRotR').onclick = () => turn(Math.PI / 4);
  $('btnReset').onclick = () => { if (world) resetView(); };
  $('btnProj').onclick = () => { st.ortho = !st.ortho; syncUi(); save(); needDraw = true; };
  $('rCut').oninput = e => { st.cut = +e.target.value; syncUi(); enqueueAll(); save(); };
  document.querySelectorAll('#tools button').forEach(b => { b.onclick = () => { st.tool = b.dataset.tool; syncUi(); save(); needDraw = true; }; });
  const pal = $('palette');
  for (const id of [V.ID.BRICK, V.ID.PLANKS, V.ID.STONE, V.ID.WOOD, V.ID.GRASS, V.ID.DIRT, V.ID.SAND, V.ID.WATER, V.ID.SNOW, V.ID.LEAVES, V.ID.GRAVEL, V.ID.GOLD, V.ID.COPPER, V.ID.DIAMOND, V.ID.EMERALD]) {
    const B = V.BLOCKS[id], b = document.createElement('button'); b.className = 'sw'; b.dataset.id = id; b.type = 'button'; b.title = 'Блок: ' + B.name;
    const i = document.createElement('i'); i.style.background = `rgb(${B.color.join(',')})`; b.append(i, B.name); b.onclick = () => { st.block = id; syncUi(); save(); }; pal.append(b);
  }
  function stats() {
    const box = $('counts'); box.replaceChildren();
    cnt.forEach((n, id) => { if (!id || !n) return; const d = document.createElement('div'), i = document.createElement('i'), sp = document.createElement('span'), b = document.createElement('b'); i.style.background = `rgb(${V.BLOCKS[id].color.join(',')})`; sp.textContent = V.BLOCKS[id].name; b.textContent = n; d.append(i, sp, b); box.append(d); });
  }

  /* ---------- експорт ---------- */
  $('btnVox').onclick = () => { try { download(new Blob([V.toVox(world)], { type: 'application/octet-stream' }), `voxel-${st.seed}.vox`); toast('Збережено .vox: відкрийте в MagicaVoxel'); } catch (e) { toast(e.message); } };
  $('btnJson').onclick = () => { download(new Blob([JSON.stringify(V.toJson(world))], { type: 'application/json' }), `voxel-${st.seed}.json`); toast('Збережено JSON'); };
  $('btnPng').onclick = () => { draw(); cv.toBlob(b => { download(b, `voxel-${st.seed}.png`); toast('Збережено картинку'); }); };
  $('btnHm').onclick = () => {
    const hm = V.heightmap(world), c = document.createElement('canvas'); c.width = world.sx; c.height = world.sz; const g = c.getContext('2d'), im = g.createImageData(world.sx, world.sz);
    for (let i = 0; i < hm.length; i++) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = hm[i]; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); c.toBlob(b => { download(b, `heightmap-${st.seed}.png`); toast('Збережено карту висот'); });
  };
  $('btnCopyJson').onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(V.toJson(world))); toast('JSON скопійовано'); } catch { toast('Не вдалося скопіювати: збережіть файл'); } };
  $('btnImport').onclick = () => $('file').click();
  $('file').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try { world = V.fromJson(JSON.parse(await f.text())); st.sx = world.sx; st.sy = world.sy; undo = []; cnt = V.counts(world); st.cut = world.sy - 1; lastSize = world.sx; hover = null; resetView(); resetChunks(); syncUi(); stats(); setStatus(); toast('Світ імпортовано'); } catch { toast('Не вдалося прочитати файл'); }
  };
  if (window.ResizeObserver) new ResizeObserver(() => { needDraw = true; }).observe(wrap);
  requestAnimationFrame(frame);
  regenerate();
})();
