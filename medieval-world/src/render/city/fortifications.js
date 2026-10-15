var TS = 6, WM = 0;
function polyR() {
  TS = [12, 12, 12, 8, 12, 8, 4][tier];
  WM = [0, 0, .5, 1, 1.5, 3, 4.5][tier];
  const P = [];
  for (let k = 0; k < N; k += TS) {
    const a = -Math.PI + k / N * PI2;
    P.push([Math.cos(a) * R[k], Math.sin(a) * R[k]]);
  }
  const n = P.length, o = R.slice();
  for (let i = 0; i < n; i++) {
    const A = P[i], B = P[(i + 1) % n];
    for (let j = 1; j < TS; j++) {
      const k = i * TS + j,
        a = -Math.PI + k / N * PI2,
        dx = Math.cos(a),
        dy = Math.sin(a),
        ex = B[0] - A[0],
        ey = B[1] - A[1],
        den = dx * ey - dy * ex;
      if (Math.abs(den) > 1e-6) {
        const r = (A[0] * B[1] - A[1] * B[0]) / den;
        if (r > 0) o[k] = r;
      }
    }
  }
  R = o;
  if (RC) R = R.map((v, k) => Math.min(v, RC[k] - 3));
}
function wpath() {
  ctx.beginPath();
  for (let k = 0; k <= N; k++) {
    const a = -Math.PI + k / N * PI2,
      r = R[k % N],
      x = ox + Math.cos(a) * r * S,
      y = oy + Math.sin(a) * r * S;
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
}
function drawWall() {
  if (tier == 0) return;
  const ST_ = [
      0,
      { w: .8, c: "#a68a5f" },
      { w: 1.8, c: "#7a5a38", post: 7 },
      { w: 3.2, c: "#5e3f22", log: 3, tw: 2.8, twc: "#4d3420" },
      { w: 4, c: "#5d5d66", tw: 3.6 },
      { w: 6.5, c: "#55555f", tw: 5.5, top: 1 },
      { w: 9.5, c: "#4a4a58", tw: 7, top: 1 },
    ][tier],
    sg = [];
  for (let k = 0; k < N; k++) {
    const k2 = (k + 1) % N;
    /* на морському березі стін немає: воду прикриває сам берег, причали й порт.
       Одне правило для всіх: відрізок біля води (обидва кінці ближче 9 до неї) без стіни. */
    if (SE) {
      const a1_ = -Math.PI + k / N * PI2, a2_ = a1_ + PI2 / N;
      if (
        seaD(Math.cos(a1_) * R[k], Math.sin(a1_) * R[k]) > -9 &&
        seaD(Math.cos(a2_) * R[k2], Math.sin(a2_) * R[k2]) > -9
      ) continue;
    }
    const a1 = -Math.PI + k / N * PI2, a2 = a1 + PI2 / N;
    {
      const s = [
        k,
        Math.cos(a1) * R[k],
        Math.sin(a1) * R[k],
        Math.cos(a2) * R[k2],
        Math.sin(a2) * R[k2],
      ];
      if (RV && rivD((s[1] + s[3]) / 2, (s[2] + s[4]) / 2) < RV.w / 2 + 2) {
        continue;
      }
      sg.push(s);
    }
  }
  const line = (w, col) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1, w * S);
    ctx.lineJoin = "miter";
    ctx.lineCap = "square";
    ctx.beginPath();
    let last = -2;
    for (const s of sg) {
      if (s[0] != last + 1) ctx.moveTo(ox + s[1] * S, oy + s[2] * S);
      ctx.lineTo(ox + s[3] * S, oy + s[4] * S);
      last = s[0];
    }
    ctx.stroke();
  };
  line(ST_.w, ST_.c);
  if (ST_.top) line(ST_.w * .42, "#8e8e9a");
  const sp = ST_.post || ST_.log;
  if (sp) {
    for (const s of sg) {
      const l = Math.hypot(s[3] - s[1], s[4] - s[2]),
        n = Math.max(1, Math.round(l / sp));
      for (let i = 0; i < n; i++) {
        const f = (i + .5) / n,
          x = ox + (s[1] + (s[3] - s[1]) * f) * S,
          y = oy + (s[2] + (s[4] - s[2]) * f) * S;
        if (ST_.log) {
          ctx.fillStyle = "#33200f";
          dot(x, y, Math.max(1.6, S * 2.1));
          ctx.fillStyle = "#86603a";
          dot(x, y, Math.max(1, S * 1.5));
        } else {
          ctx.fillStyle = "#4d3420";
          dot(x, y, Math.max(1, S * 1.1));
        }
      }
    }
  }
  ctx.lineCap = "butt";
  if (ST_.tw) {
    const dr = new Set(sg.map((s) => s[0])), tp = [];
    for (let k = 0; k < N; k += TS) {
      if (dr.has(k) || dr.has((k + N - 1) % N)) {
        const a = -Math.PI + k / N * PI2;
        tp.push([Math.cos(a) * R[k], Math.sin(a) * R[k]]);
      }
    }
    for (const s of sg) {
      if (!dr.has((s[0] + N - 1) % N)) tp.push([s[1], s[2]]);
      if (!dr.has((s[0] + 1) % N)) tp.push([s[3], s[4]]);
    }
    for (const q of tp) {
      const x = ox + q[0] * S, y = oy + q[1] * S, r = Math.max(2.5, S * ST_.tw);
      ctx.fillStyle = "#2e2e36";
      dot(x, y, r + 1.4);
      ctx.fillStyle = ST_.twc || "#8b8b96";
      dot(x, y, r);
      if (ST_.top) {
        ctx.fillStyle = "#a9a9b6";
        dot(x, y, r * .5);
      }
    }
  }
  if (tier >= 2) {
    const gr = [0, 0, 1.8, 2.6, 4, 5.5, 7][tier],
      of = [0, 0, 2.5, 4, 5.5, 7.5, 10][tier];
    ctx.fillStyle = "#e8c860";
    for (const q of GP) {
      if (!(RV && rivD(q[0], q[1]) < RV.w / 2 + 3)) {
        for (const s of [-1, 1]) {
          dot(
            ox + (q[0] + s * q[2] * of) * S,
            oy + (q[1] + s * q[3] * of) * S,
            Math.max(2, S * gr),
          );
        }
      }
    }
  }
}
function path0(p) {
  ctx.beginPath();
  p.forEach((c, i) =>
    i
      ? ctx.lineTo(ox + c[0] * S, oy + c[1] * S)
      : ctx.moveTo(ox + c[0] * S, oy + c[1] * S)
  );
}
function segD(p, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = dx * dx + dy * dy || 1,
    k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l));
  return Math.hypot(p[0] - a[0] - dx * k, p[1] - a[1] - dy * k);
}
