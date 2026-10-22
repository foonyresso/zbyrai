/* ---- раси нескінченного світу ----
   Народів немає: є лише раси (races/*.js). Раси змішані й живуть разом у кожному поселенні; дуже малі поселення вміщають лише частину рас.
   Усе рахується за хешем (зерно світу, координати поселення), тож однакове для того самого зерна. Формат: docs/atlas/race-files.md */
const RACES_BY_TIER = [3, 5, 9, 99, 99, 99, 99]; /* скільки рас вміщає хутір, село, велике село, а містечка й більші — усі */
/* раси поселення: [{ r, share }] за спаданням частки. Усі раси, крім випадку дуже малих поселень, де вміщається лише частина */
function raceMix(v) {
  const key = WLD.hk + "|" + Atlas.races.length;
  if (v.rmk === key) return v.rmv;
  const rs = Atlas.races, s = WLD.s, i = v.i || 0, j = v.j || 0, tier = Math.min(6, v.tier || 0);
  const wt = (r) => r.weight;
  /* відбір без повторень зі шансами за вагою (ключ u^(1/w)): справедливо для довільної кількості рас */
  const keyed = rs.map((r, n) => ({ r, k: Math.pow(Math.max(1e-9, H2(i, j, s + 730 + n)), 1 / wt(r)) })).sort((a, b) => b.k - a.k);
  const take = keyed.slice(0, RACES_BY_TIER[tier]);
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
const racePct = (x) => Math.max(1, Math.round(x * 100)) + "%";
/* підказка про раси поселення (рядок для опису) */
function raceInfo(v) {
  if (!Atlas.races.length) return "";
  const mix = raceMix(v), top = mix.slice(0, 5).map((o) => o.r.name + " " + racePct(o.share)).join(", ");
  return " · Раси: " + top + (mix.length > 5 ? " і ще " + (mix.length - 5) : "") + (mix.length < Atlas.races.length ? " (мале поселення вміщає не всіх)" : "");
}
