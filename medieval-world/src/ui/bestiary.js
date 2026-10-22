/* Бестіарій вимірів: оболонка накладки (шапка, вкладки, вибір виміру й зерна) і спільні помічники. Вкладки живуть в окремих файлах bestiary-tab-*.js і реєструються через Bestiary.tab(). Єдина точка підключення до сайту: кнопка #btnBestiary */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s), A = window.Atlas, G = window.BestiaryGen;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const by = (arr, id) => arr.find((x) => x.id === id);
  const BOSS = ["boss", "super-boss", "world-boss"];
  const tabs = [], state = {};
  let root, sel, seedIn, body, strip, cur = "world", text = "";

  /* спільні дрібниці для вкладок */
  const H = {
    esc, by, BOSS, list: (a) => (a || []).map(esc).join(", "),
    sec: (t, c) => (c ? "<h4>" + esc(t) + "</h4>" + c : ""),
    kv: (k, v) => (v && (!Array.isArray(v) || v.length) ? "<p><b>" + esc(k) + ":</b> " + (Array.isArray(v) ? v.map(esc).join(", ") : esc(v)) + "</p>" : ""),
    chip: (t, c) => '<span class="bs-chip"' + (c ? ' style="border-color:' + esc(c) + '"' : "") + ">" + esc(t) + "</span>",
    /* картка-згортка: заголовок, мітки, тіло */
    card: (title, chips, inner, color) => '<details class="bs-entry"><summary>' + (color ? '<span class="bs-sw" style="background:' + esc(color) + '"></span>' : "") + "<b>" + esc(title) + "</b> " + (chips || "") + '</summary><div class="bs-entry-body">' + inner + "</div></details>",
    /* підвкладки: ключі [id, назва, підказка], стан запам'ятовується */
    sub: (tab, items) => '<div class="bs-sub-tabs">' + items.map((i) => '<button data-sub="' + i[0] + '" title="' + esc(i[2] || i[1]) + '"' + ((state[tab] || {}).sub || items[0][0]) === i[0] ? ' class="on"' : "" + ">" + esc(i[1]) + "</button>").join("") + "</div>",
    st: (tab) => (state[tab] = state[tab] || {}),
  };
  H.sub = (tab, items) => { const now = H.st(tab).sub || items[0][0]; return '<div class="bs-sub-tabs">' + items.map((i) => '<button data-sub="' + i[0] + '" title="' + esc(i[2] || i[1]) + '"' + (now === i[0] ? ' class="on"' : "") + ">" + esc(i[1]) + "</button>").join("") + "</div>"; };

  /* вимір без повного літопису: біоми, монстри й підземелля з правил генерації */
  function derive(w) {
    const L = Object.assign({}, w.lore || {});
    if (!(L.biomes || []).length) L.biomes = A.resolveBiomes(w).map((x) => ({ id: x.biome.id }));
    const allB = L.biomes.map((b) => by(A.biomes, b.id)).filter(Boolean);
    const hit = (o) => (o.spawn.worlds === "all" || o.spawn.worlds.includes(w.id)) && allB.some((b) => [].concat(o.spawn.biomes).some((x) => A.matches(b, x)));
    const ms = A.monsters.filter(hit);
    if (!(L.creatures || []).length) L.creatures = ms.filter((m) => !BOSS.includes(m.kind)).map((m) => m.id);
    if (!(L.bosses || []).length) L.bosses = ms.filter((m) => BOSS.includes(m.kind)).map((m) => m.id);
    if (!(L.dungeons || []).length) L.dungeons = A.dungeons.filter(hit).map((d) => d.id);
    if (!(L.locations || []).length) L.locations = L.dungeons.map((id) => (by(A.dungeons, id) || {}).name).filter(Boolean);
    L.derived = !w.lore || !w.lore.biomes;
    return L;
  }
  function context() {
    const w = by(A.worlds, sel.value) || A.worlds[0], L = derive(w), seed = seedIn.value || "0";
    const bio = L.biomes.map((b) => { const d = by(A.biomes, b.id) || {}; return { id: b.id, name: b.as_name || d.name || b.id, note: b.note, def: d }; });
    const mons = [].concat(L.creatures, L.bosses).map((id) => by(A.monsters, id)).filter(Boolean);
    return { world: w, L, seed, bio, mons, u: G.make(w, seed), H };
  }

  function build() {
    root = document.createElement("div");
    root.id = "bestiary"; root.hidden = true;
    root.innerHTML = '<div class="bs-bar"><h2>Бестіарій вимірів</h2>' +
      '<label title="Вимір, який описати">Вимір <select id="bsWorld" title="Вимір, який описати"></select></label>' +
      '<label title="Зерно світу: від нього залежать унікальні описи. Те саме зерно дає той самий опис">Зерно <input id="bsSeed" title="Зерно світу. Підставляється з поточного світу"></label>' +
      '<button id="bsRand" title="Взяти нове випадкове зерно: світ цього виміру матиме інші унікальні описи">Випадкове зерно</button>' +
      '<button id="bsCur" title="Взяти вимір і зерно зі світу, що зараз відкритий на карті">З поточного світу</button>' +
      '<span class="sp"></span>' +
      '<button id="bsCopy" title="Скопіювати відкриту вкладку як звичайний текст">Копіювати текст</button>' +
      '<button id="bsSave" title="Зберегти відкриту вкладку як файл .txt">Зберегти .txt</button>' +
      '<button id="bsClose" title="Закрити бестіарій і повернутись до карти">Закрити</button></div>' +
      '<div class="bs-tabs" id="bsTabs"></div>' +
      '<div class="bs-body"><div class="bs-page"><details class="how"><summary title="Коротка довідка">Що це, для чого, як користуватися</summary>' +
      '<p><b>Що це.</b> Довідник усього, що є у вимірі: біоми, монстри, локації та інше. Кожна сутність має картку: хто це, де зустрічається, поведінка, лор.</p>' +
      '<p><b>Для чого.</b> Швидко зрозуміти, чим вимір відрізняється від інших, і знайти потрібну істоту чи місце.</p>' +
      '<p><b>Як користуватися.</b> Обери вимір угорі, потім вкладку й підвкладку. Натисни на картку, щоб розгорнути. Пошук і фільтри над списком. «Огляд» містить унікальний опис світу за зерном.</p></details>' +
      '<div id="bsOut"></div></div></div>';
    document.body.append(root);
    sel = $("#bsWorld"); seedIn = $("#bsSeed"); body = $("#bsOut"); strip = $("#bsTabs");
    for (const w of A.worlds) { const o = document.createElement("option"); o.value = w.id; o.textContent = w.name; sel.append(o); }
    strip.innerHTML = tabs.map((t) => '<button data-tab="' + t.id + '" title="' + esc(t.tip) + '">' + esc(t.title) + "</button>").join("");
    strip.onclick = (e) => { const b = e.target.closest("button"); if (b) { cur = b.dataset.tab; render(); } };
    body.addEventListener("click", (e) => { const b = e.target.closest("[data-sub]"); if (b) { H.st(cur).sub = b.dataset.sub; H.st(cur).page = 0; render(); } const m = e.target.closest("[data-more]"); if (m) { H.st(cur).page = (H.st(cur).page || 0) + 1; render(); } });
    body.addEventListener("input", (e) => { const f = e.target.closest("[data-filter]"); if (f) { H.st(cur)[f.dataset.filter] = f.value; H.st(cur).page = 0; render(f.dataset.filter); } });
    sel.onchange = () => render(); seedIn.onchange = () => render();
    $("#bsRand").onclick = () => { seedIn.value = Math.random().toString(36).slice(2, 8); render(); };
    $("#bsCur").onclick = fromCurrent;
    $("#bsClose").onclick = () => { root.hidden = true; };
    $("#bsCopy").onclick = async () => { try { await navigator.clipboard.writeText(text); toast("Скопійовано"); } catch { toast("Не вдалось скопіювати"); } };
    $("#bsSave").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); a.download = "bestiary-" + sel.value + "-" + cur + ".txt"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) root.hidden = true; });
  }
  function toast(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2000); }
  function fromCurrent() {
    const k = $("#worldKind"), s = $("#seed");
    if (k && by(A.worlds, k.value)) sel.value = k.value;
    seedIn.value = (s && s.value) || Math.random().toString(36).slice(2, 8);
    render();
  }
  const plain = (h) => h.replace(/<\/(h[1-4]|p|div|summary|details)>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n");
  function render(keepFocus) {
    const t = by(tabs, cur) || tabs[0], ctx = context();
    strip.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t.id));
    body.innerHTML = t.render(ctx);
    if (keepFocus) { const f = body.querySelector('[data-filter="' + keepFocus + '"]'); if (f) { f.focus(); f.setSelectionRange && f.setSelectionRange(f.value.length, f.value.length); } }
    text = ctx.world.name + " · " + t.title + " · зерно " + ctx.seed + "\n" + plain(body.innerHTML);
  }
  function open() { if (!root) build(); root.hidden = false; fromCurrent(); }

  window.Bestiary = { tab: (id, title, tip, render) => tabs.push({ id, title, tip, render }), H, open };
  const btn = $("#btnBestiary");
  if (btn) btn.addEventListener("click", open);
})();
