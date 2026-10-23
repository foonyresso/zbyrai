/* ---- межі регіонів і провінцій, берег, територіальні води ----
   Геометрія рахується у ФІКСОВАНІЙ світовій ґратці (крок BGS, плитки BN×BN вузлів) і кешується в WLD.bt:
   вона не залежить від масштабу, зсуву чи розміру вікна. Масштаб змінює лише товщину ліній і прозорість (плавне зникання). */
const BGS = 400, BN = 64, BTW = BGS * BN;
const bTerr = (x, y) => {
  const o = regAt(x, y);
  return o && eland(x, y) <= 0 && terrZ(x, y) < 0 ? null : o;
};
function bTile(ti, tj) {
  const key = ti + "," + tj;
  let t = WLD.bt.get(key);
  if (t) return t;
  const N = BN + 1,
    X0 = ti * BTW,
    Y0 = tj * BTW,
    ref = new Array(N * N),
    E = new Float32Array(N * N),
    Zw = new Float32Array(N * N),
    tc = document.createElement("canvas");
  tc.width = tc.height = N;
  const tx = tc.getContext("2d"), im = tx.createImageData(N, N), dt = im.data;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const k = j * N + i,
        x = X0 + i * BGS,
        y = Y0 + j * BGS,
        e = E[k] = eland(x, y);
      let h = regAt(x, y);
      Zw[k] = 1;
      if (e <= 0) {
        Zw[k] = terrZ(x, y);
        if (Zw[k] < 0) h = null;
      }
      ref[k] = h;
      if (h && e > 0) {
        const c = provCol(PV(h)), o = k * 4;
        dt[o] = c[0];
        dt[o + 1] = c[1];
        dt[o + 2] = c[2];
        dt[o + 3] = 120;
      }
    }
  }
  tx.putImageData(im, 0, 0);
  const wild = [], coast = [], seg = [[], [], []];
  const mq = (v, k0, out, hs) => {
    for (let j = 0; j < N - 1; j++) {
      for (let i = 0; i < N - 1; i++) {
        const k = j * N + i,
          K = [k, k + 1, k + N, k + N + 1],
          z = K.map((q) => v[q]),
          X = [i, i + 1, i, i + 1],
          Y = [j, j, j + 1, j + 1],
          pts = [];
        for (const [a, b] of [[0, 1], [1, 3], [2, 3], [0, 2]]) {
          if ((z[a] > 0) !== (z[b] > 0)) {
            const u = z[a] / (z[a] - z[b]);
            pts.push([
              X0 + (X[a] + (X[b] - X[a]) * u) * BGS,
              Y0 + (Y[a] + (Y[b] - Y[a]) * u) * BGS,
            ]);
          }
        }
        if (pts.length < 2) continue;
        let h = null;
        if (hs) {
          const lk = K.findIndex((q, n) => z[n] > 0);
          h = lk >= 0 ? ref[K[lk]] : null;
          if (!h) continue;
        }
        out.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1], h]);
        if (pts.length == 4) {
          out.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1], h]);
        }
      }
    }
  };
  mq(Zw, 0, wild, false);
  mq(E, 0, coast, true);
  /* межі між регіонами: точка уточнюється бісекцією → гладка крива */
  const Hh = new Array(N * N),
    Vv = new Array(N * N),
    edge = (a, b, ax, ay, bx, by) => {
      if (!a || !b || a === b) return null;
      const t0 = PV(a) !== PV(b) ? 1 : 0;
      if (!t0 && (a.iso || b.iso)) return null;
      let lx = ax, ly = ay, hx = bx, hy = by;
      for (let k = 0; k < 5; k++) {
        const mx = (lx + hx) / 2, my = (ly + hy) / 2;
        if (bTerr(mx, my) === a) {
          lx = mx;
          ly = my;
        } else {
          hx = mx;
          hy = my;
        }
      }
      const x = (lx + hx) / 2, y = (ly + hy) / 2;
      return {
        x,
        y,
        a,
        b,
        dx: bx - ax,
        dy: by - ay,
        t: t0,
        l: eland(x, y) > 0,
      };
    };
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = ref[j * N + i], x = X0 + i * BGS, y = Y0 + j * BGS;
      if (i < N - 1) {
        Hh[j * N + i] = edge(a, ref[j * N + i + 1], x, y, x + BGS, y);
      }
      if (j < N - 1) {
        Vv[j * N + i] = edge(a, ref[(j + 1) * N + i], x, y, x, y + BGS);
      }
    }
  }
  const put = (p, q) => {
    const l = p.l && q.l, tt = Math.max(p.t, q.t);
    if (l) seg[tt].push([p.x, p.y, q.x, q.y, p.a, p.b, p.dx, p.dy]);
    else if (tt) seg[2].push([p.x, p.y, q.x, q.y]);
  };
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const P = [
        Hh[j * N + i],
        Hh[(j + 1) * N + i],
        Vv[j * N + i],
        Vv[j * N + i + 1],
      ]
        .filter(Boolean);
      if (P.length == 2) put(P[0], P[1]);
      else if (P.length == 1) {
        /* межа впирається в край територіальних вод: добудовуємо її до лінії дикого океану, інакше лишається розрив */
        const k = j * N + i, K = [k, k + 1, k + N, k + N + 1], X = [i, i + 1, i, i + 1], Y = [j, j, j + 1, j + 1], p = P[0];
        let best = null, bd = 1e18;
        for (const [a, b] of [[0, 1], [1, 3], [2, 3], [0, 2]]) {
          const za = Zw[K[a]], zb = Zw[K[b]];
          if ((za > 0) === (zb > 0)) continue;
          const u = za / (za - zb), x = X0 + (X[a] + (X[b] - X[a]) * u) * BGS, y = Y0 + (Y[a] + (Y[b] - Y[a]) * u) * BGS, d = (x - p.x) ** 2 + (y - p.y) ** 2;
          if (d < bd) { bd = d; best = { x, y, t: p.t, l: false }; }
        }
        if (best) put(p, best);
      } else if (P.length > 2) {
        const c = {
          x: P.reduce((a, q) => a + q.x, 0) / P.length,
          y: P.reduce((a, q) => a + q.y, 0) / P.length,
        };
        for (const q of P) put(q, { x: c.x, y: c.y, t: q.t, l: q.l });
      }
    }
  }
  t = { tc, seg, coast, wild, x0: X0, y0: Y0 };
  WLD.bt.set(key, t);
  return t;
}
let BCK = null;
function drawBorders() {
  if (S < .006 || S >= .2 || !WLD) return;
  hh();
  if (WLD.btk !== WLD.hk) {
    WLD.bt = new Map();
    WLD.btk = WLD.hk;
  }
  /* плавне зникання між S=.1 і S=.2 замість різкого «є / нема» */
  const fa = S <= .1 ? 1 : (.2 - S) / .1,
    tx0 = Math.floor(-ox / S / BTW),
    tx1 = Math.floor((W - ox) / S / BTW),
    ty0 = Math.floor(-oy / S / BTW),
    ty1 = Math.floor((H - oy) / S / BTW),
    seg = [[], [], []],
    coast = [],
    wild = [],
    sc = (q) => [ox + q[0] * S, oy + q[1] * S, ox + q[2] * S, oy + q[3] * S],
    tiles = [];
  for (let tj = ty0; tj <= ty1; tj++) {
    for (let ti = tx0; ti <= tx1; ti++) {
      let t = WLD.bt.get(ti + "," + tj);
      if (!t) {
        if (tick()) t = bTile(ti, tj);
        else {
          WPEND = true;
          continue;
        }
      }
      tiles.push(t);
      for (let n = 0; n < 3; n++) {
        for (const q of t.seg[n]) seg[n].push([...sc(q), ...q.slice(4)]);
      }
      for (const q of t.coast) coast.push([...sc(q), q[4]]);
      for (const q of t.wild) wild.push(sc(q));
    }
  }
  BCK = { seg, coast, wild };
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = fa;
  for (const t of tiles) {
    ctx.drawImage(
      t.tc,
      0,
      0,
      BN,
      BN,
      ox + (t.x0 - BGS / 2) * S,
      oy + (t.y0 - BGS / 2) * S,
      BN * BGS * S + 1,
      BN * BGS * S + 1,
    );
  }
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const by = (L2, fn) => {
      const m = new Map();
      for (const q of L2) {
        const r = fn(q);
        for (const [k, col, x0, y0, x1, y1] of r) {
          let o = m.get(k);
          if (!o) m.set(k, o = { col, p: [] });
          o.p.push(x0, y0, x1, y1);
        }
      }
      return m;
    },
    st = (m, w, al) => {
      ctx.lineWidth = w;
      ctx.globalAlpha = al * fa;
      for (const o of m.values()) {
        ctx.strokeStyle = o.col;
        ctx.beginPath();
        for (let k = 0; k < o.p.length; k += 4) {
          ctx.moveTo(o.p[k], o.p[k + 1]);
          ctx.lineTo(o.p[k + 2], o.p[k + 3]);
        }
        ctx.stroke();
      }
    },
    rc = (h, l) => "rgb(" + hue(h.name, .8, l).join(",") + ")",
    pd = (h) => "rgb(" + provCol(PV(h)).map((v) => v * .5 | 0).join(",") + ")",
    sgm = BCK.seg;
  /* по воді меж немає: кордони лише на суші */
  /* берег: темний колір провінції + колір регіону зверху */
  st(
    by(BCK.coast, (q) => [[PV(q[4]).name, pd(q[4]), q[0], q[1], q[2], q[3]]]),
    1.7,
    .8,
  );
  /* межі суші: кожен регіон своїм кольором зі свого боку; провінційна межа товстіша з темним серцевиною */
  for (const t of [0, 1]) {
    const o = t ? 0 : .8,
      fn = (q) => {
        const l = Math.hypot(q[6], q[7]) || 1, nx2 = q[6] / l, ny2 = q[7] / l;
        return [[
          q[4].name,
          rc(q[4], .5),
          q[0] - nx2 * o,
          q[1] - ny2 * o,
          q[2] - nx2 * o,
          q[3] - ny2 * o,
        ], [
          q[5].name,
          rc(q[5], .5),
          q[0] + nx2 * o,
          q[1] + ny2 * o,
          q[2] + nx2 * o,
          q[3] + ny2 * o,
        ]];
      };
    if (t) {
      for (const [col, w, al] of [["#fff8e6", 8, .7], ["#3a1f30", 4, 1]]) {
        ctx.globalAlpha = al * fa;
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        for (const q of sgm[1]) {
          ctx.moveTo(q[0], q[1]);
          ctx.lineTo(q[2], q[3]);
        }
        ctx.stroke();
      }
    } else {
      ctx.globalAlpha = .5 * fa;
      ctx.strokeStyle = "#6d5a40";
      ctx.lineWidth = .8;
      ctx.beginPath();
      for (const q of sgm[0]) {
        ctx.moveTo(q[0], q[1]);
        ctx.lineTo(q[2], q[3]);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
  /* підписи: провінція (столиці) · регіон · місто (коли карта надто далека для звичайних підписів) */
  const x0 = -ox / S,
    y0 = -oy / S,
    x1 = (W - ox) / S,
    y1 = (H - oy) / S,
    mr = Math.max(...R) + 10,
    it = [];
  ctx.textAlign = "center";
  for (const h of hbox(x0 - 3000, y0 - 3000, x1 + 3000, y1 + 3000)) {
    const hm = h.home,
      x = hm ? ox : ox + h.x * S,
      y = hm ? oy : oy + h.y * S,
      far = S < .04,
      r = far ? 2.2 + h.tier * 1.1 : RB[h.tier] * S * .85;
    if (far) {
      RealmMap.IconsSettlements.drawSettlement(ctx, { rank: hubRank(h), state: "normal" }, x, y, .7 + h.tier * .06);
      if (isCap(h)) capStar(x, y, .7 + h.tier * .06);
    }
    const ty = hm ? oy - mr * S : y + r + 12,
      ry = hm ? oy + mr * S + 14 : y + r + 25;
    if (far) {
      it.push({
        t: h.name,
        x,
        y: ty,
        f: "700 " + Math.min(16, 10 + h.tier * 1.2) + "px system-ui",
        c: "#3a2a18",
        p: 100 + h.tier * 10 + (hm ? 500 : 0),
      });
    }
    if (S >= .012) {
      it.push({
        t: regName(h) + " · ур. " + lvl(h)[0],
        x,
        y: ry,
        f: "600 11px system-ui",
        c: "#6a5a44",
        p: 10 + h.tier,
      });
    }
    if (isCap(h) && S < .07) {
      it.push({
        t: provName(h).toUpperCase() + " · ур. " + provLvl(h),
        x,
        y: (hm || far ? ty : y + r + 12) - 19,
        f: "700 13px system-ui",
        c: "#8a4a3a",
        ls: 2,
        p: 400 + (hm ? 500 : 0),
      });
    }
  }
  it.sort((a, b) => b.p - a.p);
  const pl = [];
  for (const q of it) {
    ctx.font = q.f;
    if ("letterSpacing" in ctx) ctx.letterSpacing = q.ls ? q.ls + "px" : "0px";
    const w = ctx.measureText(q.t).width,
      fs = parseInt(q.f.match(/(\d+)px/)[1]),
      bb = [q.x - w / 2 - 2, q.y - fs, q.x + w / 2 + 2, q.y + 4];
    if (
      pl.some((z) =>
        bb[0] < z[2] && bb[2] > z[0] && bb[1] < z[3] && bb[3] > z[1]
      )
    ) continue;
    pl.push(bb);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(243,239,224,.92)";
    ctx.fillStyle = q.c;
    ctx.strokeText(q.t, q.x, q.y);
    ctx.fillText(q.t, q.x, q.y);
  }
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}
