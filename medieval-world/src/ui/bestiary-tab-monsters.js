/* Бестіарій, вкладка «Монстри»: картки створінь і босів виміру (хто це, де зустрічається, поведінка, здібності, здобич). Підвкладки за рангом, фільтр за біомом, пошук */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc, PAGE = 30, K = A.monsterKinds || {};
  const SUBS = [["all", "Усі", "Усі істоти виміру"], ["weak", "Слабкі", "Слабкі створіння біля поселень", ["weak"]], ["monster", "Монстри", "Звичайні монстри та мандрівні духи", ["monster", "other"]], ["mini", "Міні-боси", "Міні-боси", ["mini-boss"]], ["boss", "Боси", "Боси й супербоси", ["boss", "super-boss"]], ["world", "Світові боси", "Найсильніші істоти, раритет", ["world-boss"]]];
  const NAT = { magic: "магічний", threat: "загроза" };
  function where(m, c) {
    const out = [];
    for (const s of [].concat(m.spawn.biomes)) {
      if (s === "all") return ["усі біоми"];
      if (s.startsWith("tag:")) { const names = c.bio.filter((b) => A.matches(b.def, s)).map((b) => b.name); out.push(names.length ? names.slice(0, 4).join(", ") + (names.length > 4 ? "…" : "") : "тип «" + s.slice(4) + "»"); }
      else { const b = c.bio.find((x) => x.id === s); out.push(b ? b.name : (H.by(A.biomes, s) || { name: s }).name); }
    }
    return out;
  }
  Bestiary.tab("monsters", "Монстри", "Довідник істот і босів: де зустрічаються, поведінка, здібності, здобич", (c) => {
    const st = H.st("monsters"), sub = st.sub || "all", q = (st.q || "").toLowerCase(), g = SUBS.find((x) => x[0] === sub), bf = st.biome || "";
    let arr = c.mons.filter((m) => !g[3] || g[3].includes(m.kind));
    if (bf) { const bd = H.by(A.biomes, bf); arr = arr.filter((m) => bd && [].concat(m.spawn.biomes).some((s) => A.matches(bd, s))); }
    if (q) arr = arr.filter((m) => (m.name + " " + ((m.lore || {}).description || "")).toLowerCase().includes(q));
    arr.sort((a, b) => (K[b.kind] ? K[b.kind].rank : 0) - (K[a.kind] ? K[a.kind].rank : 0) || a.name.localeCompare(b.name, "uk"));
    const shown = arr.slice(0, PAGE * ((st.page || 0) + 1));
    const out = shown.map((m) => {
      const l = m.lore || {}, k = K[m.kind] || {};
      const inner = (l.description ? "<p>" + esc(l.description) + "</p>" : "") + H.kv("Де зустрічається", where(m, c)) + H.kv("Поведінка", l.behavior) + H.kv("Здібності", l.abilities) + H.kv("Здобич", l.drops) +
        H.kv("Ранг", k.name) + H.kv("Природа", NAT[m.nature]) + (k.city ? H.kv("Віддаль від людей", "не ближче " + k.village + " од. від сіл, " + k.city + " од. від міст") : "");
      return H.card(m.name, H.chip(k.name || m.kind) + H.chip(NAT[m.nature] || ""), inner);
    }).join("");
    const opts = '<option value="">Усі біоми</option>' + c.bio.map((b) => '<option value="' + esc(b.id) + '"' + (b.id === bf ? " selected" : "") + ">" + esc(b.name) + "</option>").join("");
    return H.sub("monsters", SUBS) + '<input data-filter="q" placeholder="Пошук істоти…" value="' + esc(st.q || "") + '" title="Пошук за назвою й описом">' +
      ' <select data-filter="biome" title="Показати лише істот, що водяться в цьому біомі">' + opts + "</select>" +
      "<p><small>Знайдено: " + arr.length + "</small></p>" + (out || "<p>Нічого не знайдено.</p>") +
      (arr.length > shown.length ? '<button data-more title="Показати наступних істот">Показати ще (' + (arr.length - shown.length) + ")</button>" : "");
  });
})();
