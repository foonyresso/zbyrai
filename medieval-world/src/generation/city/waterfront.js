/* Набережна: причали й кораблі (море, океан), рибальські місця на річці, маяк і хвилеріз, споруди за містом біля води.
   Розмір поселення визначає густину й набір: хутір — кілька човнів і хат, столиця — порт із хвилерізом і маяком. */
function wfFree(x, y, r) {
  return !B.some((b) => Math.hypot(b.cx - x, b.cy - y) < b.r + r);
}
function seaFront(mx) {
  const u = [SE.ux, SE.uy],
    nn = [-SE.uy, SE.ux],
    th = SE.a - Math.PI / 2,
    sp2 = mk(seed + "pr"),
    step = [48, 36, 28, 24, 22, 20, 18][tier],
    len = 10 + tier * 2,
    ocean = SE.kind == "ocean",
    at = (q, d) => [u[0] * d + nn[0] * q, u[1] * d + nn[1] * q];
  for (let q = -mx; q <= mx; q += step) {
    const d = shoreAt(q),
      [px, py] = at(q, d),
      j = sp2();
    if (Math.hypot(px, py) > Rat(Math.atan2(py, px)) + 10) continue;
    B.push(mkb("pier", "p" + q, rp(px + u[0] * (len / 2 - 3), py + u[1] * (len / 2 - 3), 3, len, th), 1));
    if (j < .55) {
      const big = tier >= 2, k = ocean ? 1.25 : 1,
        [sx, sy] = at(q + 5, d + len + 6 + j * 24);
      B.push(mkb(big ? "ship" : "boat", "s" + q, rp(sx, sy, big ? 5 * k : 2.2, big ? 13 * k : 5.5, th + (j - .3) * .3), 1));
    }
    /* сушарня риби на березі поряд із причалом */
    if (tier <= 3 && sp2() < .6) {
      const [fx, fy] = at(q + step * .45, d - 7);
      if (wfFree(fx, fy, 3)) B.push(mkb("fishdry", "fd" + q, rp(fx, fy, 7, 3, th + Math.PI / 2), 1));
    }
  }
  /* хвилеріз і маяк: великі порти й будь-яке місто на океані */
  if (tier >= 4 || (ocean && tier >= 2)) {
    const q0 = Rm * .6, d0 = shoreAt(q0), [mx0, my0] = at(q0, d0);
    if (Math.hypot(mx0, my0) < Rat(Math.atan2(my0, mx0)) + 10) {
      const ml = 20 + tier * 3, [cx0, cy0] = at(q0, d0 + ml / 2 - 3), [lx, ly] = at(q0, d0 + ml + 1);
      B.push(mkb("mole", "mole", rp(cx0, cy0, 4, ml, th), 1));
      B.push(mkb("lighthouse", "lh", rp(lx, ly, 5, 5, 0), 1));
    }
  }
  /* за містом: рибальське стійбище на березі й човни */
  const so2 = mk(seed + "fc");
  for (let m = 0, n = 2 + tier; m < n; m++) {
    const q = (so2() - .5) * 2 * (mx + 40), [x, y] = at(q, shoreAt(q) - 7);
    if (Math.hypot(x, y) < Rat(Math.atan2(y, x)) + 12 || !wfFree(x, y, 4)) continue;
    B.push(mkb("fishhut", "fc" + m, rp(x, y, 5, 4, th + Math.PI / 2), 1));
    const [bx, by] = at(q + 4, shoreAt(q) + 6);
    B.push(mkb("boat", "fb" + m, rp(bx, by, 2.2, 5.5, th + so2() - .5), 1));
  }
}
function riverFront() {
  const P = RV.pts, so2 = mk(seed + "rf"), hw = RV.w / 2,
    step = Math.max(2, 7 - tier), inCity = (x, y) => Math.hypot(x, y) < Rat(Math.atan2(y, x)) + 10;
  let mill = tier >= 1 ? 1 : 0, side = 1;
  for (let i = 2; i < P.length - 2; i += step) {
    const dx = P[i + 1][0] - P[i - 1][0], dy = P[i + 1][1] - P[i - 1][1], l = Math.hypot(dx, dy) || 1,
      tx = dx / l, ty = dy / l, an = Math.atan2(ty, tx);
    side = -side;
    const bx = P[i][0] - ty * side * (hw + 1.5), by = P[i][1] + tx * side * (hw + 1.5);
    if (Math.hypot(bx, by) > Rat(Math.atan2(by, bx)) + 70 || so2() < .35) continue;
    if (!wfFree(bx, by, 3)) continue;
    /* рибальський місток-причал, човен, хатина й сітки на березі */
    B.push(mkb("pier", "rp" + i, rp(P[i][0] - ty * side * (hw - 1.5), P[i][1] + tx * side * (hw - 1.5), 2.5, 7, an), 1));
    if (so2() < .6) B.push(mkb("boat", "rb" + i, rp(P[i][0] + tx * 3, P[i][1] + ty * 3, 2, 5, an), 1));
    const hx = bx - ty * side * 9, hy = by + tx * side * 9;
    if (so2() < .55 && wfFree(hx, hy, 4)) B.push(mkb("fishhut", "rh" + i, rp(hx, hy, 5, 4, an), 1));
    /* водяний млин за містом, вище за течією */
    if (mill && !inCity(bx, by)) {
      const mx2 = bx - ty * side * 7, my2 = by + tx * side * 7;
      if (wfFree(mx2, my2, 5)) {
        B.push(mkb("watermill", "wm" + i, rp(mx2, my2, 7, 6, an), 1));
        mill = 0;
      }
    }
  }
}
function waterfront(mx) {
  if (SE) seaFront(mx);
  if (RV) riverFront();
}
