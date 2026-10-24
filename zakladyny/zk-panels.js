/* Закладини: HTML меню й карток (панель будівництва знизу, ресурси зверху, люди, торгівля, картка вибору). Лише рядки; події вішає app.js (data-act). */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech, B = M.Building, S = M.Settlers, T = M.Trade, TD = M.TradeData, CC = ColonistCore, I = Z.Icons;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const costTxt = c => Object.keys(c).filter(k => c[k]).map(k => (k === 'gold' ? '🪙' : TD.RES[k].icon) + c[k]).join(' ');
  const btn = (act, label, attrs = '', title = '') => `<button data-act="${act}" ${attrs} title="${esc(title)}">${label}</button>`;
  const RANK = { capital: 'Столиця', regional: 'Центр регіону', town: 'Місто', village: 'Село', hamlet: 'Хутір' };

  function hud(G, speed) {
    const st = G.s.stock, cap = B.storageCap(G.s.town), food = (st.grain || 0) + (st.fish || 0), p = G.s.settlers.residents.length;
    const sp = (id, ico, t, v) => `<button data-act="speed:${v}" class="${speed === v ? 'on' : ''}" title="${t}">${ico}</button>`;
    return `<span class="chip gold" title="Золото: на будівництво, дороги й караван"><span>🪙</span><b>${Math.floor(st.gold)}</b></span>` +
      TD.IDS.map(r => `<span class="chip" title="${TD.RES[r].name}. Склад вміщує ${cap} кожного ресурсу"><span>${TD.RES[r].icon}</span><b>${Math.floor(st[r] || 0)}</b><i>/${cap}</i></span>`).join('') +
      `<span class="chip ${food < p * 3 ? 'low' : ''}" title="Їжа (зерно й риба): кожен мешканець їсть 1 за добу"><span>🍞</span><b>${Math.floor(food)}</b></span><span class="chip" title="Мешканців / місць у житлі"><span>👥</span><b>${p}</b><i>/${B.housing(G.s.town)}</i></span><span class="sep"></span>` +
      `<span class="time">${sp('p', '⏸', 'Пауза (Пробіл)', 0)}${sp('1', '▶', 'Звичайна швидкість', 1)}${sp('2', '▶▶', 'Удвічі швидше', 2)}${sp('4', '▶▶▶', 'Вчетверо швидше', 4)}</span><span class="day" title="Скільки діб минуло від закладин">Доба ${G.s.day}</span>`;
  }

  function bar(G, ui) {
    const st = G.s.stock, tool = (id, t, label) => `<button data-act="tool:${id}" class="${ui.tool === id ? 'on' : ''}" title="${esc(t)}">${I.svg(id)}${label}</button>`;
    return `<div class="hint" id="barHint">${esc(ui.hint || 'Оберіть будівлю й клікніть на карті біля доріг свого поселення')}</div><div class="row">` +
      tool('select', 'Огляд: клік по будівлі, людині чи поселенню показує картку (Esc)', 'Огляд') + tool('demolish', 'Знесення: клік по будівлі прибирає її й повертає половину вартості; дороги, що стали зайвими, зникають', 'Знести') + '<span class="gap"></span>' +
      B.ORDER.map(t => { const T0 = B.TYPES[t], can = B.canPay(st, T0.cost); return `<button data-act="tool:build:${t}" class="${ui.tool === 'build:' + t ? 'on' : ''} ${can ? '' : 'cant'}" title="${esc(T0.name + '. ' + T0.desc + (T0.jobs ? ' Робочих місць: ' + T0.jobs + '.' : '') + (T0.house ? ' Місць проживання: ' + T0.house + '.' : '') + ' Нова клітина дороги коштує ' + B.ROAD_COST + ' золота.')}">${I.svg(t)}${esc(T0.name)}<small>${costTxt(T0.cost)}</small></button>`; }).join('') + '</div>';
  }

  function skillsHtml(c) { return CC.SKILLS.map(s => [s, c.skills[s.id]]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, v]) => `<span class="tag-t" title="Рівень навички 0–20${c.passion[s.id] ? (c.passion[s.id] === 2 ? '. Горить цією справою' : '. Цікавиться') : ''}">${s.name} ${v}${c.passion[s.id] ? (c.passion[s.id] === 2 ? ' 🔥' : ' ✦') : ''}</span>`).join(''); }
  function colonistCard(G, c, arrival) {
    const st = G.s.settlers, town = G.s.town, house = town.buildings.find(b => b.id === c.home), mates = st.residents.filter(o => o !== c && o.home === c.home), mood = c.mood;
    let h = `<div class="pnl"><h3>${arrival ? 'Прибулець' : 'Поселенець'}</h3><div style="font-weight:600">${esc(S.fullName(c))}</div>
      <div class="row2"><span>Вік, професія</span><b>${c.age}, ${esc(S.profession(c))}</b></div>
      ${arrival ? '' : `<div class="row2" title="Настрій залежить від ситості, роботи, корчми, сусідів і рис"><span>Настрій</span><b>${mood}</b></div><div class="bar-m"><i style="width:${mood}%;background:${mood < 30 ? 'var(--danger)' : mood < 55 ? 'var(--warn)' : 'var(--ok)'}"></i></div>`}
      <div>${c.traits.map(t => `<span class="tag-t" title="${esc(CC.TRAIT_BY[t].desc)}">${esc(CC.TRAIT_BY[t].name)}</span>`).join('')}</div><div style="margin-top:4px">${skillsHtml(c)}</div>
      <p class="hint">${CC.backstoryText(c).map(b => esc(b.name) + ': ' + esc(b.text)).join(' ')} ${esc(c.quirk || '')}</p>`;
    if (arrival) {
      const houses = town.buildings.filter(b => B.TYPES[b.type].house && S.freeSlots(st, town, b) > 0);
      h += houses.length ? `<label class="hint">Оселити в будинку</label><select id="houseSel" title="Оберіть будинок із вільним місцем">${houses.map(b => `<option value="${b.id}">Будинок №${b.id} (вільно ${S.freeSlots(st, town, b)})</option>`).join('')}</select><div class="acts">${btn('settle:' + c.id, 'Поселити', 'class="btn-primary"', 'Поселити в обраний будинок')}${btn('reject:' + c.id, 'Відмовити', '', 'Прибулець піде геть')}</div>` : `<p class="hint">Вільного житла нема: збудуйте житловий будинок. Прибулець чекатиме кілька діб.</p><div class="acts">${btn('reject:' + c.id, 'Відмовити', '', 'Прибулець піде геть')}</div>`;
    } else {
      const jobs = town.buildings.filter(b => B.TYPES[b.type].jobs && (S.slotsLeft(st, b) > 0 || c.work === b.id)), cur = c.job === 'auto' ? 'auto' : c.job == null ? 'none' : String(c.job);
      h += `<div class="row2"><span>Живе</span><b>${house ? 'Будинок №' + house.id : 'без дому'}</b></div><div class="row2"><span>Працює</span><b>${c.work ? esc(B.TYPES[(town.buildings.find(b => b.id === c.work) || { type: 'house' }).type].name) : 'ніде'}</b></div>
        <label class="hint">Наказ щодо роботи</label><select id="jobSel" data-id="${c.id}" title="«Сам обере» означає, що поселенець шукає роботу за навичками й потребами поселення. Або призначте йому будівлю">
        <option value="auto" ${cur === 'auto' ? 'selected' : ''}>Сам обере роботу</option><option value="none" ${cur === 'none' ? 'selected' : ''}>Без роботи (відпочиває)</option>
        ${jobs.map(b => `<option value="${b.id}" ${cur === String(b.id) ? 'selected' : ''}>${esc(B.TYPES[b.type].name)} №${b.id}${S.jobOf(b.type) ? ' (' + esc(S.jobOf(b.type).name) + ')' : ''}</option>`).join('')}</select>
        <div class="row2"><span>Голод</span><b>${c.hunger ? c.hunger + ' діб' : 'ситий'}</b></div>`;
      if (mates.length) h += '<p class="hint">Сусіди: ' + mates.map(o => esc(o.name) + ' (' + S.relLabel(S.opinion(c, o)) + ')').join(', ') + '</p>';
    }
    return h + '</div>';
  }
  function people(G, ui) {
    const st = G.s.settlers, sel = ui.sel; let h = '';
    if (sel && (sel.kind === 'arrival' || sel.kind === 'resident')) { const c = S.find(st, sel.id); if (c) h += colonistCard(G, c, sel.kind === 'arrival'); }
    if (st.arrivals.length) h += `<div class="pnl"><h3>Біля воріт (${st.arrivals.length})</h3><div class="list">${st.arrivals.map(c => `<button data-act="pick:a:${c.id}" class="new ${sel && sel.kind === 'arrival' && sel.id === c.id ? 'on' : ''}" title="Клікніть, щоб оглянути прибульця">${esc(c.name)}<span>${esc(S.profession(c))}</span></button>`).join('')}</div></div>`;
    h += `<div class="pnl"><h3>Мешканці (${st.residents.length}/${B.housing(G.s.town)})</h3>` + (st.residents.length ? `<div class="list">${st.residents.map(c => `<button data-act="pick:r:${c.id}" class="${sel && sel.kind === 'resident' && sel.id === c.id ? 'on' : ''}" title="Настрій ${c.mood}">${esc(c.name)}<span>${esc(S.profession(c))} · ${c.mood}</span></button>`).join('')}</div>` : '<p class="hint">Поки нікого. Збудуйте житловий будинок, і за кілька діб хтось прийде.</p>') + '</div>';
    return h;
  }

  function buildingCard(G, b) {
    const T0 = B.TYPES[b.type], st = G.s.settlers, w = st.residents.filter(c => c.work === b.id), lives = st.residents.filter(c => c.home === b.id);
    let h = `<h3>${esc(T0.name)} №${b.id}</h3><p class="hint" style="margin:0 0 6px">${esc(T0.desc)}</p>`;
    if (T0.yields) { const sh = B.countTiles(G.s.town, b), k = Math.min(1, sh / T0.yields.need); h += `<div class="row2" title="Частка потрібної місцевості карти в радіусі видобутку"><span>Місцевість поруч</span><b>${Math.round(sh * 100)}% з ${Math.round(T0.yields.need * 100)}% ${k < 1 ? '(слабко)' : ''}</b></div><div class="row2"><span>Видобуває</span><b>${TD.RES[T0.yields.res].icon} ${f1(T0.yields.perWorker * k * w.reduce((a, c) => a + S.eff(c, b.type), 0))} за добу</b></div>`; }
    if (T0.makes) h += `<div class="row2"><span>Робить</span><b>🔧 з руди й дерева</b></div>`;
    if (T0.jobs) h += `<div class="row2"><span>Працівники</span><b>${w.length} з ${T0.jobs}</b></div>` + w.map(c => `<div class="hint"><a href="#" data-act="pick:r:${c.id}">${esc(S.fullName(c))}</a></div>`).join('');
    if (T0.house) h += `<div class="row2"><span>Мешканці</span><b>${lives.length} з ${T0.house}</b></div>` + lives.map(c => `<div class="hint"><a href="#" data-act="pick:r:${c.id}">${esc(S.fullName(c))}</a></div>`).join('');
    if (!T0.core) h += `<div class="acts">${btn('demolish:' + b.id, 'Знести', '', 'Повернути половину вартості, зайві дороги зникнуть')}</div>`;
    return h;
  }
  function settlementCard(G, id) {
    const w = G.world, s = w.S[id], m = G.s.markets[id];
    let h = `<h3>${esc(RANK[s.rank] || 'Поселення')}</h3><div style="font-weight:600">${esc(s.name)}</div><div class="row2"><span>Мешканців</span><b>≈${(s.pop || 0).toLocaleString('uk')}</b></div>`;
    if (id === w.start) return h + '<p class="hint">Це ваше поселення. Наближайте колесом миші, щоб будувати.</p>';
    if (!m) return h + '<p class="hint">Це поселення далеко: торгових шляхів сюди поки нема.</p>';
    h += `<div class="row2"><span>Виробляє</span><b>${m.produces.map(r => TD.RES[r].icon + ' ' + TD.RES[r].name).join(', ')}</b></div><div class="row2"><span>Потребує</span><b>${m.needs.map(r => TD.RES[r].icon + ' ' + TD.RES[r].name).join(', ')}</b></div><div class="acts">${btn('trade:' + id, 'Торгувати', 'class="btn-primary"', 'Відкрити ціни й відправити караван')}</div>`;
    return h;
  }
  function lairCard(L) {
    const D = root.Atlas2.Danger; return `<h3>Лігво загрози</h3><div style="font-weight:600">${esc(L.name)}</div><div class="row2"><span>Небезпека</span><b>${L.danger} з 5 (${esc(D.TIERS[L.tier] || '')})</b></div><div class="row2"><span>Рівень</span><b>${L.level}</b></div>` + L.monsters.slice(0, 3).map(m => `<div class="hint"><b>${esc(m.name)}</b>${m.count > 1 ? ' × ' + m.count : ''}, рівень ${m.level}</div>`).join('') + '<p class="hint">Караван, що проходить поруч без охорони, ризикує втратити вантаж. Лігва поблизу поселення влаштовують набіги.</p>';
  }
  function selcard(G, ui) {
    const sel = ui.sel; if (!sel) return ''; let h = '';
    if (sel.kind === 'building') { const b = B.byId(G.s.town, sel.id); if (b) h = buildingCard(G, b); }
    else if (sel.kind === 'settlement') h = settlementCard(G, sel.id); else if (sel.kind === 'lair') h = lairCard(G.world.lairs[sel.id]);
    return h ? '<button class="x" data-act="desel" title="Закрити картку (Esc)">×</button>' + h : '';
  }

  function trade(G, ui) {
    const w = G.world, st = G.s.stock, ids = Object.keys(G.s.markets).map(Number).sort((a, b) => G.s.markets[a].len - G.s.markets[b].len);
    let h = `<div class="pnl"><h3>Куди їхати</h3><select id="tradeSel" title="Оберіть поселення, з яким торгувати"><option value="">— оберіть поселення —</option>${ids.map(i => `<option value="${i}" ${ui.tradeTo === i ? 'selected' : ''}>${esc(w.S[i].name)} (${RANK[w.S[i].rank] || ''}, шлях ≈${G.s.markets[i].len} кл.)</option>`).join('')}</select>`;
    const to = ui.tradeTo, m = to != null && G.s.markets[to];
    if (m) {
      const path = w.routePath(w.start, to);
      h += `<div class="row2"><span>Виробляє</span><b>${m.produces.map(r => TD.RES[r].icon).join(' ')}</b></div><div class="row2"><span>Потребує ★</span><b>${m.needs.map(r => TD.RES[r].icon).join(' ')}</b></div><div class="cargo" style="margin-top:6px"><span class="hd">Товар</span><span class="hd">Ціна</span><span class="hd">Продати</span><span class="hd">Купити</span>${TD.IDS.map(r => `<span title="${m.needs.includes(r) ? 'Потребують: ціна висока' : m.produces.includes(r) ? 'Виробляють: ціна низька' : 'Звичайний попит'}">${TD.RES[r].icon} ${TD.RES[r].name}${m.needs.includes(r) ? ' ★' : ''}</span><b style="font-weight:500;color:var(--gold-hi)">🪙${f1(T.price(m, r))}</b><input type="number" min="0" max="${Math.floor(st[r] || 0)}" value="0" data-sell="${r}" title="Скільки відправити на продаж (на складі ${Math.floor(st[r] || 0)})"><input type="number" min="0" max="${Math.floor(m.stock[r])}" value="0" data-buy="${r}" title="Скільки купити (у них ${Math.floor(m.stock[r])}); оплата з виручки від продажу">`).join('')}</div>
      <p class="hint" id="cargoInfo"></p><label class="chk" title="Найняти охорону: платно, але засідки менш небезпечні"><input type="checkbox" id="escort"> Охорона (🪙${T.ESCORT_COST})</label>
      <div class="row2"><span>Дорога</span><b>${path ? path.length - 1 + ' клітин, ≈' + T.eta(w, path) + ' діб' : '—'}</b></div><div class="row2" title="Ймовірність засідки на шляху туди"><span>Ризик засідки</span><b id="riskVal">${path ? Math.round(T.riskOf(w, path, false) * 100) + '%' : '—'}</b></div><div class="row2"><span>Вільних дворів</span><b>${Z.Game.caravanSlots(G)}</b></div>
      <div class="acts">${btn('send:' + to, 'Відправити караван', 'class="btn-primary"', 'Караван везе товар (до ' + Z.Game.CARGO_MAX + ' одиниць), продає його там і купує замовлене')}${btn('focus:' + to, 'Показати на карті', '', 'Перелетіти до цього поселення')}</div>`;
    } else h += '<p class="hint">Оберіть поселення зі списку або клікніть його на карті.</p>';
    h += '</div>';
    h += `<div class="pnl"><h3>Каравани (${G.s.caravans.length})</h3>` + (G.s.caravans.length ? G.s.caravans.map(c => `<div class="row2"><span>→ ${esc(w.S[c.to].name)}${c.escort ? ' 🛡' : ''}</span><b>${c.status === 'out' ? 'в дорозі' : 'повертається'}</b></div>`).join('') : '<p class="hint">Нема. Збудуйте Караванний двір.</p>') + '</div>';
    return h;
  }
  function world(G) {
    const w = G.world, s = w.S[w.start];
    return `<div class="pnl"><h3>Поселення</h3><div style="font-weight:600">${esc(s.name)}</div><div class="row2"><span>Зерно світу</span><b>${esc(G.s.seed)}</b></div><div class="row2"><span>Поселень на карті</span><b>${w.S.filter(w.alive).length}</b></div><div class="row2"><span>Лігв поблизу</span><b>${w.lairs.filter(l => Math.hypot(l.x - s.x, l.y - s.y) < 40).length}</b></div><div class="acts">${btn('focus:' + w.start, 'До поселення', '', 'Перелетіти до свого поселення')}</div></div>
      <div class="pnl"><h3>Новий світ</h3><label class="hint">Зерно (порожнє: випадкове)</label><input type="text" id="seed" title="Зерно світу: те саме зерно дає той самий материк" style="width:100%;box-sizing:border-box"><div class="acts">${btn('gen', 'Згенерувати світ', 'class="btn-primary"', 'Створити новий випадковий материк і почати нову гру (поточне збереження буде замінено)')}</div></div>`;
  }
  const logHtml = G => G.s.log.slice(0, 60).map(l => `<li class="${l.kind}"><em>д.${l.day}</em>${esc(l.text)}</li>`).join('');
  Z.Panels = { hud, bar, people, trade, world, selcard, logHtml, esc, RANK };
})(globalThis);
