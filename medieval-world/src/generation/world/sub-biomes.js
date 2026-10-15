/* ---- підбіоми основного світу: плями біомів із biomes/*.js (без тегу exclusive) на суші нескінченного світу ----
   Пляма задає колір місцевості (тайли), а її id додається до біомів точки, тож тут з'являються монстри й підземелля цього біому.
   Рахується з хешу клітини, тому для того самого зерна світ однаковий. Перемикач: RLAY.sb (чіп «Нові біоми»). */
const SB_C = 2600, SB_HOME = 1500;
const SB_BAN = /underground|water|sea|cloud|surreal|exclusive|canopy|shore/;
let sbPool = null;
const sbCell = new Map();
function sbPools() {
  if (sbPool && sbPool.n == Atlas.biomes.length) return sbPool;
  const ok = Atlas.biomes.filter((b) => b.tags.includes("land") && !SB_BAN.test(b.tags.join()));
  const has = (b, ...t) => t.some((x) => b.tags.includes(x));
  sbPool = {
    n: Atlas.biomes.length,
    mountain: ok.filter((b) => has(b, "highland", "mountain", "hills", "canyon")),
    forest: ok.filter((b) => has(b, "forest")),
    swamp: ok.filter((b) => has(b, "swamp")),
    desert: ok.filter((b) => has(b, "hot", "dry") && !has(b, "forest", "swamp")),
    snow: ok.filter((b) => has(b, "cold")),
    grass: ok.filter((b) => has(b, "plain", "temperate", "farmland") && !has(b, "dry", "hot", "cold")),
  };
  sbCell.clear();
  return sbPool;
}
function sbCellInfo(i, j) {
  const k = WLD.s + ":" + i + ":" + j;
  if (sbCell.has(k)) return sbCell.get(k);
  let r = null;
  if (H2(i, j, WLD.s + 3301) < .6) {
    const cx = (i + .3 + H2(i, j, WLD.s + 3302) * .4) * SB_C, cy = (j + .3 + H2(i, j, WLD.s + 3303) * .4) * SB_C;
    const p = tsamp(cx, cy, 4);
    if (p.E > .03 && p.E < .62 && !p.lake && Math.hypot(cx, cy) > SB_HOME) {
      const cls = p.E > .28 ? "mountain" : p.fo > .45 ? "forest" : p.bk == "snow" ? "snow" : p.bk == "desert" ? "desert" : p.bk == "swamp" ? "swamp" : "grass";
      const pool = sbPools()[cls], list = pool.length ? pool : sbPools().grass;
      if (list.length) {
        const b = list[Math.floor(H2(i, j, WLD.s + 3304) * list.length)];
        r = { cx, cy, rad: SB_C * (.2 + .15 * H2(i, j, WLD.s + 3305)), id: b.id, rgb: hx(b.color) };
      }
    }
  }
  sbCell.set(k, r);
  return r;
}
/* пляма в точці: { id, rgb, w } (w 0..1 — наскільки місцевість перефарбована) або null */
function sbAt(x, y) {
  if (!RLAY.sb || !WLD || !Atlas.biomes.length) return null;
  const c = sbCellInfo(Math.floor(x / SB_C), Math.floor(y / SB_C));
  if (!c) return null;
  const q = Math.hypot(x - c.cx, y - c.cy) / c.rad + (fbm(x / 520, y / 520, WLD.s + 3310, 3) - .5) * .55;
  const w = 1 - sst(.5, 1, q);
  return w > .01 ? { id: c.id, rgb: c.rgb, w } : null;
}
