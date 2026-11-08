// Перегляд картинки у спливаючому вікні: зум колесом/щипком, перетягування, «Вписати» / 100%, завантаження.
// Кнопка «Редагувати» відкриває редактор (image-edit.js). Використання: SDViewer.open({url, name, onSaved}).
(function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(label, title, fn, cls) { var b = el('button', cls || '', label); b.type = 'button'; b.title = title; b.addEventListener('click', fn); return b; }

  // Вікно із «сценою», яку можна зумити й рухати. Повертає {root, stage, content, setContent(node,w,h), fit(), zoom(f), close()}
  function makeStage(parent) {
    var stage = el('div', 'vstage'), holder = el('div', 'vhold'), S = { x: 0, y: 0, k: 1, w: 1, h: 1 }, pts = {}, pinch = 0, onPan = null;
    stage.appendChild(holder); parent.appendChild(stage);
    function apply() { holder.style.transform = 'translate(' + S.x + 'px,' + S.y + 'px) scale(' + S.k + ')'; if (api.onView) api.onView(S); }
    function fit() { api.userMoved = false; var r = stage.getBoundingClientRect(); S.k = Math.min(r.width / S.w, r.height / S.h, 1) * 0.96; S.x = (r.width - S.w * S.k) / 2; S.y = (r.height - S.h * S.k) / 2; apply(); }
    function zoomAt(f, cx, cy) { api.userMoved = true; var nk = Math.min(16, Math.max(0.05, S.k * f)); f = nk / S.k; S.x = cx - (cx - S.x) * f; S.y = cy - (cy - S.y) * f; S.k = nk; apply(); }
    stage.addEventListener('wheel', function (e) { e.preventDefault(); var r = stage.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    stage.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (api.tool && api.tool.down && Object.keys(pts).length === 1 && api.tool.down(e, toImg(e))) { api.toolActive = true; stage.setPointerCapture(e.pointerId); return; }
      stage.setPointerCapture(e.pointerId); stage.classList.add('drag');
    });
    stage.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      if (api.toolActive && api.tool.move) { api.tool.move(e, toImg(e)); p.x = e.clientX; p.y = e.clientY; return; }
      var ids = Object.keys(pts);
      if (ids.length === 2) {   // щипок двома пальцями
        var a = pts[ids[0]], b = pts[ids[1]]; p.x = e.clientX; p.y = e.clientY;
        var d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { var r = stage.getBoundingClientRect(); zoomAt(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); } pinch = d; return;
      }
      api.userMoved = true; S.x += e.clientX - p.x; S.y += e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; apply();
    });
    function up(e) { delete pts[e.pointerId]; pinch = 0; stage.classList.remove('drag'); if (api.toolActive) { api.toolActive = false; if (api.tool && api.tool.up) api.tool.up(e, toImg(e)); } }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('dblclick', function () { if (!api.tool) fit(); });
    function toImg(e) { var r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left - S.x) / S.k, y: (e.clientY - r.top - S.y) / S.k }; }
    var api = {
      stage: stage, holder: holder, tool: null, toolActive: false, view: S, toImg: toImg,
      set: function (node, w, h, keepView) { holder.textContent = ''; holder.appendChild(node); holder.style.width = w + 'px'; holder.style.height = h + 'px'; S.w = w; S.h = h; if (!keepView) fit(); else apply(); },
      fit: fit, actual: function () { var r = stage.getBoundingClientRect(); S.k = 1; S.x = (r.width - S.w) / 2; S.y = (r.height - S.h) / 2; apply(); },
      zoom: function (f) { var r = stage.getBoundingClientRect(); zoomAt(f, r.width / 2, r.height / 2); },
    };
    new ResizeObserver(function () { if (!api.userMoved) fit(); }).observe(stage);
    return api;
  }

  function open(o) {
    var root = el('div', 'vw'), top = el('div', 'vtop'), body = el('div', 'vbody');
    var title = el('span', 'vtitle', o.name || 'Картинка'), zoomLbl = el('span', 'vzoom', '');
    var img = new Image(), st;
    function close() { document.removeEventListener('keydown', onKey); root.remove(); document.body.classList.remove('vw-open'); }
    function onKey(e) { if (e.key === 'Escape' && !root.querySelector('.ve')) close(); }
    document.addEventListener('keydown', onKey);
    top.appendChild(title);
    top.appendChild(btn('＋', 'Збільшити', function () { st.zoom(1.25); }));
    top.appendChild(btn('－', 'Зменшити', function () { st.zoom(1 / 1.25); }));
    top.appendChild(btn('Вписати', 'Вмістити картинку у вікно (подвійний клік теж)', function () { st.fit(); }));
    top.appendChild(btn('100%', 'Справжній розмір', function () { st.actual(); }));
    top.appendChild(zoomLbl);
    top.appendChild(el('span', 'grow'));
    top.appendChild(btn('✎ Редагувати', 'Відкрити редактор: кадрування, малювання, текст, поворот, корекція, з відміною дій', function () {
      if (!window.SDImageEdit) return; SDImageEdit.open(img, { name: o.name, onSaved: o.onSaved, parent: root });
    }, 'ed-btn'));
    top.appendChild(btn('⭳ Завантажити', 'Зберегти картинку на комп’ютер', function () { var a = document.createElement('a'); a.href = o.url; a.download = o.name || 'sd.webp'; a.click(); }));
    top.appendChild(btn('×', 'Закрити (Esc)', close, 'vx'));
    root.appendChild(top); root.appendChild(body); document.body.appendChild(root); document.body.classList.add('vw-open');
    st = makeStage(body);
    st.onView = function (v) { zoomLbl.textContent = Math.round(v.k * 100) + '%'; };
    img.alt = o.name || ''; img.draggable = false;
    img.onload = function () { st.set(img, img.naturalWidth, img.naturalHeight); };
    img.src = o.url;
    return { close: close };
  }
  window.SDViewer = { open: open, makeStage: makeStage, el: el, btn: btn };
})();
