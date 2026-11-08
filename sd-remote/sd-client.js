// Клієнтська логіка «Віддаленого SD» без DOM: розмір запиту, підпис черги, захист імен. Тести: test/sd-client.test.js
(function (root) {
  var SIZES = [[512, 512], [768, 512], [512, 768], [768, 768], [1024, 1024], [1024, 768], [768, 1024]];
  function queueText(st) {
    if (!st) return '';
    if (st.status === 'queued') return 'У черзі: ' + st.position;
    if (st.status === 'running') return 'Генерується на ПК…';
    if (st.status === 'done') return 'Готово';
    return st.error || 'Помилка';
  }
  function pcText(ping) {
    if (!ping) return { cls: '', text: 'ПК: немає зв’язку' };
    if (!ping.online) return { cls: 'off', text: 'ПК вимкнений' + (ping.queue ? ' · черга ' + ping.queue : '') };
    return { cls: 'on', text: 'ПК увімкнений' + (ping.queue ? ' · черга ' + ping.queue : '') };
  }
  function fileName(prompt, seed, ext) {
    var s = String(prompt || 'sd').toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'sd';
    return s + (seed != null && seed >= 0 ? '-' + seed : '') + '.' + (ext || 'webp');
  }
  var api = { SIZES: SIZES, queueText: queueText, pcText: pcText, fileName: fileName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDClient = api;
})(typeof window !== 'undefined' ? window : globalThis);
