/* Стиль міста за місцевістю: болото, поля, гори, ліс, пустеля, узбережжя, берег річки, берег моря.
   Стиль змінює частоти споруд (ваги множать T[k].w у setup()) і палітру (BIOS[bio]); тип дає v.sty, назву показує підказка. */
const CITY_STYLES = {
  swamp: { name: "болотяне", bio: "swamp", mul: { fishhut: 4, hut: 4, tannery: 2, farm: .2, farmstead: .3, windmill: 0, bath: .3, garden: .5 } },
  fields: { name: "польове", bio: "grass", mul: { farm: 3, farmstead: 3, mill: 2.5, windmill: 3, stable: 2, bakery: 1.5, warehouse: 1.5 } },
  mountain: { name: "гірське", bio: "rock", mul: { mine: 5, smith: 3, weapon: 2, barracks: 1.5, farm: .1, farmstead: .2, windmill: 0, garden: .3, hut: 2 } },
  forest: { name: "лісове", bio: "grass", mul: { sawmill: 5, hut: 4, tannery: 2, weaver: 1.5, farm: .3, windmill: 0 } },
  desert: { name: "пустельне", bio: "desert", mul: { market: 2, inn: 3, stable: 3, warehouse: 3, gmerch: 2, farm: .15, garden: .2, bath: 1.5, sawmill: 0, hut: .3 } },
  coast: { name: "прибережне", bio: "coast", mul: { fishhut: 4, shipyard: 3, warehouse: 2.5, fishdry: 3, tavern: 1.5, inn: 1.5, farm: .4, windmill: 1.5 } },
  riverside: { name: "річкове", bio: "grass", mul: { watermill: 4, mill: 3, fishhut: 3, tannery: 3, weaver: 2, brewery: 2, windmill: .3 } },
  sea: { name: "морське", bio: "coast", mul: { fishhut: 5, shipyard: 5, warehouse: 3, gmerch: 2, tavern: 2, inn: 2, bank: 1.5, farm: .2, windmill: 1 } },
};
/* який стиль у точки поселення v: спершу вода поруч, потім рельєф і біом */
function cityStyleOf(v) {
  if (v.sty !== undefined) return v.sty;
  const p = tsamp(v.x, v.y, 4), r = v.rad * 1.6;
  let wet = 0, sea = 0;
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, -.7], [.7, -.7], [-.7, .7]]) {
    const q = tsamp(v.x + a * r, v.y + b * r, 4);
    if (q.E <= 0) {
      wet++;
      if (!q.lake && seaBody(v.x + a * r, v.y + b * r)) sea++;
    }
  }
  const rb = riverBank(v.x, v.y);
  let k;
  if (sea) k = v.tier >= 2 ? "sea" : "coast";
  else if (wet) k = "coast";
  else if (rb < v.rad * 2.2) k = "riverside";
  else if (p.bk == "swamp") k = "swamp";
  else if (p.bk == "desert") k = "desert";
  else if (p.E > .28) k = "mountain";
  else if (p.fo > .45) k = "forest";
  else k = "fields";
  return v.sty = k;
}
