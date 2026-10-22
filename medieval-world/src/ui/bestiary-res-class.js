/* Бестіарій: розбір ресурсів за способом добування (руда, збір, мисливство, реліквії, копання), рідкість і унікальність */
(function () {
  "use strict";
  const CATS = {
    ore: { name: "Руди й камінь", how: "Шахта або кар'єр: добувається киркою в скелі, жилах і печерах.", tool: "кирка" },
    plant: { name: "Рослини й деревина", how: "Збирання або рубка: рубається сокирою чи збирається вручну в біомі.", tool: "сокира / збір" },
    animal: { name: "Здобич з тварин", how: "Мисливство: лишається після вбитих істот, лише з відповідної здобичі.", tool: "полювання" },
    dig: { name: "Земля й глина", how: "Копання: лопатою на берегах, у ґрунті й осадах.", tool: "лопата" },
    relic: { name: "Реліквії й ядра", how: "Особливе: випадає з істот і босів, лежить у скарбах і руїнах виміру; у шахтах не добувається.", tool: "бої й дослідження" },
  };
  const T = [["relic", /ядр|фрагмент|уламк|шестерн|механізм|печатк|заклепк|пластин|тканин|промен|емоц/], ["animal", /хребц|пера|кіст|луск|шкір|пір['’]я|кігт|ікл|рог|клик|панцир|перл|мушл/], ["ore", /руд|кварц|залізо|залізняк|мідь|бронз|сталь|метал|граніт|вапняк|камін|камен|кристал|самоцвіт|гранат|базальт|обсидіан|скло|сіль|золот|срібл|мітріл|бурштин|крейд|кобальт|рухомідь/], ["plant", /дерев|смол|насіння|насінин|шовк|пелюст|трав|гриб|спор|ягід|ягоди|плод|сік|віск|квіт|волокн|пилок|мох|листя|корен|лоз|бамбук|цвіт/], ["dig", /пігмент|мінерал|глин|пісок|піна|пил|ґрунт|мул/]];
  function classify(name) { const n = name.toLowerCase(); for (const [c, re] of T) if (re.test(n)) return c; return "relic"; }
  /* усі ресурси виміру: { name, cat, scope: 'world'|'biome', biomes[], worldsWith } */
  function collect(c) {
    const A = window.Atlas, cnt = {};
    (A.worlds || []).forEach((w) => new Set((w.lore || {}).resources || []).forEach((r) => (cnt[r] = (cnt[r] || 0) + 1)));
    const map = {};
    const add = (n, scope, b) => { const e = map[n] || (map[n] = { name: n, cat: classify(n), scope, biomes: [] }); if (scope === "world") e.scope = "world"; if (b) e.biomes.push(b); };
    (c.L.resources || []).forEach((r) => add(r, "world"));
    c.bio.forEach((b) => [].concat((b.def.lore || {}).resources || []).forEach((r) => add(r, "biome", b.name)));
    return Object.values(map).map((e) => { e.worldsWith = cnt[e.name] || 0; return e; });
  }
  window.BestiaryRes = { CATS, classify, collect };
})();
