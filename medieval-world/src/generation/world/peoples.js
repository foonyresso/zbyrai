/* ---- народи й раси нескінченного світу ----
   Кожна провінція належить одному народу (файли peoples/*.js): його стилістика міст і будівель видна в усіх поселеннях провінції.
   Раси (races/*.js) змішані й живуть разом у кожному поселенні; дуже малі поселення вміщають лише частину рас.
   Усе рахується за хешем (зерно світу, координати провінції чи поселення), тож однакове для того самого зерна. Формат: docs/atlas/people-files.md, race-files.md */
const PPL_RACES_BY_TIER = [3, 5, 9, 99, 99, 99, 99]; /* скільки рас вміщає хутір, село, велике село, а містечка й більші — усі */
function pplWeighted(list, w, u) {
  let t = 0;
  for (const x of list) t += w(x);
  let a = u * t;
  for (const x of list) { a -= w(x); if (a <= 0) return x; }
  return list[list.length - 1];
}
/* прикмети місця провінції (клімат, рельєф, узбережжя), за якими обирається народ */
function pplTags(x, y) {
  const p = tsamp(x, y, 4), t = [p.bk == "snow" ? "cold" : p.bk == "desert" ? "dry" : p.bk == "swamp" ? "wet" : "temperate"];
  if (p.E > .28) t.push("mountain");
  if (p.fo > .45) t.push("forest");
  if (p.mo > .6) t.push("wet");
  if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => tsamp(x + a * 1100, y + b * 1100, 4).E <= 0)) t.push("coast");
  return t;
}
/* народ провінції (pv — столиця провінції) */
function pplOfProv(pv) {
  if (!Atlas.peoples.length) return null; /* реєстр ще вантажиться: не кешуємо */
  if (pv.ppk === WLD.hk && pv.ppn === Atlas.peoples.length) return pv.ppv;
  const tg = pplTags(pv.x, pv.y);
  const u = H2(Math.round(pv.x), Math.round(pv.y), WLD.s + 701);
  pv.ppv = pplWeighted(Atlas.peoples, (p) => 1 + 4 * p.habitat.filter((h) => tg.includes(h)).length + (p.habitat.includes("any") ? 2 : 0), u);
  pv.ppk = WLD.hk;
  pv.ppn = Atlas.peoples.length;
  return pv.ppv;
}
/* народ точки світу: за провінцією найближчого регіону (null у воді) */
function pplAt(x, y) {
  const h = regAt(x, y);
  return h ? pplOfProv(PV(h)) : null;
}
/* народ поселення: кешується на самому поселенні */
function pplOfSettle(v) {
  if (v.pplk === WLD.hk && v.pplv !== undefined && !(v.pplv === null && Atlas.peoples.length)) return v.pplv;
  v.pplk = WLD.hk;
  v.pplv = pplAt(v.x, v.y);
  return v.pplv;
}
/* раси поселення: [{ r, share }] за спаданням частки. Усі раси, крім випадку дуже малих поселень, де вміщається лише частина */
function raceMix(v, ppl) {
  const key = WLD.hk + "|" + Atlas.races.length + "|" + (ppl ? ppl.id : "");
  if (v.rmk === key) return v.rmv;
  const rs = Atlas.races, s = WLD.s, i = v.i || 0, j = v.j || 0, bias = ppl ? ppl.raceBias : {}, tier = Math.min(6, v.tier || 0);
  const wt = (r) => r.weight * (bias[r.id] || 1) * (r.category == "звіролюд" ? (bias.beast || 1) : 1);
  /* відбір без повторень зі шансами за вагою (ключ u^(1/w)): справедливо для довільної кількості рас */
  const keyed = rs.map((r, n) => ({ r, k: Math.pow(Math.max(1e-9, H2(i, j, s + 730 + n)), 1 / wt(r)) })).sort((a, b) => b.k - a.k);
  const take = keyed.slice(0, PPL_RACES_BY_TIER[tier]);
  let t = 0;
  const out = take.map((q, n) => {
    const w = wt(q.r) * (.6 + .8 * H2(i, j, s + 780 + rs.indexOf(q.r)));
    t += w;
    return { r: q.r, share: w };
  });
  for (const o of out) o.share /= t;
  out.sort((a, b) => b.share - a.share);
  v.rmk = key;
  v.rmv = out;
  return out;
}
/* відтінок поселення за складом рас: середнє look.tint, зважене за часткою */
function raceTint(mix) {
  let r = 0, g = 0, b = 0, t = 0;
  for (const o of mix) {
    const c = o.r.look && o.r.look.tint;
    if (!c) continue;
    r += parseInt(c.slice(1, 3), 16) * o.share;
    g += parseInt(c.slice(3, 5), 16) * o.share;
    b += parseInt(c.slice(5, 7), 16) * o.share;
    t += o.share;
  }
  return t ? [r / t, g / t, b / t] : null;
}
const pplPct = (x) => Math.max(1, Math.round(x * 100)) + "%";
/* підказка про народ і раси поселення (рядок для опису) */
function pplInfo(v) {
  const p = pplOfSettle(v);
  if (!p) return "";
  const mix = raceMix(v, p), top = mix.slice(0, 5).map((o) => o.r.name + " " + pplPct(o.share)).join(", ");
  return " · Народ: " + p.name + " (" + p.mindset.split(/[:;]/)[0].toLowerCase() + ")" + " · Раси: " + top + (mix.length > 5 ? " і ще " + (mix.length - 5) : "") + (mix.length < Atlas.races.length ? " (мале поселення вміщає не всіх)" : "");
}
