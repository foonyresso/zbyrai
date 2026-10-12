function makeL() {
  DS = null;
  L = B.filter((b) => !del.has(b.id)).concat(add);
  if (add.length) {
    L = L.filter((b) =>
      !(b.o && SC.has(b.t) &&
        add.some((c) => Math.hypot(b.cx - c.cx, b.cy - c.cy) < b.r + 8))
    );
  }
}
function info() {
  const c = {};
  for (const b of L) {
    if (b.o || !b.rc) continue;
    const k = T[b.t].c;
    c[k] = (c[k] || 0) + 1;
  }
  const m = Math.max(1, ...Object.values(c));
  $("#cats").innerHTML =
    Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      '<div class="bar"><span>' + k + '</span><i style="width:' +
      (v / m * 100) + '%"></i><b>' + v + "</b></div>"
    ).join("") || '<p class="hint">Немає будівель</p>';
}
function rebuild() {
  HH = null;
  bdirty = true;
  if (WLD) {
    WLD.t.clear();
    WLD.gl = null;
    WLD.v.clear();
    WLD.lg.clear();
    WLD.cc.clear();
  }
  build();
  makeL();
  let n = 0, p = 0;
  for (const b of L) {
    if (!b.o && !["well", "fountain", "garden"].includes(b.t)) {
      n++;
      if (T[b.t].c === "Житлова") p += 5;
    }
  }
  $("#cn").textContent = cname($("#seed").value);
  $("#stat").textContent = LAYN[LAY] + " · " + NAMES[tier] + " · споруд: " + n +
    " · мешканців ≈ " + p;
  info();
  redraw();
}
function mkGates() {
  const n = GN[tier],
    r = mk(seed + "g"),
    a0 = r() * PI2,
    gr = LAY == "grid" && n < 5;
  G = [];
  for (let k = 0; k < n; k++) {
    const a = gr
        ? nrm(n == 2 ? k * Math.PI : k * Math.PI / 2)
        : nrm(a0 + k * PI2 / n + (r() - .5) * (n > 2 ? .5 : .6)),
      d = SE ? nrm(a - SE.a) : 9;
    G.push(Math.abs(d) < .8 ? nrm(SE.a + (d < 0 ? -.8 : .8)) : a);
  }
}
function gen(rnd) {
  WLD = null;
  if (rnd) $("#seed").value = Math.floor(Math.random() * 99999);
  seed = hs($("#seed").value);
  tier = +$("#size").value;
  Rm = RB[tier];
  PR = Rm * 1.7 + 30;
  const bv = $("#bio").value;
  BIOK = bv == "r"
    ? [
      "grass",
      "grass",
      "grass",
      "snow",
      "desert",
      "swamp",
    ][Math.floor(mk(seed + "B")() * 6)]
    : bv;
  BIO = BIOS[BIOK];
  const lv = $("#lay").value;
  LAY = lv == "r"
    ? ["rad", "grid", "wind", "long", "rad"][Math.floor(mk(seed + "L")() * 5)]
    : lv;
  const r = mk(seed + "w"), p1 = r() * 6.28, p2 = r() * 6.28;
  R = Array.from({ length: N }, (_, k) => {
    const a = -Math.PI + k / N * PI2;
    const b = 1 + .1 * Math.sin(3 * a + p1) + .06 * Math.sin(5 * a + p2);
    if (LAY == "grid") {
      return Rm * .92 /
        Math.pow(
          Math.pow(Math.abs(Math.cos(a)), 5) +
            Math.pow(Math.abs(Math.sin(a)), 5),
          .2,
        ) * (1 + .03 * Math.sin(5 * a + p2));
    }
    if (LAY == "long") return Rm * b * (1 + .3 * Math.cos(2 * (a - p1)));
    return Rm * b;
  });
  water();
  clampSea();
  polyR();
  mkGates();
  del = new Set();
  add = [];
  undo = [];
  setup();
  rebuild();
  fit();
}
function fit() {
  S = Math.max(.3, Math.min(20, Math.min(W, H) / ((Math.max(...R) + 60) * 2)));
  ox = W / 2;
  oy = H / 2;
  redraw();
}
function applyWall(w) {
  const n = w.length;
  let cx = 0, cy = 0;
  w.forEach((p) => {
    cx += p[0];
    cy += p[1];
  });
  cx /= n;
  cy /= n;
  const v = w.map((p) => [p[0] - cx, p[1] - cy]);
  let A = 0;
  for (let m = 0; m < n; m++) {
    const a = v[m], b = v[(m + 1) % n];
    A += a[0] * b[1] - a[1] * b[0];
  }
  Rm = Math.min(200, Math.max(10, Math.sqrt(Math.abs(A) / 2 / Math.PI)));
  tier = [20, 32, 50, 80, 130].filter((x) => Rm > x).length;
  let nr = [];
  for (let k = 0; k < N; k++) {
    const a = -Math.PI + k / N * PI2, dx = Math.cos(a), dy = Math.sin(a);
    let best = 0;
    for (let m = 0; m < n; m++) {
      const p = v[m],
        e = [v[(m + 1) % n][0] - p[0], v[(m + 1) % n][1] - p[1]],
        den = dx * e[1] - dy * e[0];
      if (!den) continue;
      const t = (p[0] * e[1] - p[1] * e[0]) / den,
        u = (p[0] * dy - p[1] * dx) / den;
      if (t > 0 && u >= 0 && u <= 1 && t > best) best = t;
    }
    nr.push(best || Rm * .5);
  }
  for (let s = 0; s < 4; s++) {
    nr = nr.map((r, k) => (nr[(k + N - 1) % N] + r + nr[(k + 1) % N]) / 3);
  }
  R = nr.map((r) => Math.max(10, r));
  PR = Math.max(...R) + 60;
  $("#size").value = tier;
  seed = hs($("#seed").value);
  water();
  clampSea();
  polyR();
  mkGates();
  del = new Set();
  add = [];
  undo = [];
  setup();
  rebuild();
  fit();
}
function expand(x, y) {
  const a = Math.atan2(y, x), need = Math.hypot(x, y) + 8;
  for (let k = 0; k < N; k++) {
    let df = Math.abs(-Math.PI + k / N * PI2 - a);
    df = Math.min(df, PI2 - df);
    R[k] = Math.min(PR - 12, Math.max(R[k], need - df * need * .6));
  }
  if (RC) R = R.map((v, k) => Math.min(v, RC[k] - 3));
  polyR();
}
