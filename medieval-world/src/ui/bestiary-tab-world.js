/* Бестіарій, вкладка «Огляд»: лор виміру, лічильники та унікальний опис світу з зерна */
(function () {
  "use strict";
  const A = window.Atlas, G = window.BestiaryGen, H = Bestiary.H, esc = H.esc;
  const cards = (arr) => '<div class="bs-list">' + arr.join("") + "</div>";
  const card = (t, sub) => '<div class="bs-card"><b>' + esc(t) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>";
  Bestiary.tab("world", "Огляд", "Лор виміру, лічильники та унікальний опис світу за зерном", (c) => {
    const { world: w, L, u, seed } = c;
    const dng = (L.dungeons || []).map((id) => H.by(A.dungeons, id)).filter(Boolean);
    const gl = [["Біомів", c.bio.length], ["Монстрів", c.mons.filter((m) => !H.BOSS.includes(m.kind)).length], ["Босів", c.mons.filter((m) => H.BOSS.includes(m.kind)).length], ["Підземель", dng.length], ["Локацій", (L.locations || []).length]];
    let h = "<h1>" + esc(w.name) + "</h1><div class=bs-sub>" + esc(L.subtitle || w.description || "") + (L.ref ? " · № " + esc(L.ref) : "") + "</div>";
    if (L.derived) h += "<p><small>Повного літопису цього виміру ще немає: біоми, монстри й підземелля зібрано з правил його генерації.</small></p>";
    h += '<div class="bs-kv">' + gl.map((x) => "<div>" + x[0] + "<b>" + x[1] + "</b></div>").join("") + "</div>";
    for (const [t, k] of [["Концепт", "concept"], ["Сенс", "meaning"], ["Історія", "history"], ["Будова", "structure"], ["Небо", "sky"], ["Як досліджувати", "exploration"]]) if (L[k]) h += "<h3>" + t + "</h3><p>" + esc(L[k]) + "</p>";
    if (L.locations && L.locations.length) h += "<h3>Локації та місця</h3><p>" + H.list(L.locations) + "</p>";
    if (L.architecture) h += "<h3>Архітектура</h3><p>" + H.list(L.architecture) + "</p>";
    if (L.mechanics) h += "<h3>Закони й механіки</h3><p>" + H.list(L.mechanics) + "</p>";
    if (L.resources) h += "<h3>Ресурси</h3><p>" + H.list(L.resources) + "</p>";
    if (L.dangers) h += "<h3>Небезпеки</h3><p>" + esc(L.dangers) + "</p>";
    if (L.visual && L.visual.atmosphere) h += "<h3>Атмосфера</h3><p>" + esc(L.visual.atmosphere) + "</p>";
    const rs = G.sample(G.rng(u.raceSeed), A.races, u.raceCount);
    const bn = (id) => (c.bio.find((b) => b.id === id) || { name: id }).name;
    h += '<div class="bs-unique"><h3 style="border:0">Цей світ: «' + esc(u.name) + ", " + esc(u.epithet.toLowerCase()) + '» · зерно ' + esc(seed) + "</h3>" +
      "<p>Настрій світу " + esc(u.mood) + ". Рівень небезпеки: " + esc(u.dangerLabel) + ". Вік за літописами: " + u.age + " років.</p>" +
      "<p><b>Прикмета.</b> Тут " + esc(u.omen) + ".</p><p><b>Легенда.</b> У цих краях " + esc(u.legend) + ".</p>" +
      '<div class="bs-kv">' + [["Біомів у світі", u.biomes.length + " з " + u.biomeTotal], ["Річок", u.rivers], ["Озер", u.lakes], ["Вершин", u.peaks], ["Руїн", u.ruins], ["Рас", rs.length]].map((x) => "<div>" + x[0] + "<b>" + x[1] + "</b></div>").join("") + "</div>" +
      "<p><b>Біоми:</b> " + H.list(u.biomes.map(bn)) + ".</p><p><b>Місця:</b> " + H.list(u.spots) + ".</p>" +
      (u.monsters.length ? "<p><b>Тут водяться:</b> " + H.list(u.monsters.map((id) => (H.by(A.monsters, id) || { name: id }).name)) + ".</p>" : "") +
      "<p><b>Раси:</b> " + H.list(rs.map((r) => r.name)) + ".</p></div>";
    return h;
  });
})();
