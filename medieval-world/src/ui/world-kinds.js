/* ---- меню типів світів «Проекту Атлас»: будується з реєстру (Atlas.worlds), кожен світ у власному файлі worlds/<id>/world.js ---- */
(function () {
  const KEY = "atlas_world", $ = (s) => document.querySelector(s);
  const sel = $("#worldKind"), app = $("#app"), box = $("#continent");
  const actions = $(".top-actions"), file = $("#fileImportContinent"), pngBtn = $("#btnPng");
  const base = {};
  for (const id of ["btnImport", "btnLink", "btnCopy", "btnJson", "btnPng"]) base[id] = $("#" + id).title;
  let frame = null, world = null, extra = [], linkWait = false;
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const toast = (m) => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2000); };
  const post = (m) => frame && frame.contentWindow && frame.contentWindow.postMessage(m, "*");
  const byId = (id) => Atlas.worlds.find((w) => w.id === id);
  const isFrame = () => world && world.runner === "iframe";

  function ensureFrame(w, hash) {
    if (frame && frame.dataset.world === w.id) return;
    if (frame) frame.remove();
    frame = document.createElement("iframe");
    frame.title = "Світ «" + w.name + "»";
    frame.dataset.world = w.id;
    frame.setAttribute("allow", "clipboard-write");
    if (!hash && w.preset) hash = encodeURIComponent(b64(JSON.stringify({ format: "zbyrai-realm-map", params: w.preset })));
    frame.src = w.entry + (hash ? "#p=" + hash : "");
    box.append(frame);
  }
  function setWorld(id, hash) {
    world = byId(id) || Atlas.worlds.find((w) => w.default) || Atlas.worlds[0];
    sel.value = world.id;
    app.hidden = isFrame();
    box.hidden = !isFrame();
    extra.forEach((b) => b.remove());
    const src = (world.inherit && byId(world.inherit)) || world;
    extra = isFrame() ? (src.extraActions || []).map((a) => {
      const b = document.createElement("button");
      b.id = "btnX_" + a.id; b.dataset.c = a.id; b.textContent = a.label; b.title = a.title;
      pngBtn.before(b);
      return b;
    }) : [];
    for (const k in base) $("#" + k).title = (isFrame() && src.titles && src.titles[k]) || base[k];
    if (isFrame()) ensureFrame(world, hash);
    else window.dispatchEvent(new Event("resize"));
    try { localStorage.setItem(KEY, world.id); } catch { /* сховище недоступне */ }
  }

  /* у світі-iframe кнопки верхньої панелі працюють із його картою, а не з нескінченним світом */
  actions.addEventListener("click", (e) => {
    if (!isFrame()) return;
    const b = e.target.closest("button");
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const id = b.id;
    if (id === "btnImport") file.click();
    else if (id === "btnLink") { linkWait = true; post({ type: "atlas-link" }); }
    else if (id === "btnCopy") post({ type: "atlas-click", id: "btnCopyJson" });
    else post({ type: "atlas-click", id: b.dataset.c || id });
  }, true);
  file.onchange = async () => {
    const f = file.files[0];
    file.value = "";
    if (f) post({ type: "atlas-import", text: await f.text(), name: f.name });
  };
  window.addEventListener("message", async (e) => {
    if (!frame || e.source !== frame.contentWindow) return;
    const m = e.data || {};
    if (m.type === "atlas-link" && linkWait && typeof m.p === "string") {
      linkWait = false;
      const url = location.href.split("#")[0] + "#w=" + world.id + "&p=" + encodeURIComponent(b64(m.p));
      let ok = false;
      try { await navigator.clipboard.writeText(url); ok = true; } catch { /* не скопійовано */ }
      toast(ok ? "Посилання скопійовано" : "Не вдалося скопіювати");
    }
  });

  Atlas.load().then(() => {
    for (const w of Atlas.worlds) sel.append(new Option(w.name, w.id));
    sel.title = "Тип світу. " + Atlas.worlds.map((w) => "«" + w.name + "»: " + (w.description || "")).join(" ");
    sel.onchange = () => { history.replaceState(null, "", location.pathname + location.search); setWorld(sel.value); };
    const h = /^#w=([\w-]+)(?:&p=(.*))?$/.exec(location.hash);
    if (h) setWorld(h[1], h[2] || "");
    else setWorld(location.hash.length < 3 ? saved() : null);
  }).catch((err) => { console.error(err); toast("Не вдалося завантажити світи: " + err.message); });
})();
