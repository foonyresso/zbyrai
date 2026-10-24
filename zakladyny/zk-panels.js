/* Закладини: HTML бічної панелі (будівництво, картки будівель і людей, торгівля). Лише рядки; події вішає app.js (data-act). */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech, B = M.Building, S = M.Settlers, T = M.Trade, TD = M.TradeData, CC = ColonistCore;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const costTxt = c => Object.keys(c).filter(k => c[k]).map(k => (k === 'gold' ? '🪙' : TD.RES[k].icon) + c[k]).join(' ');
  const btn = (act, label, attrs = '', title = '') => `<button data-act="${act}" ${attrs} title="${esc(title)}">${label}</button>`;

  function palette(G, ui) {
    const st = G.s.stock;
    return `<div class="pn"><h3>Будувати</h3><div class="tools">${btn('tool:select', 'Огляд', ui.tool === 'select' ? 'class="on"' : '', 'Клік по будівлі чи людині показує її картку')}${btn('tool:demolish', 'Знести', ui.tool === 'demolish' ? 'class="on"' : '', 'Режим зносу: клік по будівлі прибирає її й повертає половину вартості. Зайві дороги зникнуть')}</div>
    <div class="pal">${B.ORDER.map(t => { const T0 = B.TYPES[t]; const can = B.canPay(st, T0.cost); return `<button data-act="tool:build:${t}" class="${ui.tool === 'build:' + t ? 'on' : ''} ${can ? '' : 'cant'}" title="${esc(T0.desc + (T0.jobs ? ' Робочих місць: ' + T0.jobs + '.' : '') + (T0.house ? ' Місць проживання: ' + T0.house + '.' : '') + ' Кожна нова клітина дороги коштує ' + B.ROAD_COST + ' золота.')}">${esc(T0.name)}<small>${costTxt(T0.cost)}</small></button>`; }).join('')}</div>
    <p class="hint">Будівлі ставте не далі ${3} клітин від доріг: поруч з'явиться нова вулиця.</p></div>`;
  }

  function skillsHtml(c) {
    return CC.SKILLS.map(s => [s, c.skills[s.id]]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, v]) => `<span class="tag-t" title="Рівень навички 0–20${c.passion[s.id] ? (c.passion[s.id] === 2 ? '. Горить цією справою' : '. Цікавиться') : ''}">${s.name} ${v}${c.passion[s.id] ? (c.passion[s.id] === 2 ? ' 🔥' : ' ✦') : ''}</span>`).join('');
  }
  function colonistCard(G, c, arrival) {
    const st = G.s.settlers, town = G.s.town, house = town.buildings.find(b => b.id === c.home);
    const mood = c.mood, mates = st.residents.filter(o => o !== c && o.home === c.home);
    let h = `<div class="pn"><h3>${arrival ? 'Прибулець' : 'Поселенець'}</h3><div style="font-weight:600">${esc(S.fullName(c))}</div>
      <div class="row"><span>Вік, професія</span><b>${c.age}, ${esc(S.profession(c))}</b></div>
      ${arrival ? '' : `<div class="row" title="Настрій залежить від ситості, роботи, корчми, сусідів і рис"><span>Настрій</span><b>${mood}</b></div><div class="bar-m"><i style="width:${mood}%;background:${mood < 30 ? 'var(--danger)' : mood < 55 ? 'var(--warn)' : 'var(--ok)'}"></i></div>`}
      <div>${c.traits.map(t => `<span class="tag-t" title="${esc(CC.TRAIT_BY[t].desc)}">${esc(CC.TRAIT_BY[t].name)}</span>`).join('')}</div>
      <div style="margin-top:4px">${skillsHtml(c)}</div>
      <p class="hint">${CC.backstoryText(c).map(b => esc(b.name) + ': ' + esc(b.text)).join(' ')} ${esc(c.quirk || '')}</p>`;
    if (arrival) {
      const houses = town.buildings.filter(b => B.TYPES[b.type].house && S.freeSlots(st, town, b) > 0);
      h += houses.length ? `<label class="hint">Оселити в будинку</label><select id="houseSel" title="Оберіть будинок із вільним місцем">${houses.map(b => `<option value="${b.id}">Будинок №${b.id} (вільно ${S.freeSlots(st, town, b)})</option>`).join('')}</select><div class="acts">${btn('settle:' + c.id, 'Поселити', 'class="btn-primary"', 'Поселити в обраний будинок')}${btn('reject:' + c.id, 'Відмовити', '', 'Прибулець піде геть')}</div>` : `<p class="hint">Вільного житла нема: збудуйте житловий будинок. Прибулець чекатиме кілька діб.</p><div class="acts">${btn('reject:' + c.id, 'Відмовити', '', 'Прибулець піде геть')}</div>`;
    } else {
      const jobs = town.buildings.filter(b => B.TYPES[b.type].jobs && (S.slotsLeft(st, b) > 0 || c.work === b.id));
      const cur = c.job === 'auto' ? 'auto' : c.job == null ? 'none' : String(c.job);
      h += `<div class="row"><span>Живе</span><b>${house ? 'Будинок №' + house.id : 'без дому'}</b></div><div class="row"><span>Працює</span><b>${c.work ? esc(B.TYPES[(town.buildings.find(b => b.id === c.work) || { type: 'house' }).type].name) : 'ніде'}</b></div>
        <label class="hint">Наказ щодо роботи</label><select id="jobSel" data-id="${c.id}" title="«Сам обере» означає, що поселенець шукає роботу за навичками й потребами поселення. Або призначте йому будівлю">
        <option value="auto" ${cur === 'auto' ? 'selected' : ''}>Сам обере роботу</option><option value="none" ${cur === 'none' ? 'selected' : ''}>Без роботи (відпочиває)</option>
        ${jobs.map(b => `<option value="${b.id}" ${cur === String(b.id) ? 'selected' : ''}>${esc(B.TYPES[b.type].name)} №${b.id}${S.jobOf(b.type) ? ' (' + esc(S.jobOf(b.type).name) + ')' : ''}</option>`).join('')}</select>
        <div class="row"><span>Голод</span><b>${c.hunger ? c.hunger + ' діб' : 'ситий'}</b></div>`;
      if (mates.length) h += '<p class="hint" style="margin-top:6px">Сусіди: ' + mates.map(o => esc(o.name) + ' (' + S.relLabel(S.opinion(c, o)) + ')').join(', ') + '</p>';
    }
    return h + '</div>';
  }
  function buildingCard(G, b) {
    const T0 = B.TYPES[b.type], st = G.s.settlers, w = st.residents.filter(c => c.work === b.id), lives = st.residents.filter(c => c.home === b.id);
    let h = `<div class="pn"><h3>${esc(T0.name)} №${b.id}</h3><p class="hint" style="margin:0 0 6px">${esc(T0.desc)}</p>`;
    if (T0.yields) { const n = B.countTiles(G.s.town, b), k = Math.min(1, n / T0.yields.need); h += `<div class="row" title="Скільки клітин потрібної місцевості в радіусі видобутку"><span>Місцевість поруч</span><b>${n} з ${T0.yields.need} ${k < 1 ? '(слабко)' : ''}</b></div><div class="row"><span>Видобуває</span><b>${TD.RES[T0.yields.res].icon} ${f1(T0.yields.perWorker * k * w.reduce((a, c) => a + S.eff(c, b.type), 0))} за добу</b></div>`; }
    if (T0.makes) h += `<div class="row"><span>Робить</span><b>🔧 з руди й дерева</b></div>`;
    if (T0.jobs) h += `<div class="row"><span>Працівники</span><b>${w.length} з ${T0.jobs}</b></div>` + w.map(c => `<div class="hint">${esc(S.fullName(c))}</div>`).join('');
    if (T0.house) h += `<div class="row"><span>Мешканці</span><b>${lives.length} з ${T0.house}</b></div>` + lives.map(c => `<div class="hint"><a href="#" data-act="pick:r:${c.id}">${esc(S.fullName(c))}</a></div>`).join('');
    if (!T0.core) h += `<div class="acts">${btn('demolish:' + b.id, 'Знести', '', 'Повернути половину вартості, зайві дороги зникнуть')}</div>`;
    return h + '</div>';
  }
  function people(G, ui) {
    const st = G.s.settlers, sel = ui.sel;
    let h = '';
    if (st.arrivals.length) h += `<div class="pn"><h3>Біля воріт (${st.arrivals.length})</h3><div class="list">${st.arrivals.map(c => `<button data-act="pick:a:${c.id}" class="new ${sel && sel.kind === 'arrival' && sel.id === c.id ? 'on' : ''}" title="Клікніть, щоб оглянути прибульця">${esc(c.name)}<span>${esc(S.profession(c))}</span></button>`).join('')}</div></div>`;
    h += `<div class="pn"><h3>Мешканці (${st.residents.length}/${B.housing(G.s.town)})</h3>` + (st.residents.length ? `<div class="list">${st.residents.map(c => `<button data-act="pick:r:${c.id}" class="${sel && sel.kind === 'resident' && sel.id === c.id ? 'on' : ''}" title="Настрій ${c.mood}">${esc(c.name)}<span>${esc(S.profession(c))} · ${c.mood}</span></button>`).join('')}</div>` : '<p class="hint">Поки нікого. Збудуйте житловий будинок, і за кілька діб хтось прийде.</p>') + '</div>';
    return h;
  }
  function townSide(G, ui) {
    let sel = '';
    if (ui.sel && ui.sel.kind === 'building') { const b = B.byId(G.s.town, ui.sel.id); if (b) sel = buildingCard(G, b); }
    else if (ui.sel && (ui.sel.kind === 'arrival' || ui.sel.kind === 'resident')) { const c = S.find(G.s.settlers, ui.sel.id); if (c) sel = colonistCard(G, c, ui.sel.kind === 'arrival'); }
    return palette(G, ui) + sel + people(G, ui);
  }

  function worldSide(G, ui) {
    const w = G.world, sel = ui.sel;
    let h = '';
    if (sel && sel.kind === 'lair') { const l = w.lairs[sel.id]; h += `<div class="pn"><h3>Лігво загрози</h3><div style="font-weight:600">${esc(l.name)}</div><div class="row"><span>Небезпека</span><b>${l.danger} з 5</b></div><p class="hint">Караван, що проходить поруч без охорони, ризикує втратити вантаж. Лігва поблизу вашого поселення влаштовують набіги.</p></div>`; }
    else if (sel && sel.kind === 'settlement' && sel.id !== w.start) {
      const s = w.S[sel.id], m = G.s.markets[s.id], path = M.WorldLite.routePath(w, w.start, s.id), st = G.s.stock;
      h += `<div class="pn"><h3>${s.rank === 'town' ? 'Місто' : 'Село'}</h3><div style="font-weight:600">${esc(s.name)}</div><div class="row"><span>Мешканців</span><b>≈${s.pop}</b></div>
      <div class="row"><span>Виробляє</span><b>${m.produces.map(r => TD.RES[r].icon + ' ' + TD.RES[r].name).join(', ')}</b></div><div class="row"><span>Потребує</span><b>${m.needs.map(r => TD.RES[r].icon + ' ' + TD.RES[r].name).join(', ')}</b></div></div>
      <div class="pn"><h3>Ціни й караван</h3>${path ? '' : '<p class="hint">Дорога сюди не веде.</p>'}<div class="cargo">${TD.IDS.map(r => `<span title="${m.needs.includes(r) ? 'Потребують: ціна висока' : m.produces.includes(r) ? 'Виробляють: ціна низька' : 'Звичайний попит'}">${TD.RES[r].icon} ${TD.RES[r].name}${m.needs.includes(r) ? ' ★' : ''}</span><b style="font-weight:500;color:var(--gold-hi)">🪙${f1(T.price(m, r))}</b><input type="number" min="0" max="${Math.floor(st[r] || 0)}" value="0" data-cargo="${r}" title="Скільки відправити (на складі ${Math.floor(st[r] || 0)})">`).join('')}</div>
      <p class="hint" id="cargoInfo"></p>
      <label class="ctl-inline" title="Найняти охорону: платно, але засідки менш небезпечні"><input type="checkbox" id="escort"> Охорона (🪙${T.ESCORT_COST})</label>
      <div class="row"><span>Дорога</span><b>${path ? path.length - 1 + ' клітин, ≈' + T.eta(path) + ' діб' : '—'}</b></div>
      <div class="row" title="Ймовірність засідки на шляху туди"><span>Ризик засідки</span><b id="riskVal">${path ? Math.round(T.riskOf(w, path, false) * 100) + '%' : '—'}</b></div>
      <div class="row"><span>Вільних дворів</span><b>${Z.Game.caravanSlots(G)}</b></div>
      <div class="acts">${btn('send:' + s.id, 'Відправити караван', 'class="btn-primary"', 'Караван везе обраний товар (до ' + Z.Game.CARGO_MAX + ' одиниць) і продає його там за місцевою ціною')}</div></div>`;
    } else if (sel && sel.kind === 'settlement') h += '<div class="pn"><h3>Ваше поселення</h3><p class="hint">Перейдіть у режим «Поселення» (Tab), щоб будувати.</p></div>';
    else h += '<div class="pn"><h3>Світова карта</h3><p class="hint">Клікніть поселення, щоб побачити ціни й відправити караван, або лігво, щоб побачити небезпеку. ▲ червоні трикутники це лігва (цифра = небезпека). Жовтий ромб це караван.</p></div>';
    h += `<div class="pn"><h3>Каравани (${G.s.caravans.length})</h3>` + (G.s.caravans.length ? G.s.caravans.map(c => `<div class="row"><span>→ ${esc(w.S[c.to].name)}${c.escort ? ' 🛡' : ''}</span><b>${c.status === 'out' ? 'в дорозі' : 'повертається'}</b></div>`).join('') : '<p class="hint">Нема. Збудуйте Караванний двір.</p>') + '</div>';
    return h;
  }
  function resBar(G) {
    const st = G.s.stock, cap = B.storageCap(G.s.town), food = (st.grain || 0) + (st.fish || 0), p = G.s.settlers.residents.length;
    return `<span class="chip gold" title="Золото: на будівництво й дорогу"><span>🪙</span><b>${Math.floor(st.gold)}</b></span>` + TD.IDS.map(r => `<span class="chip" title="${TD.RES[r].name}. Склад вміщує ${cap} кожного ресурсу"><span>${TD.RES[r].icon}</span><b>${Math.floor(st[r] || 0)}</b><i>/${cap}</i></span>`).join('') + `<span class="chip ${food < p * 3 ? 'low' : ''}" title="Їжа (зерно й риба) на склад: кожен мешканець їсть 1 за добу"><span>🍞</span><b>${Math.floor(food)}</b><i>їжа</i></span><span class="chip" title="Мешканців / місць у житлі"><span>👥</span><b>${p}</b><i>/${B.housing(G.s.town)}</i></span>`;
  }
  Z.Panels = { townSide, worldSide, resBar, esc };
})(globalThis);
