// Режим вбудови в «Проект Атлас» (?embed=1): верхня панель Атласу керує збереженням через postMessage; тут лише приймаємо команди й віддаємо посилання.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  if (!/[?&]embed=1/.test(location.search)) return;
  const CLICK = new Set(['btnCopyJson', 'btnJson', 'btnWorld', 'btnCsv', 'btnPng', 'btnPrint']);
  addEventListener('message', e => {
    if (e.source !== parent) return;
    const m = e.data || {};
    if (m.type === 'atlas-click' && CLICK.has(m.id)) U.$(m.id).click();
    else if (m.type === 'atlas-import' && typeof m.text === 'string') App.importText(m.text, m.name);
    else if (m.type === 'atlas-link') parent.postMessage({ type: 'atlas-link', p: R.Serialize.paramsToJSON(App.params) }, '*');
  });
  parent.postMessage({ type: 'atlas-ready' }, '*');
})();
