/* Бестіарій: огляд того, що справді згенеровано в поточному світі карти (лігва, місця, підземелля, поселення, раси) у квадраті навколо центру. Лише читає глобальні функції карти, нічого не змінює. Публічне: BestiaryScan.run() → дані або null, якщо карта не готова */
(function () {
  "use strict";
  const R = 24000; /* пів-сторони квадрата огляду, світові одиниці */
  let cache = null, cacheKey = "";
  function run() {
    if (typeof WLD === "undefined" || !WLD || typeof rxMon !== "function") return null;
    const key = WLD.hk || WLD.s;
    if (cache && cacheKey === key) return cache;
    const out = { lairs: [], pois: [], dungeons: [], places: [], mix: {} };
    const A = window.Atlas;
    for (const kind in A.monsterKinds) {
      const c = A.monsterKinds[kind].cell;
      for (let i = Math.floor(-R / c); i <= Math.floor(R / c); i++) for (let j = Math.floor(-R / c); j <= Math.floor(R / c); j++) { const o = rxMon(kind, i, j); if (o) out.lairs.push(o); }
    }
    const pc = typeof RX_PC === "number" ? RX_PC : 1000;
    for (let i = Math.floor(-R / pc); i <= Math.floor(R / pc); i++) for (let j = Math.floor(-R / pc); j <= Math.floor(R / pc); j++) { const o = rxPoi(i, j); if (o) out.pois.push(o); }
    try { dgnEach(-R, -R, R, R, (o) => out.dungeons.push(o)); } catch { /* підземелля недоступні */ }
    try {
      for (const v of vlist(-R, -R, R, R)) {
        const st = typeof rxState === "function" && v.tier < 3 ? rxState(v) : "normal";
        out.places.push({ name: v.name, tier: v.tier, state: st || "normal", x: v.x, y: v.y });
        if (typeof raceMix === "function") for (const m of raceMix(v)) { const o = out.mix[m.r.id] = out.mix[m.r.id] || { race: m.r, places: 0, share: 0 }; o.places++; o.share += m.share; }
      }
    } catch { /* поселення недоступні */ }
    out.size = R * 2;
    cache = out; cacheKey = key;
    return out;
  }
  window.BestiaryScan = { run, rankOf: (tier) => (typeof TIER_RANK !== "undefined" ? TIER_RANK[Math.min(tier, TIER_RANK.length - 1)] : "village") };
})();
