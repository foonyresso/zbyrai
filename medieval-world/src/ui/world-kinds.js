/* ---- меню типів світів «Проекту Атлас»: «Нескінченний» (стандарт) і «Материк» (скінченна карта королівств у iframe) ---- */
(function () {
  const KEY = "atlas_world", $ = (s) => document.querySelector(s);
  const sel = $("#worldKind"), app = $("#app"), box = $("#continent"), extra = document.querySelectorAll(".only-continent");
  const actions = $(".top-actions"), file = $("#fileImportContinent");
  let frame = null, mode = "infinite", linkWait = false;
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const toast = (m) => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2000); };
  const post = (m) => frame && frame.contentWindow && frame.contentWindow.postMessage(m, "*");

  const TITLES = {
    btnImport: ["Завантажити збережені налаштування з файлу .json", "Завантажити збережені параметри материка з файлу .json: карта відновиться з тим самим зерном"],
    btnLink: ["Скопіювати посилання, що відновлює це саме місто з усіма налаштуваннями", "Скопіювати посилання, що відкриє цей материк з усіма параметрами"],
    btnCopy: ["Скопіювати налаштування (зерно, планування, біом, шари) як JSON", "Скопіювати параметри материка як JSON (потім вставити через «Імпорт»)"],
    btnJson: ["Завантажити налаштування як файл medieval-world.json", "Завантажити параметри материка як файл .json: за ними карта відновлюється точно"],
    btnPng: ["Зберегти поточний вигляд карти як зображення PNG", "Зберегти всю карту материка як зображення PNG високої роздільності з урахуванням увімкнених шарів"],
  };

  function ensureFrame(hash) {
    if (frame) return;
    frame = document.createElement("iframe");
    frame.title = "Світ «Материк»";
    frame.setAttribute("allow", "clipboard-write");
    frame.src = "worlds/continent/index.html?embed=1" + (hash ? "#p=" + hash : "");
    box.append(frame);
  }
  function setMode(m, hash) {
    mode = m === "continent" ? "continent" : "infinite";
    sel.value = mode;
    app.hidden = mode === "continent";
    box.hidden = mode !== "continent";
    extra.forEach((b) => (b.hidden = mode !== "continent"));
    for (const id in TITLES) $("#" + id).title = TITLES[id][mode === "continent" ? 1 : 0];
    if (mode === "continent") ensureFrame(hash);
    else window.dispatchEvent(new Event("resize"));
    try { localStorage.setItem(KEY, mode); } catch { /* сховище недоступне */ }
  }
  sel.onchange = () => { history.replaceState(null, "", location.pathname + location.search); setMode(sel.value); };

  /* у режимі «Материк» кнопки верхньої панелі працюють з картою материка, а не з нескінченним світом */
  actions.addEventListener("click", (e) => {
    if (mode !== "continent") return;
    const b = e.target.closest("button");
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const id = b.id;
    if (id === "btnImport") file.click();
    else if (id === "btnLink") { linkWait = true; post({ type: "atlas-link" }); }
    else if (id === "btnCopy") post({ type: "atlas-click", id: "btnCopyJson" });
    else if (b.dataset.c) post({ type: "atlas-click", id: b.dataset.c });
    else post({ type: "atlas-click", id });
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
      const url = location.href.split("#")[0] + "#w=continent&p=" + encodeURIComponent(b64(m.p));
      let ok = false;
      try { await navigator.clipboard.writeText(url); ok = true; } catch { /* запасний шлях нижче */ }
      toast(ok ? "Посилання скопійовано" : "Не вдалося скопіювати");
    }
  });

  const h = /^#w=continent(?:&p=(.*))?$/.exec(location.hash);
  if (h) setMode("continent", h[1] || "");
  else setMode(saved() === "continent" && location.hash.length < 3 ? "continent" : "infinite");
})();
