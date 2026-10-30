// Атлас 2.0: інтерфейс. Параметри → генерація → малювання; масштаб/пересування; збереження й обмін зверху; підказка регіону при наведенні.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id);
  const cv = $('map'), ov = $('over'), stage = $('stage'), info = $('info'), IDS = ['seed', 'dimension', 'size', 'provinces', 'regionsPerProvince', 'density', 'rugged', 'riverDensity'];
  let W = null, view = { k: 4, tx: 0, ty: 0 }, shown = { k: 4, tx: 0, ty: 0 }, settle = 0, layers = {}, hover = null, timer = 0, raf = 0;
  document.querySelectorAll('[data-layer]').forEach(e => { layers[e.dataset.layer] = e.checked; });

  const readParams = () => { const p = {}; for (const id of IDS) { const e = $(id); p[id] = e.type === 'number' || e.type === 'range' ? +e.value : e.value; } return p; };
  // вимір задає межі провінцій (основний 2–50, Астракор 50–100) і форму світу (в Астракорі завжди материк)
  function syncDim(setDefault) {
    const ast = $('dimension').value === 'astrakor', pr = $('provinces');
    pr.min = ast ? 50 : 2; pr.max = ast ? 100 : 50; if (setDefault || +pr.value < +pr.min || +pr.value > +pr.max) pr.value = ast ? 64 : 12;
  }
  const writeParams = p => { for (const id of IDS) if (p[id] != null) $(id).value = p[id]; syncDim(false); };
  function fit() { const r = stage.getBoundingClientRect(); cv.width = Math.round(r.width * devicePixelRatio); cv.height = Math.round(r.height * devicePixelRatio); ov.width = cv.width; ov.height = cv.height; }
  function resetView() { const k = Math.min(cv.width / W.w, cv.height / W.h) * 0.96; view = { k, tx: (cv.width - W.w * k) / 2, ty: (cv.height - W.h * k) / 2 }; }
  // повне перемальовування; під час руху лише дешево зсуваємо/масштабуємо вже намальований кадр (CSS), а справжній кадр малюємо, коли рух стих
  function redraw(done) { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!W) return; A.draw.draw(cv, W, view, { layers }); shown = { ...view }; cv.style.transform = ''; A.draw.drawHover(ov, W, view, hover, W && levelNow()); hlKey = infoKey = ''; if (last) hoverAt(last); if (done) done(); }); }
  function moving() {
    if (!W) return;
    const s = view.k / shown.k, q = 1 / devicePixelRatio; cv.style.transform = `translate(${(view.tx - shown.tx * s) * q}px, ${(view.ty - shown.ty * s) * q}px) scale(${s})`;
    A.draw.drawHover(ov, W, view, null, null); hlKey = infoKey = ''; clearTimeout(settle); settle = setTimeout(redraw, 140);
  }
  // смуга завантаження: кроки генерації з відсотками; кожна нова збірка скасовує попередню, яка ще йде
  const load = $('load'), loadBar = $('loadBar'), loadTxt = $('loadTxt'); let buildId = 0;
  const progress = (f, label) => { load.hidden = false; loadBar.style.width = Math.round(f * 100) + '%'; loadTxt.textContent = `${label}… ${Math.round(f * 100)} %`; };
  async function build() {
    const id = ++buildId, p = readParams(), t0 = performance.now();
    const w2 = await A.generateAsync(p, (f, l) => { if (id !== buildId) return false; progress(f * 0.93, l); });
    if (!w2 || id !== buildId) return; W = w2; A.world = W; if (A.TownMap) A.TownMap.reset(); A.getView = () => view; writeParams(W.params); fit(); resetView(); progress(0.95, 'Малюю карту');
    await new Promise(r => setTimeout(r, 0));
    redraw(() => { if (id === buildId) load.hidden = true; });
    const s = W.settlements ? W.settlements.length : 0, land = W.land.reduce((a, v) => a + v, 0);
    $('stats').textContent = `Суша ${Math.round(land * W.params.kmPerCell ** 2).toLocaleString('uk')} км²; провінцій ${W.provinces.length}, регіонів ${W.regions.length}, річок ${W.rivers.length}, озер ${W.lakes.length}${s ? ', поселень ' + s : ''}, локацій ${W.sites ? W.sites.length : 0}.`;
    try { history.replaceState(null, '', '#p=' + btoa(unescape(encodeURIComponent(JSON.stringify(A.Save.paramsToJSON(W.params)))))); } catch (e) { /* не критично */ }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(build, 250); };
  IDS.forEach(id => $(id).addEventListener(id === 'seed' ? 'change' : 'input', later));
  $('dimension').addEventListener('change', () => syncDim(true));
  $('btnRandom').onclick = () => { $('seed').value = A.Rng.randSeed(); build(); };
  document.querySelectorAll('[data-layer]').forEach(e => e.addEventListener('change', () => { layers[e.dataset.layer] = e.checked; redraw(); }));

  // масштаб і пересування
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, f = Math.exp(-e.deltaY * 0.0015), k = Math.min(450, Math.max(0.5, view.k * f)), q = k / view.k; view.tx = mx - (mx - view.tx) * q; view.ty = my - (my - view.ty) * q; view.k = k; moving(); }, { passive: false });
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', e => { const d = drag; drag = null; if (!d || !A.TownMap || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return; hoverAt(e); if (curCt) A.TownMap.click(curCt); else if (curNear) A.TownMap.focus(curNear); else A.TownMap.click(null); }); // клік на місті закріплює подробиці, клік на значку наближає до міста (ui/town.js)
  let last = null, curNear = null, curCt = null;
  cv.addEventListener('pointermove', e => {
    last = e;
    if (drag) { view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; moving(); return; }
    hoverAt(e);
  });
  // наведення: поселення або локація (до 10 px), інакше клітина під курсором; підсвітка регіону/провінції на верхньому шарі, а картка складається з блоків
  // рівень підсвітки від масштабу (довжина лінійки): далеко — провінції, ближче — регіони, зовсім близько — без підсвітки
  const levelNow = () => { const bar = 150 * devicePixelRatio * W.params.kmPerCell / view.k; return bar >= 10 ? 'prov' : bar >= 2 ? 'reg' : null; };
  let hlKey = '', infoKey = '';
  function hoverAt(e) {
    if (!W || !e) return; const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, fx = (mx - view.tx) / view.k, fy = (my - view.ty) / view.k, x = Math.floor(fx), y = Math.floor(fy);
    const inside = x >= 0 && y >= 0 && x < W.w && y < W.h, cell = inside ? y * W.w + x : -1, reg = inside ? W.regW[cell] : -1, level = levelNow(), rad = (10 * devicePixelRatio / view.k) ** 2;
    let near = null, bd = rad; for (const s of layers.places === false ? [] : W.settlements || []) { const d = (s.x + 0.5 - fx) ** 2 + (s.y + 0.5 - fy) ** 2; if (d < bd) { bd = d; near = s; } }
    let site = null; if (!near && layers.sites !== false) { bd = rad; for (const s of W.sites || []) { const d = (s.x + 0.5 - fx) ** 2 + (s.y + 0.5 - fy) ** 2; if (d < bd) { bd = d; site = s; } } }
    let rsn = null; if (!near && !site && W.resources && layers.resources !== false && view.k >= 3.5) { bd = rad; for (const q of W.resources) { const d = (q.x - fx) ** 2 + (q.y - fy) ** 2; if (d < bd) { bd = d; rsn = q; } } }
    const ct = A.TownMap ? A.TownMap.at(W, view, fx, fy) : null; curCt = ct; if (ct) { near = ct.s; site = null; } // у межах видимого міста велике вікно лишається про це місто, а подробиці йдуть у вікно міста
    let lm = null; if (!ct && !near && !site && W.landmarks && layers.sites !== false && view.k >= 2.2) { bd = rad; for (const q of W.landmarks) { const d = (q.x + 0.5 - fx) ** 2 + (q.y + 0.5 - fy) ** 2; if (d < bd) { bd = d; lm = q; } } }
    curNear = ct ? null : near; cv.style.cursor = ct ? '' : near || lm ? 'pointer' : ''; if (A.TownMap) A.TownMap.hover(ct, lm);
    const rid = near && near.region >= 0 ? near.region : reg >= 0 && !(near && near.ruined) ? reg : null, id = rid == null ? null : level === 'prov' ? W.regions[rid].prov : rid, mark = ct ? null : near || site;
    const k1 = level + '|' + id + '|' + (ct && ct.h ? ct.h.kind + (ct.h.o.id == null ? '' : ct.h.o.id) : '') + '|' + (mark ? (near ? 's' : 'l') + mark.id : '');
    if (k1 !== hlKey) { hlKey = k1; hover = id; A.draw.drawHover(ov, W, view, hover, level, mark); }
    const k2 = (near ? near.id : '') + '|' + (site ? site.id : '') + '|' + (rsn ? 'r' + rsn.id : '') + '|' + (inside ? cell : -1);
    if (k2 !== infoKey) { infoKey = k2; showInfo(inside ? cell : -1, rid, near, site, rsn, inside ? [fx, fy] : null); }
  }
  const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const TIER_COL = ['#7bbf6a', '#e6cf4a', '#f0a23c', '#e0642f', '#c0302f', '#8a1f58', '#3c0a4a'];
  // господарство поселення: потреби, власний видобуток і імпорт за добу
  function ecoHtml(s) {
    const e = s.eco; if (!e) return ''; const NM = A.Needs.NAMES, f = v => Math.round(v).toLocaleString('uk');
    const rows = ['food', 'water', 'wood'].map(k => `<tr><td>${NM[k]}</td><td>${f(e.need[k])}</td><td>${f(e.prod[k])}</td><td>${e.imp[k] ? '+' + f(e.imp[k]) : '—'}</td></tr>`).join('');
    const oth = Object.entries(e.other).map(([k, v]) => `${NM[k] || k}: ${f(v)}`).join(', ');
    return `<div class="eco"><b title="За добу: скільки потрібно мешканцям, скільки дають точки ресурсів поселення, скільки доставляють ззовні">Господарство (за добу)</b><table><tr><th></th><th title="Споживання мешканців">Потрібно</th><th title="Видобуток власних точок ресурсів">Своє</th><th title="Нестача, що завозиться">Імпорт</th></tr>${rows}</table>${e.natWater ? '<p class="muted">Воду беруть із річки, озера чи моря поруч.</p>' : ''}${e.via ? `<p class="muted">Нестачу завозять ${e.via === 'port' ? 'морем через порт' : 'дорогою від сусідів'}.</p>` : ''}<p class="muted">Точок ресурсів: ${e.nodes}${oth ? '. Також видобувають: ' + oth : ''}</p></div>`;
  }
  const RN = { capital: 'Столиця провінції', regional: 'Центр регіону', town: 'Місто', village: 'Село', hamlet: 'Хутір' };
  function showInfo(cell, rid, s, site, rsn, at) {
    if (cell < 0 && !s) { info.hidden = true; return; }
    const D = A.Danger, fmt = n => n.toLocaleString('uk'), kmc = W.params.kmPerCell ** 2, K = W.params.kmPerCell, sg = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(1).replace('.', ',');
    const row = (a, b) => `<dt>${a}</dt><dd>${b}</dd>`, blk = (lb, body, title, cls) => `<div class="blk">${title ? `<div class="hd"><span class="lb">${lb}</span><h4${cls ? ' class="' + cls + '"' : ''}>${title}</h4></div>` : `<div class="lb">${lb}</div>`}${body}</div>`;
    const lv = (v, mn, mx) => `${v} <span class="muted">(${mn}–${mx})</span>`;
    const px = at ? at[0] : s ? s.x + 0.5 : cell % W.w + 0.5, py = at ? at[1] : s ? s.y + 0.5 : ((cell / W.w) | 0) + 0.5, i = cell >= 0 ? cell : s.i; // координати й висота — під курсором, а не в центрі поселення
    const g = rid != null ? W.regions[rid] : null, p = g ? W.provinces[g.prov] : null, out = [];
    // 1. провінція
    out.push(blk('Провінція', p ? `<dl>${row('Столиця', esc(W.settlements[p.capital].name))}${row('Рівень (сер.)', lv(p.level, p.levelMin, p.levelMax))}${row('Регіонів · площа', p.regions.length + ' · ' + fmt(Math.round(p.area * kmc)) + ' км²')}${row('Населення', fmt(p.pop))}</dl>` : '', p ? esc(p.name) : W.land[i] ? 'Нічия земля' : 'Нічия вода', p ? '' : 'muted'));
    // 2. регіон
    if (g) out.push(blk('Регіон', `<dl>${row('Головне місто', esc(g.centerName || '—'))}${row('Рівень (сер.)', lv(g.level, g.levelMin, g.levelMax))}${row('Населення · площа', (g.pop ? fmt(g.pop) : '—') + ' · ' + fmt(Math.round(g.area * kmc)) + ' км²')}${row('Місцевість', esc(g.terrain || '—'))}</dl>`, esc(g.name)));
    // 3. координати від нульової точки (центр карти): X на схід, Y на північ
    const dx = (px - W.origin.x) * K, dy = (W.origin.y - py) * K;
    out.push(blk('Координати', `<div class="coord">X ${sg(dx)} · Y ${sg(dy)} км <span class="muted">(від центру ${Math.hypot(dx, dy).toFixed(1).replace('.', ',')})</span></div>`));
    // 4. місцевість у клітині
    const land = W.land[i] && !W.lake[i], terr = []; let bdesc = '';
    if (land) {
      const gn = D.groupName(W, i), h = D.heightM(W, i); terr.push(row('Ландшафт', (D.GROUP_UA[gn] || gn) + ' · ' + fmt(h) + ' м'));
      const bi = A.BIOMES[W.bio[i]], sb = A.SubBiomes && A.SubBiomes.at(W, i), ast = A.Params.isVoid(W.params); // біом: пляма основного світу, особливий біом виміру або базовий
      terr.push(row('Біом', esc(sb ? sb.name : ast && A.Astrakor.RENAME[bi.id] || bi.name))); bdesc = sb ? sb.desc : bi.desc || '';
      if (W.fr) { const f = W.fr[i], wl = A.WALL_FR; terr.push(row('Зона', f < wl ? `Цивілізовані землі · ${Math.round(f / wl * 100)} % шляху до стіни` : '<b style="color:#b3261e">За Великою стіною: землі монстрів</b>')); if (W.root[i]) terr.push(row('Корінь', 'Прохід лише тунелями великих доріг')); }
      const tl = W.tier[i]; terr.push(row('Рівень · небезпека', `${W.level[i]} · <span class="tier" style="background:${TIER_COL[tl]}"></span>${D.TIERS[tl]}`));
      let nd = 1e18, ns = null; for (const q of W.settlements) { if (q.ruined) continue; const d = (q.x - px) ** 2 + (q.y - py) ** 2; if (d < nd) { nd = d; ns = q; } }
      if (ns) terr.push(row('Найближче', `${esc(ns.name)}, ${(Math.sqrt(nd) * K).toFixed(1).replace('.', ',')} км`));
    } else if (W.ocean[i] && A.Params.isVoid(W.params)) { terr.push(row('Місце', 'Космічна безодня за краєм материка: вийти за межу неможливо'));
    } else { const wb = W.waterBodies && W.waterBody[i] >= 0 ? W.waterBodies[W.waterBody[i]] : null; terr.push(row('Водойма', wb ? esc(wb.name) : W.lake[i] ? 'Озеро' : 'Вода'));
      const gw = D.groupName(W, i); if (gw) terr.push(row('Води', D.GROUP_UA[gw] || gw)); const tw = W.tier[i]; terr.push(row('Рівень · небезпека', `${W.level[i]} · <span class="tier" style="background:${TIER_COL[tw]}"></span>${D.TIERS[tw]}`));
      if (wb && wb.kind === 'lake') terr.push(row('Площа озера', fmt(Math.round(wb.cells * kmc * 10) / 10) + ' км²')); else if (wb) terr.push(row('Вид', wb.kind === 'ocean' ? 'Океан' : 'Море')); }
    let enc = ''; if (W.tier[i] > 0 && W.group[i] !== 255) { const E = D.encounter(W, i); enc = `${E.dominant ? `<p class="muted">Переважають: <b>${esc(E.dominant)}</b></p>` : ''}<p class="muted">Водяться: ${E.species.map(q => `${esc(q.name)} (${q.level} р.)`).join(', ')}</p>`; }
    out.push(blk('Місцевість', `<dl>${terr.join('')}</dl>${bdesc ? `<p class="muted">${esc(bdesc)}</p>` : ''}${enc}`));
    // 5. деталі місця під курсором
    if (s) {
      const nobody = s.fate === 'occupied' ? s.monsters.slice(0, 3).map(m => `<div class="mon"><b>${esc(m.name)}</b>${m.count > 1 ? ' × ' + m.count : ''}<small>${m.kind}${m.magic ? ', магічний' : ''} · рівень ${m.level}</small></div>`).join('') : '';
      const body = s.fate ? `<h4>${esc(s.name)}</h4><dl>${row('Тип', RN[s.rank] + (s.fate === 'occupied' ? ' — <b style="color:#b3261e">окуповане ' + (s.occupier === 'bandits' ? 'бандитами' : 'монстрами') + '</b>' : ' — <b>зруйноване</b>'))}${row('Було мешканців', fmt(s.popBefore))}${s.fate === 'occupied' ? row('Рівень загрози', s.level) : ''}${s.order ? row('Володар', esc(s.order.chief)) : ''}</dl>${s.order ? `<p class="muted"><b>Лад орди:</b> ${s.order.laws.map(esc).join(' ')} Населення: ${esc(s.order.caste)}.</p>` : ''}${nobody}`
        : s.ruined ? `<h4>${esc(s.name)}</h4><dl>${row('Тип', 'Руїни ' + (s.rank === 'town' ? 'міста' : s.rank === 'village' ? 'села' : 'хутора'))}${row('Власник', 'нічия земля')}${s.monsters && s.monsters.length ? row('Рівень загрози', s.level + ' · охороняє бос') : ''}</dl>${(s.monsters || []).slice(0, 3).map(m => `<div class="mon"><b>${esc(m.name)}</b>${m.count > 1 ? ' × ' + m.count : ''}<small>${m.kind}${m.magic ? ', магічний' : ''} · рівень ${m.level}</small></div>`).join('')}`
        : s.fortress ? `<h4>${esc(s.name)}</h4><dl>${row('Тип', 'Гігантська фортеця Великої стіни')}${row('Населення · рівень', fmt(s.pop) + ' · ' + s.level)}${row('Небезпека за стіною', `<span class="tier" style="background:${TIER_COL[W.tier[s.i]]}"></span>${D.TIERS[W.tier[s.i]]}`)}</dl><p class="muted">Місто, повністю зосереджене на обороні: лежить із внутрішнього боку стіни, а вздовж стіни тягнуться бастіони, метальні машини, вежі й надбрамні твердині. Через її ворота проходять дороги.</p>`
        : `<h4>${esc(s.name)}</h4><dl>${row('Тип', RN[s.rank] + (s.port ? ', порт' : ''))}${row('Населення · рівень', fmt(s.pop) + ' · ' + s.level)}</dl>${ecoHtml(s)}`;
      out.push(blk('Деталі місця', body));
      const bd0 = curCt && curCt.h && A.Town.describe(curCt.c, curCt.h); if (bd0) out.push(blk('У місті', `<h4>${esc(bd0.title)}</h4><p class="muted">${esc(bd0.sub || '')}</p>${(bd0.rows || []).slice(0, 4).map(r => `<dl>${row(esc(r[0]), esc(r[1]))}</dl>`).join('')}`));
    } else if (rsn) {
      const t = A.ResData.byId[rsn.type], QN = { poor: 'бідне', normal: 'звичайне', rich: 'багате' }, ow = W.settlements[rsn.sid];
      out.push(blk('Деталі місця', `<h4>${esc(rsn.name)}</h4><dl>${row('Що тут', esc(rsn.mat))}${row('Багатство', QN[rsn.q])}${rsn.out.map(o => row(esc(o.item), o.qty + ' / добу')).join('')}${rsn.animals ? row('Тварини', esc(rsn.animals.join(', '))) : ''}${ow ? row('Належить', esc(ow.name)) : ''}${row('Дорога', rsn.road === 'cart' ? 'возовий шлях' : rsn.road ? 'стежка' : '—')}</dl><p class="muted">Джерело невичерпне: добич обмежена лише кількістю за добу.</p>`));
    } else if (site) {
      const mons = site.monsters.slice(0, 3).map(m => `<div class="mon"><b>${esc(m.name)}</b>${m.count > 1 ? ' × ' + m.count : ''}<small>${m.kind}${m.magic ? ', магічний' : ''} · рівень ${m.level}</small></div>`).join('');
      out.push(blk('Деталі місця', `<h4>${esc(site.name)}</h4><dl>${row('Вид', esc(D.CATS[site.cat]))}${row('Рівень · небезпека', `${site.level} · <span class="tier" style="background:${TIER_COL[site.tier]}"></span>${D.TIERS[site.tier]}`)}</dl>${mons || '<p class="muted">Мешканців немає — місце безпечне.</p>'}`));
    }
    info.innerHTML = out.join(''); info.hidden = false;
  }
  A.redraw = redraw; A.redrawOver = () => A.draw.drawHover(ov, W, view, hover, W && levelNow()); A.focusCell = (x, y, k) => { view.k = Math.min(450, k); view.tx = cv.width / 2 - x * view.k; view.ty = cv.height / 2 - y * view.k; redraw(); };
  cv.addEventListener('pointerleave', () => { if (!drag) { if (A.TownMap) A.TownMap.hover(null); curCt = null; info.hidden = true; infoKey = hlKey = ''; hover = null; A.draw.drawHover(ov, W, view, null, null); last = null; } });

  // меню (іконки, панель, довідка «i») веде спільний кіт zb-ui.js; ключ збереження панелі: data-store на #drawer
  // збереження й обмін (верхня панель)
  const toast = m => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); };
  addEventListener('resize', () => { if (W) { fit(); resetView(); redraw(); } });

  const m = /#p=(.+)$/.exec(location.hash);
  $('seed').value = A.Rng.randSeed();
  if (m) { try { writeParams(A.Save.paramsFromJSON(JSON.parse(decodeURIComponent(escape(atob(m[1])))))); } catch (e) { /* ігноруємо зіпсоване посилання */ } }
  build();
})();
