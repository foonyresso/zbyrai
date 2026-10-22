/* ---- стежки до лігв і місць інтересу: від найближчого поселення (до OT_MAX) до об'єкта; кеш у WLD.lg ----
   Значні місця (cls major) — мала дорога, дрібні місця й лігва — стежка. Боси живуть далеко від людей: без стежок. */
const OT_MAX = 2200;
const OT_BIG = new Set(["ruins", "temple", "mage_tower"]);
/* великі місця — середня дорога, значні — мала, дрібні (краєвиди, квестові місця, табори бандитів, шахти) і лігва — стежка */
function otClass(o) { return o.type ? (OT_BIG.has(o.type) ? "medium" : o.cls == "major" ? "minor" : "trail") : "trail"; }
function otFrom(o) {
  const c = otClass(o), L = vlist(o.x - OT_MAX - 400, o.y - OT_MAX - 400, o.x + OT_MAX + 400, o.y + OT_MAX + 400);
  /* шукаємо поселення потрібного рангу, а якщо його немає поблизу — будь-яке */
  for (const mt of [c == "medium" ? 3 : c == "minor" ? 1 : 0, 0]) {
    let best = null, bd = OT_MAX;
    for (const v of L) {
      const d = Math.hypot(v.x - o.x, v.y - o.y);
      if (d > 60 && d < bd && v.tier >= mt) { bd = d; best = v; }
    }
    if (best) return best;
  }
  return null;
}
/* шлях від найближчого поселення до об'єкта: масив точок, null (немає) або undefined (ще не пораховано) */
function otTrail(o) {
  if (!o.type && (o.kind == "boss" || o.tier >= 3)) return null;
  const key = "o" + o.id, m = WLD.lg;
  if (m.has(key)) return m.get(key);
  if (!tick()) { WPEND = true; return undefined; }
  const v = otFrom(o);
  const g = v ? roadPath([v.x, v.y], [o.x, o.y], H2(v.i, v.j, WLD.s + 64)) : null;
  m.set(key, g);
  return g;
}
