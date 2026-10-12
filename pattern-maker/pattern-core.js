/* Pattern Maker: математика згортання, вибірка й обчислення періодичної клітинки.
   Без DOM: працює і в браузері (глобал PMCore), і в Node (module.exports), тож її можна тестувати.

   Принцип: для кожного пікселя клітинки «згортаємо» його точку в базову область групи симетрії
   (дзеркальні відбиття), а потім беремо піксель джерела через подібність (зсув + поворот + масштаб).
   Дзеркальні групи не мають внутрішніх швів, тому клітинка стикується з собою при будь-якому вмісті. */
const PMCore = (() => {
  const S3 = Math.sqrt(3), PI = Math.PI;

  const MODES = {
    pmm: { name: 'Дзеркальна сітка', sub: 'pmm · ×4', aspect: true },
    p4m: { name: 'Калейдоскоп', sub: 'p4m · ×8' },
    p6m: { name: 'Соти', sub: 'p6m · ×12' },
    p3m1: { name: 'Трикутна', sub: 'p3m1 · ×6' },
    tex: { name: 'Безшовна текстура', sub: 'без дзеркал', aspect: true, blend: true },
  };

  /* Геометрія режиму в «одиницях області» (висота прямокутника = 1, гекс R = 1):
     період клітинки (PW×PH), контур базової області poly та її центроїд c. */
  function geometry(mode, a = 1) {
    switch (mode) {
      case 'pmm': return { PW: 2 * a, PH: 2, poly: [[0, 0], [a, 0], [a, 1], [0, 1]], c: [a / 2, .5] };
      case 'tex': return { PW: a, PH: 1, poly: [[0, 0], [a, 0], [a, 1], [0, 1]], c: [a / 2, .5] };
      case 'p4m': return { PW: 2, PH: 2, poly: [[0, 0], [1, 0], [1, 1]], c: [2 / 3, 1 / 3] };
      case 'p6m': return { PW: S3, PH: 3, poly: [[0, 0], [S3 / 2, 0], [S3 / 2, .5]], c: [S3 / 3, 1 / 6] };
      case 'p3m1': return { PW: S3, PH: 3, poly: [[0, 0], [S3 / 2, .5], [0, 1]], c: [S3 / 6, .5] };
    }
    throw new Error('Невідомий режим: ' + mode);
  }

  // розмір клітинки в пікселях при заданій ширині; для гекс-режимів висота = round(CW·√3)
  function cellSize(mode, a, CW) {
    const g = geometry(mode, a);
    return [CW, Math.max(1, Math.round(CW * g.PH / g.PW))];
  }

  // дзеркальне згортання t у [0,1]: t mod 2, далі t або 2−t
  const tri = t => { t -= 2 * Math.floor(t / 2); return t > 1 ? 2 - t : t; };

  const hc = new Float64Array(2);
  // центр найближчої комірки гекс-решітки (pointy-top, R = 1): аксіальні координати + кубічне округлення
  function hexCenter(x, y, o) {
    const q = (S3 / 3) * x - y / 3, r = (2 / 3) * y, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r);
    const rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    o[0] = S3 * (rq + rr / 2);
    o[1] = 1.5 * rr;
  }

  // згортає точку (x,y) у базову область і пише результат у out[0], out[1]
  function foldInto(mode, x, y, a, out) {
    switch (mode) {
      case 'pmm':
        out[0] = a * tri(x / a); out[1] = tri(y);
        return out;
      case 'p4m': {
        const X = tri(x), Y = tri(y);
        if (Y > X) { out[0] = Y; out[1] = X; } else { out[0] = X; out[1] = Y; }
        return out;
      }
      case 'p6m': {
        hexCenter(x, y, hc);
        const dx = x - hc[0], dy = y - hc[1], rho = Math.sqrt(dx * dx + dy * dy);
        const th = Math.atan2(dy, dx), seg = PI / 3;
        let t = th - seg * Math.floor(th / seg);
        if (t > PI / 6) t = seg - t;
        out[0] = rho * Math.cos(t); out[1] = rho * Math.sin(t);
        return out;
      }
      case 'p3m1': {
        hexCenter(x, y, hc);
        const dx = x - hc[0], dy = y - hc[1], rho = Math.sqrt(dx * dx + dy * dy);
        const seg = 2 * PI / 3;
        let t = Math.atan2(dy, dx) - PI / 6;
        t -= seg * Math.floor(t / seg);
        if (t > PI / 3) t = seg - t;
        const ang = PI / 6 + t;
        out[0] = rho * Math.cos(ang); out[1] = rho * Math.sin(ang);
        return out;
      }
      case 'tex':
        out[0] = x - a * Math.floor(x / a); out[1] = y - Math.floor(y);
        return out;
    }
    throw new Error('Невідомий режим: ' + mode);
  }
  const fold = (mode, x, y, a = 1) => Array.from(foldInto(mode, x, y, a, [0, 0]));

  const smoothstep = (e0, e1, x) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  // вага W = Wx·Wy безшовної текстури: 0 на краях клітинки, 1 від відстані k·(пів-ширини)
  function texWeight(u, v, a, k) {
    k = Math.max(.02, k);
    const tx = Math.min(u, a - u) / (a / 2), ty = Math.min(v, 1 - v) / .5;
    return smoothstep(0, k, tx) * smoothstep(0, k, ty);
  }

  // дзеркальна індексація: поза межами відбиваємо, а не клампимо в чорне
  function refl(i, n) {
    if (n <= 1) return 0;
    const m = 2 * n - 2;
    i %= m; if (i < 0) i += m;
    return i < n ? i : m - i;
  }

  /* Вибірка зображення {data,width,height} у неперервних координатах пікселів.
     Повертає premultiplied-колір у o[0..3] (канали 0..255), тож прозорі краї не дають темних ореолів.
     nearest = піксель-арт (без згладжування). */
  function makeSampler(src, nearest) {
    const { data: d, width: w, height: h } = src;
    return (x, y, o) => {
      if (nearest) {
        const i = (refl(Math.floor(x), w) + refl(Math.floor(y), h) * w) * 4, al = d[i + 3] / 255;
        o[0] = d[i] * al; o[1] = d[i + 1] * al; o[2] = d[i + 2] * al; o[3] = d[i + 3];
        return;
      }
      const fx = x - .5, fy = y - .5, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const xa = refl(x0, w), xb = refl(x0 + 1, w), ya = refl(y0, h) * w, yb = refl(y0 + 1, h) * w;
      const i00 = (ya + xa) * 4, i10 = (ya + xb) * 4, i01 = (yb + xa) * 4, i11 = (yb + xb) * 4;
      const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
      const a00 = d[i00 + 3] / 255 * w00, a10 = d[i10 + 3] / 255 * w10, a01 = d[i01 + 3] / 255 * w01, a11 = d[i11 + 3] / 255 * w11;
      o[0] = d[i00] * a00 + d[i10] * a10 + d[i01] * a01 + d[i11] * a11;
      o[1] = d[i00 + 1] * a00 + d[i10 + 1] * a10 + d[i01 + 1] * a01 + d[i11 + 1] * a11;
      o[2] = d[i00 + 2] * a00 + d[i10 + 2] * a10 + d[i01 + 2] * a01 + d[i11 + 2] * a11;
      o[3] = (a00 + a10 + a01 + a11) * 255;
    };
  }

  /* Подібність «базова область → зображення»: зсув + поворот phi + рівномірний масштаб s
     навколо центроїда області; (cx,cy) — де центроїд лежить на джерелі (у пікселях). */
  function regionToSource(p, g, rx, ry, out = [0, 0]) {
    const dx = rx - g.c[0], dy = ry - g.c[1], cs = Math.cos(p.phi), sn = Math.sin(p.phi);
    out[0] = p.cx + p.s * (cs * dx - sn * dy);
    out[1] = p.cy + p.s * (sn * dx + cs * dy);
    return out;
  }

  /* Обчислює періодичну клітинку шириною CW.
     p = { mode, a, cx, cy, s, phi, k }; opts = { nearest, ssaa }.
     Повертає { data: Uint8ClampedArray RGBA, width, height }. */
  function renderCell(src, p, CW, opts = {}) {
    const a = p.a || 1, g = geometry(p.mode, a), [, CH] = cellSize(p.mode, a, CW);
    const out = new Uint8ClampedArray(CW * CH * 4);
    const samp = makeSampler(src, !!opts.nearest);
    const cs = Math.cos(p.phi), sn = Math.sin(p.phi), s = p.s, r0x = g.c[0], r0y = g.c[1];
    // скільки пікселів джерела припадає на піксель клітинки: при зменшенні вмикаємо суперсемплінг
    const ratio = s * g.PW / CW;
    const n = opts.ssaa || (opts.nearest ? 1 : ratio > 3 ? 3 : ratio > 1.5 ? 2 : 1);
    const inv = 1 / (n * n), isTex = p.mode === 'tex', half = a / 2;
    const f = [0, 0], c1 = [0, 0, 0, 0], c2 = [0, 0, 0, 0];

    const sampleRegion = (rx, ry, o) => {
      const dx = rx - r0x, dy = ry - r0y;
      samp(p.cx + s * (cs * dx - sn * dy), p.cy + s * (sn * dx + cs * dy), o);
    };

    for (let y = 0; y < CH; y++) {
      for (let x = 0; x < CW; x++) {
        let r = 0, gg = 0, b = 0, al = 0;
        for (let sy = 0; sy < n; sy++) {
          for (let sx = 0; sx < n; sx++) {
            const u = (x + (sx + .5) / n) / CW * g.PW, v = (y + (sy + .5) / n) / CH * g.PH;
            if (isTex) {
              // O = W·I + (1−W)·S, S = зображення, зсунуте циклічно на половину клітинки
              sampleRegion(u, v, c1);
              sampleRegion((u + half) % a, (v + .5) % 1, c2);
              const W = texWeight(u, v, a, p.k == null ? .5 : p.k), V = 1 - W;
              r += W * c1[0] + V * c2[0]; gg += W * c1[1] + V * c2[1];
              b += W * c1[2] + V * c2[2]; al += W * c1[3] + V * c2[3];
            } else {
              foldInto(p.mode, u, v, a, f);
              sampleRegion(f[0], f[1], c1);
              r += c1[0]; gg += c1[1]; b += c1[2]; al += c1[3];
            }
          }
        }
        al *= inv;
        const i = (y * CW + x) * 4;
        if (al > 0) {
          const k = inv * 255 / al;
          out[i] = r * k; out[i + 1] = gg * k; out[i + 2] = b * k; out[i + 3] = al;
        }
      }
    }
    return { data: out, width: CW, height: CH };
  }

  return { MODES, geometry, cellSize, foldInto, fold, tri, hexCenter, smoothstep, texWeight, refl, makeSampler, regionToSource, renderCell };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PMCore;
