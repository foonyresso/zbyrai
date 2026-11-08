// ==UserScript==
// @name         Vheer → Zbyrai (Image to Prompt)
// @namespace    https://zbyrai.pages.dev/
// @version      1.0.0
// @description  Усередині вкладки «Картинка → промпт» на zbyrai.pages.dev: ховає меню vheer.com, перефарбовує під тему Zbyrai, сам натискає Generate і передає готовий промпт у поле промпта.
// @match        https://vheer.com/app/image-to-prompt*
// @run-at       document-start
// @grant        none
// ==/UserScript==
// Працює ЛИШЕ коли сторінка відкрита всередині нашої рамки (window.name === 'zbyrai-i2p'); на самому vheer.com нічого не змінює.
(function () {
  'use strict';
  if (window.name !== 'zbyrai-i2p') return;
  var TARGET = 'https://zbyrai.pages.dev';   // кому передавати промпт (origin нашого сайту)
  var AUTO_GENERATE = true;                  // сам натискати «Generate» після завантаження картинки

  // ---- Вигляд: лише CSS. Темні кольори нашого сайту, без бічної панелі, шапки й банера
  var css = [
    ':root,:root.light,:root.dark{color-scheme:dark;',
    '--background:#0b0b0f;--foreground:#e8e8ee;--card:#111116;--card-foreground:#e8e8ee;--popover:#17171d;--popover-foreground:#e8e8ee;',
    '--muted:#1b1b22;--muted-foreground:#a2a2ae;--border:#2b2b35;--input:#2b2b35;--secondary:#1b1b22;--secondary-foreground:#e8e8ee;',
    '--primary:#c9a766;--primary-foreground:#17120a;--accent:rgba(255,255,255,.08);--accent-foreground:#e8e8ee;--ring:rgba(201,167,102,.5);--radius:.6rem}',
    'html,body{background:#0b0b0f!important}',
    '[data-slot="sidebar-gap"],[data-slot="sidebar-container"],[data-slot="sidebar"],header{display:none!important}',
    '[data-slot="sidebar-inset"],main{margin:0!important;max-width:100%!important}',
    '[data-slot="sidebar-wrapper"]{min-height:0!important}',
    '[data-sonner-toaster],[data-sonner-toast]{display:none!important}',
    'img[src*="Logo"],a[href*="vheer.com/app"]>svg{display:none!important}'
  ].join('');
  // Стилі додаємо через adoptedStyleSheets (React не може їх видалити під час гідратації); якщо браузер не вміє, запасний <style>, який відновлюється
  var sheet = null;
  try { sheet = new CSSStyleSheet(); sheet.replaceSync(css); } catch (e) { sheet = null; }
  function ensureStyle() {
    if (sheet) { if (document.adoptedStyleSheets.indexOf(sheet) < 0) document.adoptedStyleSheets = document.adoptedStyleSheets.concat([sheet]); return; }
    if (!document.getElementById('zbyrai-i2p-style')) { var st = document.createElement('style'); st.id = 'zbyrai-i2p-style'; st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  }
  ensureStyle();

  function post(msg) { try { window.parent.postMessage(Object.assign({ source: 'zbyrai-i2p' }, msg), TARGET); } catch (e) { /* не критично */ } }

  // ---- Допоміжне: банер, авто-Generate, відстеження готового опису
  var last = '', autoDone = false, timer = 0;
  function tick() {
    ensureStyle();
    var close = document.querySelector('button[aria-label*="banner" i]'); if (close) close.click();   // закрити рекламний банер

    // авто-Generate: щойно з'явилась кнопка (картинка завантажена), натискаємо один раз
    var gen = [].slice.call(document.querySelectorAll('button')).filter(function (b) { return /^\s*Generate\s*$/i.test(b.textContent) && !b.disabled; })[0];
    if (AUTO_GENERATE && gen && !autoDone) { autoDone = true; gen.click(); }
    if (!gen && !document.querySelector('img[alt="Uploaded image"]')) autoDone = false;    // картинку видалили — наступна знову авто

    // готовий опис: блок «Generated Caption» → абзац під ним
    var label = [].slice.call(document.querySelectorAll('p')).filter(function (p) { return p.textContent.trim() === 'Generated Caption'; })[0];
    var box = label && (label.closest('div.overflow-y-auto') || label.parentElement.parentElement);
    var p = box && box.querySelector('p.whitespace-pre-wrap');
    var text = p ? p.textContent.trim() : '';
    if (text && text !== last) { last = text; post({ type: 'caption', text: text }); }
    if (!text) last = '';
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(tick, 400); }
  function start() { new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true }); tick(); post({ type: 'ready', version: '1.0.0' }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
