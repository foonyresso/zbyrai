/* ---- ресурси шахт: яку руду чи камінь дає покинута шахта («Покинута шахта», тип small_mine) ----
   Вибір за місцевістю (гори чи пагорби), плямою біому (вулканічна, кристальна) і хешем шахти; кількість: бідна, звичайна, багата. */
const MINE_RES = {
  iron: { name: "залізо", color: "#8a5a3c" }, copper: { name: "мідь", color: "#c0713f" }, tin: { name: "олово", color: "#a9b4bd" },
  lead: { name: "свинець", color: "#6c7782" }, silver: { name: "срібло", color: "#d8dde2" }, gold: { name: "золото", color: "#e3b93c" },
  coal: { name: "вугілля", color: "#2e2e2e" }, salt: { name: "сіль", color: "#f0efe8" }, stone: { name: "камінь", color: "#9a9486" },
  gems: { name: "самоцвіти", color: "#7a4fc9" }, sulfur: { name: "сірка", color: "#d6c93a" }, obsidian: { name: "обсидіан", color: "#1c1c2a" },
};
const MINE_BY_GROUP = {
  peaks: ["iron", "silver", "gold", "gems", "coal"], mountain: ["iron", "silver", "gold", "coal", "stone", "lead"],
  hills: ["copper", "tin", "lead", "coal", "stone", "salt", "iron"],
};
const MINE_RICH = ["бідна", "звичайна", "багата"];
function mineRes(o) {
  if (o.res) return o.res;
  const g = rxGroup(o.x, o.y), sb = sbAt(o.x, o.y), b = sb && sb.w > .5 ? Atlas.biomes.find((x) => x.id == sb.id) : null;
  let ids = MINE_BY_GROUP[g] || MINE_BY_GROUP.hills;
  if (b && b.tags.includes("volcanic")) ids = ["sulfur", "obsidian", "iron", "coal"];
  else if (b && b.tags.includes("crystal")) ids = ["gems", "silver", "stone"];
  const id = ids[Math.floor(H2(o.i, o.j, WLD.s + 3401) * ids.length)], u = H2(o.i, o.j, WLD.s + 3402);
  return o.res = { id, name: MINE_RES[id].name, color: MINE_RES[id].color, rich: u < .25 ? 0 : u < .8 ? 1 : 2 };
}
