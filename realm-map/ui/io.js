// Збереження й обмін: посилання, JSON параметрів, повний експорт світу, CSV, PNG, імпорт, друк.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  const b64 = s => btoa(unescape(encodeURIComponent(s))), unb64 = s => decodeURIComponent(escape(atob(s)));
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok;
  }
  const slug = () => 'realm-' + String(App.params.seed).replace(/[^\wа-яіїєґ-]+/gi, '_').slice(0, 24);

  App.paramsFromHash = function () {
    try { const m = /[#&]p=([^&]+)/.exec(location.hash); if (m) return R.Serialize.paramsFromJSON(unb64(decodeURIComponent(m[1]))); } catch (e) {}
    return null;
  };
  App.updateHash = function () { try { history.replaceState(null, '', '#p=' + encodeURIComponent(b64(R.Serialize.paramsToJSON(App.params)))); } catch (e) {} };

  App.bindIO = function () {
    U.$('btnLink').addEventListener('click', async () => { App.updateHash(); U.toast(await copyText(location.href) ? 'Посилання скопійовано' : 'Не вдалося скопіювати'); });
    U.$('btnCopyJson').addEventListener('click', async () => U.toast(await copyText(R.Serialize.paramsToJSON(App.params)) ? 'JSON скопійовано' : 'Не вдалося скопіювати'));
    U.$('btnJson').addEventListener('click', () => { download(new Blob([R.Serialize.paramsToJSON(App.params)], { type: 'application/json' }), slug() + '.json'); U.toast('Параметри збережено'); });
    U.$('btnWorld').addEventListener('click', () => { download(new Blob([R.Serialize.worldToJSON(App.world, true)], { type: 'application/json' }), slug() + '-world.json'); U.toast('Світ експортовано'); });
    U.$('btnCsv').addEventListener('click', () => { download(new Blob([R.Serialize.settlementsCSV(App.world)], { type: 'text/csv;charset=utf-8' }), slug() + '-settlements.csv'); U.toast('Таблицю збережено'); });
    U.$('btnPng').addEventListener('click', () => { const cv = App.scene.exportCanvas(Math.min(4096, Math.max(2400, App.world.grid.w * 16))); cv.toBlob(b => { download(b, slug() + '.png'); U.toast('PNG збережено'); }, 'image/png'); });
    U.$('btnPrint').addEventListener('click', () => { App.scene.resize(); App.scene.draw(); window.print(); });
    const file = U.$('fileImport');
    U.$('btnImport').addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const f = file.files[0]; file.value = ''; if (!f) return;
      try { const p = R.Serialize.paramsFromJSON(await f.text()); Object.assign(App.params, p); App.buildWorldPanel(); App.regenNow(); U.toast('Імпортовано: ' + f.name); } catch (e) { U.toast('Не вдалося імпортувати: ' + e.message, 3200); }
    });
  };
})();
