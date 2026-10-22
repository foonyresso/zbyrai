/* Бестіарій, вкладка «Раси»: картки рас (вигляд, вдача, квартал, будівлі, здібності, середовище). Народів немає, лише раси. Підвкладки за категорією */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc;
  const HAB = { any: "будь-де", forest: "ліси", temperate: "помірний пояс", underground: "підземелля", mountain: "гори", plain: "рівнини", hot: "спека", wet: "вологі землі", cold: "холод", dry: "посуха", coast: "узбережжя" };
  Bestiary.tab("races", "Раси", "Довідник рас: вигляд, вдача, де живуть, здібності", (c) => {
    const st = H.st("races"), sub = st.sub || "all", q = (st.q || "").toLowerCase();
    const cats = A.races.map((r) => r.category).filter((v, i, a) => v && a.indexOf(v) === i);
    const subs = [["all", "Усі", "Усі раси"]].concat(cats.map((k) => [k, k[0].toUpperCase() + k.slice(1), "Раси категорії «" + k + "»"]));
    let arr = A.races.filter((r) => sub === "all" || r.category === sub);
    if (q) arr = arr.filter((r) => (r.name + " " + ((r.lore || {}).description || "")).toLowerCase().includes(q));
    const s = window.BestiaryScan && BestiaryScan.run(), mix = s ? s.mix : {};
    const out = arr.map((r) => {
      const l = r.lore || {};
      return H.card(r.name, H.chip(r.category || "") + H.chip(r.size || ""), (l.description ? "<p>" + esc(l.description) + "</p>" : "") + H.kv("Як виглядає", l.appearance) + H.kv("Вдача", l.temperament) +
        H.kv("Квартал", l.quarter) + H.kv("Будівлі", l.buildings) + H.kv("Здібності", l.abilities) + H.kv("Середовище", (r.habitat || []).map((h) => HAB[h] || h)) +
        H.kv("Де живе", Array.isArray(r.worlds) ? r.worlds.map((id) => (A.worldById(id) || { name: id }).name) : "усі виміри (де не заборонено)") +
        H.kv("Поширеність", r.weight >= 6 ? "часта" : r.weight >= 3 ? "помірна" : "рідкісна") + (mix[r.id] ? H.kv("У поточному світі", "живе у " + mix[r.id].places + " поселеннях") : ""), r.look && r.look.tint);
    }).join("");
    return H.sub("races", subs) + '<input data-filter="q" placeholder="Пошук раси…" value="' + esc(st.q || "") + '" title="Пошук за назвою й описом">' + "<p><small>Знайдено: " + arr.length + "</small></p>" + (out || "<p>Нічого не знайдено.</p>");
  });
})();
