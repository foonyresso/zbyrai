// Атлас 2.0: хмари над закритими материками. Що тут: пухнастий спрайт за грубим контуром материка (кешується), підпис і хід створення; видно лише контур, решту створює core/blocks.js після кліку. Опис: docs/atlas2/layout.md
(function () {
  'use strict';
  const A = globalThis.Atlas2, cache = new WeakMap(), PAD = 16, S = 3; // PAD і S у пікселях спрайта: S пікселів на клітину грубого контуру
  // спрайт хмари: суша контуру, розширена на клітину, вкрита м'якими клаптями (тінь знизу, біла маса, світлі краї); форма стабільна від зерна материка
  function sprite(d) {
    let c = cache.get(d); if (c) return c; const o = d.outline, { cw, ch, land } = o, cv = document.createElement('canvas'); cv.width = cw * S + 2 * PAD; cv.height = ch * S + 2 * PAD;
    const g = cv.getContext('2d'), r = A.Rng.rng(A.Rng.hashSeed(d.id + '|cloud')), cells = [];
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { let on = land[y * cw + x] === 1; if (!on) for (let k = 0; k < 4 && !on; k++) { const nx = x + A.Grid.DX[k], ny = y + A.Grid.DY[k]; if (nx >= 0 && ny >= 0 && nx < cw && ny < ch && land[ny * cw + nx]) on = true; } if (on) cells.push(x, y); }
    const puffs = []; for (let i = 0; i < cells.length; i += 2) for (let n = 0; n < 2; n++) puffs.push([PAD + (cells[i] + r()) * S, PAD + (cells[i + 1] + r()) * S, S * (1.4 + r() * 1.8)]);
    const blob = (x, y, rad, a0, a1, rgb) => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${rgb},${a0})`); gr.addColorStop(0.65, `rgba(${rgb},${a0 * 0.8})`); gr.addColorStop(1, `rgba(${rgb},${a1})`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill(); };
    for (const [x, y, rad] of puffs) blob(x + S * 0.5, y + S * 1.1, rad * 1.05, 0.34, 0, '28,50,96'); // тінь на воді
    for (const [x, y, rad] of puffs) blob(x, y + rad * 0.3, rad, 0.9, 0, '168,186,214'); // сірувата нижня сторона
    for (const [x, y, rad] of puffs) blob(x, y - rad * 0.12, rad * 0.9, 0.95, 0, '255,255,255');
    cache.set(d, cv); return cv;
  }
  // малює хмару материка d (у координатах клітин світу, ctx уже у вигляді карти); state — {f, label}, якщо материк створюється
  function draw(ctx, d, k, px) {
    const o = d.outline; if (!o) return; const sp = sprite(d), u = o.step / S;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(sp, d.ox - PAD * u, d.oy - PAD * u, sp.width * u, sp.height * u); ctx.restore();
  }
  // підпис над хмарою (екранні координати): що це й як відкрити, або хід створення
  function label(ctx, d, view, state, text) {
    const o = d.outline; if (!o) return; let sx = 0, sy = 0, n = 0; for (let y = 0; y < o.ch; y++) for (let x = 0; x < o.cw; x++) if (o.land[y * o.cw + x]) { sx += x; sy += y; n++; } if (!n) return;
    const dpr = devicePixelRatio || 1, wpx = Math.sqrt(n) * o.step * view.k; if (wpx < 70 * dpr) return;
    const cx = view.tx + (d.ox + (sx / n + 0.5) * o.step) * view.k, cy = view.ty + (d.oy + (sy / n + 0.5) * o.step) * view.k, fs = Math.max(11, Math.min(15, wpx / 14 / dpr)) * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const lines = state ? [`Створюю материк… ${Math.round(state.f * 100)} %`, state.label || ''] : [text || 'Закритий материк', 'натисніть, щоб відкрити'];
    lines.forEach((t, i) => { ctx.font = `${i ? 500 : 700} ${fs * (i ? 0.85 : 1)}px sans-serif`; ctx.lineWidth = 3.5 * dpr; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(t, cx, cy + (i - 0.5) * fs * 1.25); ctx.fillStyle = i ? '#4a5a78' : '#2a3a5c'; ctx.fillText(t, cx, cy + (i - 0.5) * fs * 1.25); });
  }
  A.Clouds = { draw, label, sprite, release: d => cache.delete(d) };
})();
