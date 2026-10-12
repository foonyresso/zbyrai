const snap = () => {
  undo.push({ del: new Set(del), add: add.slice(), R: R.slice() });
  if (undo.length > 200) undo.shift();
};
$("#undo").onclick = () => {
  const u = undo.pop();
  if (!u) return;
  del = u.del;
  add = u.add;
  R = u.R;
  rebuild();
};
function pip(p, x, y) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if (
      (p[i][1] > y) != (p[j][1] > y) &&
      x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]
    ) c = !c;
  }
  return c;
}
function hit(x, y) {
  for (let i = L.length - 1; i >= 0; i--) {
    const b = L[i];
    if (Math.hypot(x - b.cx, y - b.cy) <= b.r && pip(b.poly, x, y)) return b;
  }
  return null;
}
const dims = (t) =>
  BIG.has(t) || ["hall", "temple", "market", "cathedral", "estate"].includes(t)
    ? [14, 11]
    : [8, 7];
const free = (x, y) =>
  !L.some((b) => !b.o && Math.hypot(b.cx - x, b.cy - y) < b.r * .8 + 3);
function act(x, y) {
  if (mode === "build") {
    const t = sel.value, [w, h] = dims(t);
    if (
      !free(x, y) || (SE && seaD(x, y) > -2) ||
      (RV && rivD(x, y) < RV.w / 2 + 1)
    ) return;
    snap();
    add.push(
      t == "monument" || t == "fountain" || t == "well"
        ? mkb(t, "m" + Math.random(), rp(x, y, 3, 3, 0))
        : bld(
          t,
          "m" + Math.random(),
          rp(x, y, w, h, Math.atan2(y, x) + 1.5708),
          Math.random,
        ),
    );
    if (Math.hypot(x, y) > Rat(Math.atan2(y, x)) - 6) expand(x, y);
    rebuild();
  } else if (mode === "del") {
    const b = hit(x, y);
    if (b && !b.o) {
      snap();
      add.includes(b) ? add = add.filter((z) => z !== b) : del.add(b.id);
      rebuild();
    }
  }
}
