/* Бестіарій, вкладка «Локації»: підземелля, місця інтересу, лігва монстрів та те, що справді згенеровано в поточному світі */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc, PAGE = 30;
  const SUBS = [["dun", "Підземелля", "Типи підземель виміру: де розташовані, розмір, мешканці"], ["poi", "Місця інтересу", "Озера, руїни, храми, табори й інші значні місця"], ["lair", "Лігва", "Лігва та місця відпочинку монстрів за рангом"], ["real", "Згенеровано", "Що справді є в поточному світі на карті"]];
  const POI_TXT = {
    lake: "Дзеркало води серед суші, береги заросли очеретом. Зазвичай поруч водяться риба й птахи.", mountain: "Скельна вершина з голим каменем угорі та снігом на гребені. Видно здалеку.",
    ruins: "Обвалені мури, заросле бур'янами каміння й порожні арки. Колись тут жили люди.", monument: "Високий камінь або обеліск із витертими написами, поставлений невідомо ким.",
    temple: "Невеликий храм чи монастир із дзвіницею, оточений садом і стінами.", mage_tower: "Вузька висока вежа з освітленими вікнами нагорі, навколо неї тихо й дивно пахне озоном.",
    waterfall: "Вода падає зі скелі в димку бризок, поряд мокре каміння й мох.", glade: "Відкрита галявина серед дерев, затишне місце з високою травою та квітами.",
    small_mine: "Чорний лаз у схилі з прогнилою кріпою й іржавими візками, поряд відвал породи.", viewpoint: "Кам'яна площадка над обривом, звідки відкривається далечінь.",
    small_monument: "Низький камінь із вирізаним знаком, біля якого лишають дрібні подарунки.", park: "Доглянуті дерева й стежки, лавки й квітники серед дикої місцевості.",
    bandit_camp: "Намети, багаття й варта в гущавині, поряд витоптана стежка.", treasure: "Заховане в землі чи під каменем, видно лише за ледь помітною позначкою.",
    wild_hamlet: "Кілька хатин на дикому острові, оточені частоколом від звірів.", shrine: "Невелика капличка край дороги зі свічками й стрічками.", hermit: "Низька хатина в глушині, дим із комина і грядка біля порога.",
  };
  const SIZE = { rooms: "кімнат", length: "довжина", levels: "поверхів" };
  const dungeonCard = (d) => {
    const z = d.size || {}, a = d.anchor || {};
    const where = { city: "під містами", settlement: "під селами", poi: "біля місць: " + [].concat(a.poi || []).map((p) => ((window.RealmMap && RealmMap.Data.poi[p]) || {}).name || p).join(", ") }[a.type] || a.type;
    return H.card(d.name, H.chip("небезпека " + d.danger), (d.lore && d.lore.description ? "<p>" + esc(d.lore.description) + "</p>" : "") +
      H.kv("Де", where) + H.kv("Розмір", [z.rooms && z.rooms[0] + "–" + z.rooms[1] + " кімнат", z.levels && z.levels[0] + "–" + z.levels[1] + " пов."].filter(Boolean)) + H.kv("Мешканці", d.inhabitants) + H.kv("Імовірність", Math.round((d.chance || 0) * 100) + "% на місце"));
  };
  Bestiary.tab("places", "Локації", "Довідник підземель, місць інтересу, лігв і того, що справді згенеровано в світі", (c) => {
    const st = H.st("places"), sub = st.sub || "dun", q = (st.q || "").toLowerCase();
    const ids = new Set(c.bio.map((b) => b.id)), bdefs = c.bio.map((b) => b.def);
    let body = "";
    if (sub === "dun") {
      let arr = (c.L.dungeons || []).map((id) => H.by(A.dungeons, id)).filter(Boolean);
      if (q) arr = arr.filter((d) => (d.name + " " + ((d.lore || {}).description || "")).toLowerCase().includes(q));
      const shown = arr.slice(0, PAGE * ((st.page || 0) + 1));
      body = "<p><small>Знайдено: " + arr.length + "</small></p>" + shown.map(dungeonCard).join("") + (arr.length > shown.length ? '<button data-more title="Показати наступні">Показати ще (' + (arr.length - shown.length) + ")</button>" : "");
    } else if (sub === "poi") {
      const P = (window.RealmMap && RealmMap.Data.poi) || {};
      body = Object.keys(P).filter((k) => !q || P[k].name.toLowerCase().includes(q)).map((k) => H.card(P[k].name, H.chip(P[k].cls === "major" ? "значне" : "дрібне") + (P[k].danger ? H.chip("небезпечне") : ""),
        "<p>" + esc(POI_TXT[k] || "") + "</p>" + H.kv("Де буває", (P[k].on || []).length ? P[k].on.map((t) => ({ land: "суходіл", plain: "рівнини", hills: "пагорби", forest: "ліси", mountain: "гори", river: "береги річок" }[t] || t)) : "особливі випадки") + H.kv("Дорога", P[k].cls === "major" ? "мала дорога" : "стежка"), P[k].color)).join("");
    } else if (sub === "lair") {
      const K = A.monsterKinds, Dd = (window.RealmMap && RealmMap.Data) || {};
      body = Object.keys(K).map((k) => H.card(K[k].name, H.chip("ранг " + K[k].rank), "<p>Лігва цього рангу трапляються рідко: що сильніші істоти, то далі вони від людських осель.</p>" +
        H.kv("Не ближче до сіл", K[k].village + " од.") + H.kv("Не ближче до міст", K[k].city + " од.") + H.kv("Вид лігва", Dd.tierNames ? Dd.tierNames[K[k].rank >= 4 ? 3 : K[k].rank === 3 ? 2 : 1] : "") + H.kv("Істот у вимірі", c.mons.filter((m) => m.kind === k).length))).join("");
    } else {
      const s = window.BestiaryScan && BestiaryScan.run();
      const cur = document.querySelector("#worldKind"), same = cur && cur.value === c.world.id;
      if (!s) body = "<p>Карта ще не готова.</p>";
      else {
        const cnt = (arr, f) => { const o = {}; arr.forEach((x) => { const k = f(x); o[k] = (o[k] || 0) + 1; }); return o; };
        const P = (RealmMap && RealmMap.Data.poi) || {}, K = A.monsterKinds;
        const line = (o, name) => Object.keys(o).sort((a, b) => o[b] - o[a]).map((k) => esc(name(k)) + ": <b>" + o[k] + "</b>").join(" · ");
        body = (same ? "" : "<p><small>Показано світ, відкритий на карті зараз («" + esc(cur ? cur.selectedOptions[0].textContent : "") + "»), а не обраний вимір.</small></p>") +
          "<p>Огляд квадрата " + s.size + "×" + s.size + " од. навколо центру світу.</p>" +
          H.sec("Лігва монстрів (" + s.lairs.length + ")", "<p>" + line(cnt(s.lairs, (o) => o.mk), (k) => K[k].name) + "</p>") +
          H.sec("Місця інтересу (" + s.pois.length + ")", "<p>" + line(cnt(s.pois, (o) => o.type), (k) => (P[k] || {}).name || k) + "</p>") +
          H.sec("Підземелля (" + s.dungeons.length + ")", "<p>" + line(cnt(s.dungeons, (o) => o.def.name), (k) => k) + "</p>") +
          H.sec("Найближчі лігва", s.lairs.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y)).slice(0, 12).map((o) => "<p>" + esc(o.name) + " · " + esc((A.biomes.find((b) => b.id === o.biome) || { name: o.biome }).name) + "</p>").join(""));
      }
    }
    return H.sub("places", SUBS) + (sub === "dun" || sub === "poi" ? '<input data-filter="q" placeholder="Пошук…" value="' + esc(st.q || "") + '" title="Пошук за назвою">' : "") + body;
  });
})();
