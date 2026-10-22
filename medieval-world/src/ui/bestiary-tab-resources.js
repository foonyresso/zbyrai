/* Бестіарій, вкладка «Ресурси»: руди шахт, ресурси біомів виміру та здобич з істот */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc;
  const R = window.BestiaryRes;
  const SUBS = [["ore", "Руди й камінь", "Шахта, кирка: руди й камінь"], ["plant", "Рослини", "Збирання й рубка: дерево, смоли, насіння"], ["animal", "Здобич", "Мисливство: що лишається з тварин"], ["dig", "Земля", "Копання: глина, пісок"], ["relic", "Реліквії", "Ядра й уламки з істот, скарбів і руїн"], ["base", "Базові руди", "Стандартні руди шахт, спільні для всіх вимірів"]];
  const ORE = { iron: "Темна важка руда, основа зброї й інструменту.", copper: "Червонувата м'яка руда, зелена від окису на зламі.", coal: "Чорний пласт, що горить довго й жарко.", salt: "Білі кристали, що сушать губи; цінна на торгу.", silver: "Світлий блискучий метал із прожилками в скелі.", gold: "Важкі жовті самородки в кварцових жилах.", gems: "Кольорові кристали в порожнинах скелі.", mithril: "Легкий синюватий метал, зрідка трапляється на вершинах." };
  const WH = { any: "будь-де в шахтах", hills: "на пагорбах", mountain: "у горах", peaks: "на вершинах" };
  Bestiary.tab("resources", "Ресурси", "Довідник ресурсів виміру: де і як добувати", (c) => {
    const card = (e) => {
      const uniq = e.worldsWith <= 1, wide = e.scope === "world", n = e.biomes.length;
      const rare = wide && uniq ? "рідкісний, лише в цьому вимірі" : uniq ? "помірний" : e.worldsWith > 4 ? "поширений" : "помірний";
      return H.card(e.name, H.chip(uniq ? "унікальний" : "в " + e.worldsWith + " вимірах") + H.chip(rare), H.kv("Добування", R.CATS[e.cat].how) + H.kv("Інструмент", R.CATS[e.cat].tool) + H.kv("Де", wide ? "увесь вимір" + (n ? ", найбільше: " : "") : "") + H.kv("Біоми", e.biomes.slice(0, 10).concat(n > 10 ? ["…ще " + (n - 10)] : [])));
    };
    const st = H.st("resources"), sub = st.sub || "ore", D = (window.RealmMap && RealmMap.Data) || {};
    let body = "";
    if (sub === "base") body = "<p><small>Спільні для всіх вимірів. Добування: шахта, кирка.</small></p>" + (D.ores || []).map((o) => H.card(o[1], H.chip(o[2] >= 20 ? "поширена" : o[2] >= 8 ? "помірна" : "рідкісна"), "<p>" + esc(ORE[o[0]] || "") + "</p>" + H.kv("Добування", "шахта, кирка") + H.kv("Де", WH[o[3]] || o[3]) + H.kv("Вага при випадінні", o[2]))).join("");
    else if (sub === "animal") {
      const drops = {};
      c.mons.forEach((m) => { for (const d of (m.lore || {}).drops || []) (drops[d] = drops[d] || []).push(m.name); });
      const own = R.collect(c).filter((e) => e.cat === "animal"), keys = Object.keys(drops).sort((a, b) => a.localeCompare(b, "uk"));
      body = "<p><small>" + esc(R.CATS.animal.how) + "</small></p>" + own.map((e) => card(e)).join("") + keys.slice(0, 120).map((k) => H.card(k, H.chip(drops[k].length > 3 ? "поширена" : "рідкісна"), H.kv("Добування", "мисливство") + H.kv("Дають", drops[k].slice(0, 8).concat(drops[k].length > 8 ? ["…ще " + (drops[k].length - 8)] : [])))).join("");
      if (!own.length && !keys.length) body += "<p>Здобич у цього виміру не описана.</p>";
    } else {
      const list = R.collect(c).filter((e) => e.cat === sub).sort((a, b) => a.worldsWith - b.worldsWith || a.name.localeCompare(b.name, "uk"));
      body = "<p><small>" + esc(R.CATS[sub].how) + " Знайдено: " + list.length + "</small></p>" + (list.map(card).join("") || "<p>У цього виміру тут нічого немає; дивись інші підвкладки.</p>");
    }
    return H.sub("resources", SUBS) + body;
  });
})();
