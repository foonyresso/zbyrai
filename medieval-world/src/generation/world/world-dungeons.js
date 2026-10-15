/* ---- підземелля як локації світу (нескінченний світ) ----
   Тут немає кімнат: лише позначка, тип, мешканці й приблизні розміри (кімнати, довжина ходів, площа, рівні).
   Підземелля не стоїть де попало: воно прив'язане до місця, куди й так ведуть дороги чи стежки: під містом, у селі чи хуторі
   (найчастіше зруйнованому, покинутому, захопленому), у місці інтересу (руїни, храм, вежа мага, шахта, гора, пам'ятник, табір).
   Типи — файли dungeons/*.js (Atlas.dungeons); позиція й вибір за хешем клітинки, тож однакові для того самого зерна. Формат: docs/atlas/dungeon-files.md */
const DG_SEED = { city: 1101, settlement: 1111, poi: 1121 };
const DG_NATURE = { 1: "слабка небезпека", 2: "небезпечне", 3: "дуже небезпечне", 4: "смертельне", 5: "для найсильніших" };
/* підземелля прив'язки a (місто, поселення чи місце інтересу) або null; ctx — що знає тип про прив'язку: tier, state, poi */
function dgnMake(type, a, ctx) {
  if (!Atlas.dungeons.length) return null; /* реєстр ще вантажиться: не кешуємо */
  const m = rx().d;
  if (m.has(a.id)) return m.get(a.id);
  const s = WLD.s, sd = DG_SEED[type], u = (k) => H2(a.i, a.j, s + sd + k);
  let o = null;
  const info = rxBiomesAt(a.x, a.y), list = Atlas.dungeonsFor(Object.assign({ type }, ctx), info.biomes, "infinite");
  if (list.length) {
    const d = rxPick(list, u(0));
    if (u(1) < d.chance) {
      const z = d.size, q = u(2), lerp = (r, t) => Math.round(r[0] + (r[1] - r[0]) * t);
      const off = type == "city" ? [-a.rad * .7, a.rad * .7] : type == "settlement" ? [-a.rad - 22, a.rad + 22] : [-70, 70];
      o = {
        id: "D" + a.id, x: a.x + off[0], y: a.y + off[1], dg: d.id, def: d, type, parent: a.name, state: ctx.state || null,
        rooms: lerp(z.rooms, q), length: lerp(z.length, Math.min(1, Math.max(0, q + (u(3) - .5) * .4))), area: lerp(z.area, Math.min(1, Math.max(0, q + (u(4) - .5) * .4))), levels: lerp(z.levels, u(5)),
        name: d.name + " · " + a.name,
      };
    }
  }
  m.set(a.id, o);
  return o;
}
/* усі підземелля в прямокутнику світу */
function dgnEach(x0, y0, x1, y1, fn) {
  for (const v of vlist(x0 - 300, y0 - 300, x1 + 300, y1 + 300)) {
    const o = v.tier >= 3 ? dgnMake("city", v, { tier: v.tier }) : dgnMake("settlement", v, { tier: v.tier, state: rxState(v) });
    if (o) fn(o);
  }
  for (let i = Math.floor((x0 - 200) / RX_PC); i <= Math.floor((x1 + 200) / RX_PC); i++) {
    for (let j = Math.floor((y0 - 200) / RX_PC); j <= Math.floor((y1 + 200) / RX_PC); j++) {
      const p = rxPoi(i, j);
      if (!p) continue;
      const o = dgnMake("poi", p, { poi: p.type });
      if (o) fn(o);
    }
  }
}
/* підказка про підземелля */
function dgnInfo(o) {
  const d = o.def, nm = (n) => n.toLocaleString("uk-UA");
  return {
    n: o.name, c: "Підземелля",
    d: DG_NATURE[d.danger] + " · мешканці: " + d.inhabitants.join(", ") + ". Орієнтовно: кімнат " + o.rooms + ", ходи ≈ " + nm(o.length) + " м, площа ≈ " + nm(o.area) + " м², рівнів " + o.levels +
      (o.state && o.state != "normal" ? " · поселення " + RX_STATE_NAMES[o.state] : "") + ". " + d.lore.description,
  };
}
