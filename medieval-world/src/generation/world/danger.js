/* ---- карта небезпеки: чим більше й сильніше монстрів поруч і чим далі від поселень, тим вища небезпека (0..1) ----
   Внесок монстра: rank^1.4 за лінійним спадом до радіуса 500 + 350*rank. Кеш за клітинками у WLD.dn (скидається зі зміною біомів). */
const DN_BASE = 250;
function dangerAt(x, y) {
  let s = 0;
  for (const kind in Atlas.monsterKinds) {
    const K = Atlas.monsterKinds[kind], R = 500 + 350 * K.rank, c = K.cell;
    for (let i = Math.floor((x - R) / c); i <= Math.floor((x + R) / c); i++) {
      for (let j = Math.floor((y - R) / c); j <= Math.floor((y + R) / c); j++) {
        const o = rxMon(kind, i, j);
        if (!o) continue;
        const d = Math.hypot(o.x - x, o.y - y);
        if (d < R) s += Math.pow(K.rank, 1.4) * (1 - d / R);
      }
    }
  }
  let nd = 4000;
  for (const v of vlist(x - 3000, y - 3000, x + 3000, y + 3000)) nd = Math.min(nd, Math.hypot(v.x - x, v.y - y) - v.rad);
  s += Math.max(0, nd - 1200) / 2800 * 1.2;
  return 1 - Math.exp(-s / 2.5);
}
/* значення клітинки cs×cs: число 0..1, -1 (вода) або undefined (ще не пораховано) */
function dangerCell(cs, i, j) {
  const m = WLD.dn || (WLD.dn = new Map()), k = cs + ":" + i + ":" + j;
  if (m.has(k)) return m.get(k);
  if (!tick()) { WPEND = true; return undefined; }
  const x = (i + .5) * cs, y = (j + .5) * cs;
  const v = tsamp(x, y, 4).E < -.01 ? -1 : dangerAt(x, y);
  m.set(k, v);
  return v;
}
