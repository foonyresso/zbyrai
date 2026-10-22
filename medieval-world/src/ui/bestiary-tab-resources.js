/* Бестіарій, вкладка «Ресурси»: руди шахт, ресурси біомів виміру та здобич з істот */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc;
  const SUBS = [["ore", "Руди", "Руди й камінь, що дають шахти"], ["bio", "З біомів", "Ресурси, які дають біоми виміру"], ["drop", "Здобич", "Що лишається після істот"]];
  const ORE = { iron: "Темна важка руда, основа зброї й інструменту.", copper: "Червонувата м'яка руда, зелена від окису на зламі.", coal: "Чорний пласт, що горить довго й жарко.", salt: "Білі кристали, що сушать губи; цінна на торгу.", silver: "Світлий блискучий метал із прожилками в скелі.", gold: "Важкі жовті самородки в кварцових жилах.", gems: "Кольорові кристали в порожнинах скелі.", mithril: "Легкий синюватий метал, зрідка трапляється на вершинах." };
  const WH = { any: "будь-де в шахтах", hills: "на пагорбах", mountain: "у горах", peaks: "на вершинах" };
  Bestiary.tab("resources", "Ресурси", "Довідник ресурсів: руди, дари біомів, здобич з істот", (c) => {
    const st = H.st("resources"), sub = st.sub || "ore", D = (window.RealmMap && RealmMap.Data) || {};
    let body = "";
    if (sub === "ore") body = (D.ores || []).map((o) => H.card(o[1], H.chip(o[2] >= 20 ? "поширена" : o[2] >= 8 ? "помірна" : "рідкісна"), "<p>" + esc(ORE[o[0]] || "") + "</p>" + H.kv("Де", WH[o[3]] || o[3]) + H.kv("Вага при випадінні", o[2]))).join("");
    else if (sub === "bio") {
      const map = {};
      c.bio.forEach((b) => { for (const r of [].concat((b.def.lore || {}).resources || [])) (map[r] = map[r] || []).push(b.name); });
      (c.L.resources || []).forEach((r) => { map[r] = map[r] || ["увесь вимір"]; });
      const keys = Object.keys(map).sort((a, b) => a.localeCompare(b, "uk"));
      body = "<p><small>Знайдено: " + keys.length + "</small></p>" + (keys.slice(0, 120).map((k) => H.card(k, "", H.kv("Де", map[k].slice(0, 10).concat(map[k].length > 10 ? ["…ще " + (map[k].length - 10)] : [])))).join("") || "<p>Біоми цього виміру не мають описаних ресурсів; дивись підвкладку «Руди».</p>");
    } else {
      const map = {};
      c.mons.forEach((m) => { for (const d of (m.lore || {}).drops || []) (map[d] = map[d] || []).push(m.name); });
      const keys = Object.keys(map).sort((a, b) => a.localeCompare(b, "uk"));
      body = "<p><small>Знайдено: " + keys.length + "</small></p>" + (keys.slice(0, 120).map((k) => H.card(k, "", H.kv("Дають", map[k].slice(0, 8).concat(map[k].length > 8 ? ["…ще " + (map[k].length - 8)] : [])))).join("") || "<p>Здобич у цього виміру не описана.</p>");
    }
    return H.sub("resources", SUBS) + body;
  });
})();
