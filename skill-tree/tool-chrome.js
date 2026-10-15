// Спільна «обв'язка» інструмента: кнопка «Інфо» після назви (спливаюче вікно з довідки),
// посилання «назад» повертає на картку цього інструмента на головній.
// Джерело — shared/tool-chrome.js; у папки інструментів копіюється через node tools/sync-theme.mjs.
(function () {
  var folder = (location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '').split('/').pop()) || '';
  var back = document.getElementById('hubBack');
  if (back && folder) back.setAttribute('href', '../index.html#t-' + folder);

  var how = document.querySelector('details.how');
  var brand = document.querySelector('header.top .brand');
  if (!how || !brand) return;
  var grid = how.querySelector('.how-grid');
  if (!grid) return;
  document.documentElement.classList.add('has-info');

  var title = (brand.textContent || '').replace(/\s+/g, ' ').trim();
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'info-btn';
  btn.id = 'btnInfo';
  btn.title = 'Що це, для чого, як користуватися: коротка довідка про інструмент';
  btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.9v.1"/></svg><span>Інфо</span>';
  brand.insertAdjacentElement('afterend', btn);

  var overlay = document.createElement('div');
  overlay.className = 'info-overlay';
  overlay.hidden = true;
  overlay.innerHTML = '<div class="info-modal" role="dialog" aria-modal="true" aria-label="Довідка">' +
    '<button type="button" class="info-close" title="Закрити довідку" aria-label="Закрити">×</button>' +
    '<h2></h2><div class="info-body"></div>' +
    '<button type="button" class="info-ok" title="Закрити довідку">OK</button></div>';
  overlay.querySelector('h2').textContent = title;
  overlay.querySelector('.info-body').appendChild(grid.cloneNode(true));
  document.body.appendChild(overlay);

  function close() { overlay.hidden = true; btn.focus(); }
  btn.addEventListener('click', function () { overlay.hidden = false; overlay.querySelector('.info-ok').focus(); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  overlay.querySelector('.info-close').addEventListener('click', close);
  overlay.querySelector('.info-ok').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
})();
