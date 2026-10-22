/* Бестіарій, вкладка «Біоми»: картки біомів виміру (опис, флора, фауна, ресурси, споруди, небезпеки) і хто в них мешкає. Підвкладки за типом місцевості, пошук */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc, PAGE = 30;
  const GROUPS = [["all", "Усі", "Усі біоми виміру"], ["land", "Суходіл", "Рівнини, ліси, гори й інша суша", ["land"], ["water", "sea", "deep"]], ["water", "Вода", "Моря, озера, болота", ["water", "sea", "fresh", "swamp", "deep"]], ["under", "Підземні", "Печери та глибини", ["underground"]], ["magic", "Дивні", "Фантастичні, кристальні, хмарні та інші незвичайні", ["fantasy", "surreal", "crystal", "cloud", "glow", "exclusive"]]];
  const has = (b, tags) => (b.tags || []).some((t) => tags.includes(t));
  Bestiary.tab("biomes", "Біоми", "Довідник біомів: де вони, що росте, хто мешкає, чим небезпечні", (c) => {
    const st = H.st("biomes"), sub = st.sub || "all", q = (st.q || "").toLowerCase(), g = GROUPS.find((x) => x[0] === sub);
    let arr = c.bio.filter((b) => !g[3] || (has(b.def, g[3])));
    if (q) arr = arr.filter((b) => (b.name + " " + ((b.def.lore || {}).description || "")).toLowerCase().includes(q));
    const shown = arr.slice(0, PAGE * ((st.page || 0) + 1));
    const out = shown.map((b) => {
      const d = b.def, l = d.lore || {};
      const here = c.mons.filter((m) => [].concat(m.spawn.biomes).some((s) => A.matches(d, s)));
      const bosses = here.filter((m) => H.BOSS.includes(m.kind));
      const inner = (l.description || b.note ? "<p>" + esc(l.description || b.note) + "</p>" : "") +
        H.kv("Рослини", l.flora) + H.kv("Тварини", l.fauna) + H.kv("Геологія", l.geology) + H.kv("Ресурси", l.resources) + H.kv("Споруди", l.structures) +
        H.kv("Атмосфера", l.atmosphere) + H.kv("Звуки", l.sounds) + H.kv("Особливості", l.special) + H.kv("Небезпеки", l.hazards) + H.kv("Геймплей", l.gameplay) + H.kv("Різновиди", l.variants) +
        H.kv("Монстри тут", here.slice(0, 12).map((m) => m.name).concat(here.length > 12 ? ["…ще " + (here.length - 12)] : [])) + H.kv("Боси тут", bosses.slice(0, 6).map((m) => m.name)) +
        (b.note && l.description ? H.kv("Нотатка", b.note) : "") + H.kv("Теги", d.tags) +
        (d.move != null ? H.kv("Прохідність", "швидкість руху ×" + d.move + (d.speed ? ", темп " + d.speed : "")) : "");
      return H.card(b.name, H.chip(here.length + " монстр.") , inner || "<p><small>Окремого опису біом ще не має.</small></p>", d.color);
    }).join("");
    return H.sub("biomes", GROUPS) + '<input data-filter="q" placeholder="Пошук біому…" value="' + esc(st.q || "") + '" title="Пошук за назвою й описом біому">' +
      "<p><small>Знайдено: " + arr.length + "</small></p>" + (out || "<p>Нічого не знайдено.</p>") +
      (arr.length > shown.length ? '<button data-more title="Показати наступні біоми">Показати ще (' + (arr.length - shown.length) + ")</button>" : "");
  });
})();
