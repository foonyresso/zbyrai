/* Бестіарій вимірів: вкладка-накладка з описом кожного виміру (лор, біоми, локації, монстри, раси, підземелля) і унікальним описом світу з зерна. Дані з Atlas.*, випадковість з BestiaryGen. Єдина точка підключення: кнопка #btnBestiary у шапці */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s), A = window.Atlas, G = window.BestiaryGen;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const by = (arr, id) => arr.find((x) => x.id === id);
  const KIND = A.monsterKinds || {};
  let root, sel, seedIn, body, text = "";

  function build() {
    root = document.createElement("div");
    root.id = "bestiary"; root.hidden = true;
    root.innerHTML = '<div class="bs-bar"><h2>Бестіарій вимірів</h2>' +
      '<label title="Вимір, який описати">Вимір <select id="bsWorld" title="Вимір, який описати"></select></label>' +
      '<label title="Зерно світу: від нього залежать унікальні описи. Те саме зерно дає той самий опис">Зерно <input id="bsSeed" title="Зерно світу. Підставляється з поточного світу"></label>' +
      '<button id="bsRand" title="Взяти нове випадкове зерно: світ цього виміру матиме інші унікальні описи">Випадкове зерно</button>' +
      '<button id="bsCur" title="Взяти вимір і зерно зі світу, що зараз відкритий на карті">З поточного світу</button>' +
      '<span class="sp"></span>' +
      '<button id="bsCopy" title="Скопіювати весь опис як звичайний текст">Копіювати текст</button>' +
      '<button id="bsSave" title="Зберегти опис як файл .txt">Зберегти .txt</button>' +
      '<button id="bsClose" title="Закрити бестіарій і повернутись до карти">Закрити</button></div>' +
      '<div class="bs-body"><div class="bs-page"><details class="how" open><summary title="Коротка довідка">Що це, для чого, як користуватися</summary>' +
      '<p><b>Що це.</b> Довідник вимірів у стилі бестіарію: лор, біоми, локації, монстри, раси, підземелля.</p>' +
      '<p><b>Для чого.</b> Швидко зрозуміти, чим один вимір відрізняється від іншого, і побачити унікальні риси конкретного світу.</p>' +
      '<p><b>Як користуватися.</b> Обери вимір, зерно задає унікальний опис світу (блок у рамці внизу). «Випадкове зерно» дає інший світ того ж виміру. Збереження й копіювання угорі.</p></details>' +
      '<div id="bsOut"></div></div></div>';
    document.body.append(root);
    sel = $("#bsWorld"); seedIn = $("#bsSeed"); body = $("#bsOut");
    for (const w of A.worlds) { const o = document.createElement("option"); o.value = w.id; o.textContent = w.name; sel.append(o); }
    sel.onchange = render; seedIn.onchange = render;
    $("#bsRand").onclick = () => { seedIn.value = Math.random().toString(36).slice(2, 8); render(); };
    $("#bsCur").onclick = fromCurrent;
    $("#bsClose").onclick = () => { root.hidden = true; };
    $("#bsCopy").onclick = async () => { try { await navigator.clipboard.writeText(text); toast("Скопійовано"); } catch { toast("Не вдалось скопіювати"); } };
    $("#bsSave").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); a.download = "bestiary-" + sel.value + "-" + seedIn.value + ".txt"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) root.hidden = true; });
  }
  function toast(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2000); }
  function fromCurrent() {
    const k = $("#worldKind"), s = $("#seed");
    if (k && by(A.worlds, k.value)) sel.value = k.value;
    seedIn.value = (s && s.value) || Math.random().toString(36).slice(2, 8);
    render();
  }

  const list = (a) => (a || []).map(esc).join(", ");
  function sec(title, items, fn) { return items && items.length ? "<h3>" + esc(title) + "</h3>" + fn(items) : ""; }
  const cards = (arr) => '<div class="bs-list">' + arr.join("") + "</div>";
  const card = (t, sub, color) => '<div class="bs-card"><b>' + (color ? '<span class="bs-sw" style="background:' + esc(color) + '"></span>' : "") + esc(t) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>";
  const plain = (h) => h.replace(/<\/(h[123]|p|div)>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n");

  function render() {
    const w = by(A.worlds, sel.value) || A.worlds[0], L = w.lore || {}, seed = seedIn.value || "0";
    const u = G.make(w, seed);
    const bio = (L.biomes || []).map((b) => { const d = by(A.biomes, b.id) || {}; return { name: b.as_name || d.name || b.id, color: d.color, note: b.note || (d.lore && d.lore.description) || "", id: b.id }; });
    const mons = (ids) => (ids || []).map((id) => by(A.monsters, id)).filter(Boolean);
    const mcard = (m) => card(m.name + (KIND[m.kind] ? " · " + KIND[m.kind].name : ""), m.lore && m.lore.description);
    const creatures = mons(L.creatures), bosses = mons(L.bosses);
    const dng = (L.dungeons || []).map((id) => by(A.dungeons, id)).filter(Boolean);
    const gl = [["Біомів", bio.length], ["Монстрів", creatures.length], ["Босів", bosses.length], ["Підземель", dng.length], ["Локацій", (L.locations || []).length]];
    let h = "<h1>" + esc(w.name) + "</h1><div class=bs-sub>" + esc(L.subtitle || w.description || "") + (L.ref ? " · № " + esc(L.ref) : "") + "</div>";
    if (!w.lore) h += "<p>" + esc(w.description || "Для цього виміру ще немає повного опису.") + "</p>";
    h += '<div class="bs-kv">' + gl.map((x) => "<div>" + x[0] + "<b>" + x[1] + "</b></div>").join("") + "</div>";
    for (const [t, k] of [["Концепт", "concept"], ["Сенс", "meaning"], ["Історія", "history"], ["Будова", "structure"], ["Небо", "sky"], ["Як досліджувати", "exploration"]]) if (L[k]) h += "<h3>" + t + "</h3><p>" + esc(L[k]) + "</p>";
    h += sec("Біоми", bio, (a) => cards(a.map((b) => card(b.name, b.note, b.color))));
    h += sec("Локації та місця", L.locations, (a) => "<p>" + list(a) + "</p>");
    h += sec("Архітектура", L.architecture, (a) => "<p>" + list(a) + "</p>");
    h += sec("Монстри", creatures, (a) => cards(a.map(mcard)));
    h += sec("Боси", bosses, (a) => cards(a.map(mcard)));
    h += sec("Підземелля", dng, (a) => cards(a.map((d) => card(d.name, d.lore && d.lore.description))));
    h += sec("Закони й механіки", L.mechanics, (a) => "<p>" + list(a) + "</p>");
    h += sec("Ресурси", L.resources, (a) => "<p>" + list(a) + "</p>");
    if (L.dangers) h += "<h3>Небезпеки</h3><p>" + esc(L.dangers) + "</p>";
    if (L.visual && L.visual.atmosphere) h += "<h3>Атмосфера</h3><p>" + esc(L.visual.atmosphere) + "</p>";
    const rs = G.sample(G.rng(u.raceSeed), A.races, u.raceCount);
    h += '<div class="bs-unique"><h3 style="border:0">Цей світ: «' + esc(u.name) + ", " + esc(u.epithet.toLowerCase()) + '» · зерно ' + esc(seed) + "</h3>" +
      "<p>Настрій світу " + esc(u.mood) + ". Рівень небезпеки: " + esc(u.dangerLabel) + ". Вік за літописами: " + u.age + " років.</p>" +
      "<p><b>Прикмета.</b> Тут " + esc(u.omen) + ".</p><p><b>Легенда.</b> У цих краях " + esc(u.legend) + ".</p>" +
      '<div class="bs-kv">' + [["Біомів у світі", u.biomes.length + " з " + u.biomeTotal], ["Річок", u.rivers], ["Озер", u.lakes], ["Вершин", u.peaks], ["Руїн", u.ruins], ["Рас", rs.length]].map((x) => "<div>" + x[0] + "<b>" + x[1] + "</b></div>").join("") + "</div>" +
      "<p><b>Біоми:</b> " + list(u.biomes.map((id) => (bio.find((b) => b.id === id) || { name: id }).name)) + ".</p>" +
      "<p><b>Місця:</b> " + list(u.spots) + ".</p>" +
      (u.monsters.length ? "<p><b>Тут водяться:</b> " + list(mons(u.monsters).map((m) => m.name)) + ".</p>" : "") +
      "<p><b>Раси:</b> " + list(rs.map((r) => r.name)) + ".</p></div>";
    body.innerHTML = h;
    text = (w.name + " · зерно " + seed + "\n") + plain(h);
  }

  function open() { if (!root) build(); root.hidden = false; fromCurrent(); }
  const btn = $("#btnBestiary");
  if (btn) btn.addEventListener("click", open);
})();
