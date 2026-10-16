/* Кубик промптів, режим Flux: збирання промпта живою мовою (браузер: глобал FluxLang; Node: module.exports).
   Для кожної групи параметрів (волосся, очі, шкіра, поза, одяг…) є одне шаблонне речення; якщо тегів для групи немає, шматок пропускається;
   змінюються лише потрібні слова; є умовні доповнення (світяться очі, кольорові пасма тощо).
   Вхід: get(id) повертає масив значень параметра (порожній, якщо вимкнено чи немає). Слова: flux-words.js. */
const FluxLang = (() => {
  const W = typeof FluxWords !== 'undefined' ? FluxWords : require('./flux-words.js');

  const hum = s => String(s).replace(/_\([^)]*\)/g, '').replace(/_/g, ' ').trim();
  const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const uniq = a => [...new Set(a.filter(Boolean))];
  const tags = vals => uniq((vals || []).flatMap(v => String(v).split(',').map(x => x.trim()).filter(Boolean)));
  const list = a => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const article = p => (/^(a|an|the|some|his|her|their)\s/i.test(p) || /[^s]s$/i.test(p) || /^(makeup|armor|clothing|jewelry)\b/i.test(p) ? p : (/^[aeiou]/i.test(p) ? 'an ' : 'a ') + p);
  // фрази для значень: спершу ціле значення (напр. «eyes_closed, smile») за таблицею, інакше кожен тег окремо; fb — запасне правило
  const phr = (vals, table, fb) => uniq((vals || []).flatMap(v => (Object.prototype.hasOwnProperty.call(table, v) ? [table[v]] : String(v).split(',').map(x => x.trim()).filter(Boolean).map(t => (Object.prototype.hasOwnProperty.call(table, t) ? table[t] : fb(t))))));
  const tbl = (table, tag) => (Object.prototype.hasOwnProperty.call(table, tag) ? table[tag] : null);

  function who(gender) {
    const g = (gender || [])[0];
    if (g === '1girl') return { S: 'She', s: 'she', P: 'her', noun: 'woman', named: false };
    if (g === '1boy') return { S: 'He', s: 'he', P: 'his', noun: 'man', named: false };
    return { S: 'The character', s: 'the character', P: "the character's", noun: 'character', named: true };
  }
  const poss = (txt, P) => txt.replace(/~/g, P);

  /* ----- перетворення груп тегів у фрази ----- */
  const ANIMAL = new Set(['fox', 'cat', 'wolf', 'dog', 'rabbit', 'horse', 'tiger']);
  function raceWord(tag) {
    const sp = { mecha_musume: 'mechanical', yuki_onna: 'snow-spirit (yuki-onna)', dragon_girl: 'dragon-blooded', dragon_boy: 'dragon-blooded', demon_girl: 'demon', demon_boy: 'demon', bird_girl: 'bird-winged', monster_girl: 'monster', onee_san: 'mature' }[tag];
    if (sp) return sp;
    const m = /^(.+)_(girl|boy)$/.exec(tag);
    if (m) return ANIMAL.has(m[1]) ? m[1] + '-eared' : hum(m[1]);
    return hum(tag);
  }
  function ageWord(tag) { return { adult: 'adult', mature_female: 'mature', mature_male: 'mature', 'onee-san': 'mature, older-sister-type' }[tag] || hum(tag); }
  function skinPhrase(vals) {
    const ts = tags(vals), colored = ts.find(t => /^colored_skin$/.test(t)), parts = [];
    ts.forEach(t => {
      const sp = tbl(W.skin, t); if (sp === '') return;
      const m = /^(\w+)_skin$/.exec(t);
      if (sp) parts.push(sp); else if (m && colored) parts.push(m[1] + ' skin'); else parts.push(hum(t));
    });
    return list(uniq(parts));
  }

  function hairSentence(v, w) {
    const len = (v.hairLen[0] || '').replace(/_hair$/, '').replace(/_/g, ' ');
    const adjs = [], withs = [];
    tags(v.hairColor).forEach(t => {
      const sp = tbl(W.hairColorSpecial, t);
      if (sp && sp[0] === '+') { withs.push(sp.slice(1)); return; }
      if (sp) { adjs.push(sp); return; }
      let m;
      if ((m = /^(.+)_inner_hair$/.exec(t))) { withs.push(`a ${hum(m[1])} inner layer`); return; }
      if ((m = /^(.+)_streaks$/.exec(t))) { withs.push(`${hum(m[1])} streaks`); return; }
      if ((m = /^(.+)_hair$/.exec(t))) { adjs.push(hum(m[1])); return; }
      adjs.push(hum(t));
    });
    const style = tags(v.hairStyle).map(t => tbl(W.hairStyle, t) || 'styled as ' + article(hum(t)));
    const details = []; let glow = false;
    tags(v.hairDetail).forEach(t => { if (t === 'glowing_hair') { glow = true; return; } details.push(tbl(W.hairDetail, t) || article(hum(t))); });
    if (!len && !adjs.length && !style.length && !details.length && !withs.length && !glow) return '';
    let s = len || adjs.length ? `${cap(w.P)} ${[len, ...adjs].filter(Boolean).join(' ')} hair` : `${cap(w.P)} hair`;
    if (withs.length) s += ` with ${list(withs)}`;
    if (style.length) s += ` is ${list(style)}`;
    const extras = [...details, ...(glow ? ['a faint inner glow'] : [])];
    if (extras.length) s += style.length ? `, with ${list(extras)}` : ` features ${list(extras)}`;
    return s + '.';
  }

  function eyesSentence(v, w) {
    const colors = []; let glow = false, mixed = false;
    tags(v.eyeColor).forEach(t => {
      if (W.glowTags.has(t)) { glow = true; return; }
      if (t === 'heterochromia') { mixed = true; return; }
      let m;
      if ((m = /^(.+)_eyes$/.exec(t))) { colors.push({ multicolored: 'multicolored', gradient: 'gradient-colored', golden: 'golden' }[m[1]] || hum(m[1])); return; }
      colors.push(hum(t));
    });
    const feats = [];
    tags(v.eyeDetail).forEach(t => { if (W.glowTags.has(t)) { glow = true; return; } const sp = tbl(W.eyeDetail, t); feats.push(sp ? sp.replace(/^\+/, '') : hum(t)); });
    const color = colors.join(' and ');
    if (!color && !glow && !mixed && !feats.length) return '';
    let s;
    if (mixed && glow) s = `${cap(w.P)} eyes are two different colors and glow from within`;
    else if (mixed) s = `${cap(w.P)} eyes are two different colors (heterochromia)`;
    else if (glow && color) s = `${cap(w.P)} ${color} eyes glow from within`;
    else if (glow) s = `${cap(w.P)} eyes glow with an inner light`;
    else if (color) s = `${w.S} has ${color} eyes`;
    else s = `${cap(w.P)} eyes stand out`;
    if (feats.length) s += `, with ${list(feats)}`;
    return s + '.';
  }

  function faceSentence(v, w) {
    const emo = phr(v.emotion, W.emotion, t => `looks ${hum(t)}`);
    const mouth = phr(v.expression, W.mouth, t => `mouth shows ${hum(t)}`);
    const eyes = phr(v.eyeExpr, W.eyeExpr, t => `show ${hum(t)}`);
    const out = [];
    if (emo.length) out.push(`${w.S} ${poss(list(emo), w.P)}`);
    const rest = [];
    if (mouth.length) rest.push(`${w.P} ${poss(list(mouth), w.P)}`);
    if (eyes.length) rest.push(`${w.P} eyes ${poss(list(eyes), w.P)}`);
    if (rest.length) out.push(emo.length ? `${cap(list(rest))}` : cap(list(rest)));
    return out.length ? out.join('. ') + '.' : '';
  }

  function bodySentence(v, w) {
    const adjs = [], feats = [];
    const feed = (vals, table, plainFeature) => tags(vals).forEach(t => {
      let sp = tbl(table, t);
      if (sp == null) sp = plainFeature ? '+' + hum(t) : hum(t);
      if (sp[0] === '+') feats.push(sp.slice(1)); else adjs.push(sp);
    });
    feed(v.build, W.build, true); feed(v.breasts, W.chest, true); feed(v.hips, W.hips, true); feed(v.limbs, W.limbs, true);
    const a = uniq(adjs), f = uniq(feats);
    if (!a.length && !f.length) return '';
    if (a.length) return `${cap(w.P)} build is ${list(a)}${f.length ? `, with ${list(f)}` : ''}.`;
    return `${w.S} has ${list(f)}.`;
  }

  function adornSentence(v, w) {
    const out = [];
    const mk = tags(v.makeup).map(t => hum(t));
    if (mk.length) out.push(`${w.S} wears ${list(mk)}`);
    const nails = tags(v.nails); if (nails.length) {
      const colors = [], adj = [];
      nails.forEach(t => { let m; if ((m = /^(\w+)_nails$/.exec(t)) && !/^(short|long)$/.test(m[1])) colors.push(m[1]); else adj.push({ long_fingernails: 'long', sharp_fingernails: 'sharp', short_nails: 'short', nail_polish: 'polished', claws: 'clawed' }[t] || hum(t)); });
      out.push(`${cap(w.P)} nails are ${list([...uniq(adj), ...uniq(colors)])}`);
    }
    const marks = tags(v.permFeat).map(t => tbl(W.permFeat, t) || article(hum(t)));
    if (marks.length) out.push(`${w.S} has ${list(marks)}`);
    return out.length ? out.join('. ') + '.' : '';
  }

  function identitySentence(v, w) {
    const age = tags(v.age).map(ageWord).join(' '), race = tags(v.race).map(raceWord).join(' ');
    const skin = skinPhrase(v.skin);
    if (!age && !race && !skin && w.named) return '';
    let s = article([age, race, w.noun].filter(Boolean).join(' '));
    s = cap(s) + (skin ? ` with ${skin}` : '');
    return s + '.';
  }
  function raceFeatSentence(v, w) {
    const f = tags(v.raceFeat).map(t => article(hum(t)));
    return f.length ? `${w.S} has ${list(f)}.` : '';
  }

  function weaponPhrase(vals) {
    const raw = tags(vals).map(t => hum(t.replace(/^holding_/, ''))), keep = raw.filter(a => !raw.some(b => b !== a && b.endsWith(' ' + a)));
    return keep.length ? list(uniq(keep).map(article)) : '';
  }
  function outfitSentences(v, w) {
    const out = [];
    const allOut = tags(v.outfit), bareOut = allOut.filter(t => /^bare_/.test(t)).map(hum), outfit = allOut.filter(t => !/^bare_/.test(t)).map(t => hum(t));
    const state = tags(v.outState).map(t => tbl(W.outState, t) || hum(t));
    if (outfit.length) out.push(`${w.S} wears ${list(outfit.map(article))}${bareOut.length ? `, leaving ${w.P} ${list(bareOut.map(b => b.replace(/^bare /, '')))} bare` : ''}${state.length ? `, and the clothing is ${list(state)}` : ''}.`);
    else if (state.length) out.push(`${cap(w.P)} clothing is ${list(state)}.`);
    const bareLeg = tags(v.legwear).some(t => /^bare_/.test(t)), leg = tags(v.legwear).filter(t => !/^bare_/.test(t)).map(t => article(hum(t))), foot = tags(v.footwear).map(t => article(hum(t)));
    const gl = tags(v.gloves).map(t => article(hum(t))), hd = tags(v.headwear).map(t => article(hum(t)));
    if (leg.length) out.push(`${cap(w.P)} legs are dressed in ${list(leg)}.`);
    else if (bareLeg) out.push(`${cap(w.P)} legs are bare.`);
    if (foot.length) out.push(`On ${w.P} feet: ${list(foot)}.`);
    if (gl.length) out.push(`${w.S} wears ${list(gl)} on ${w.P} arms and hands.`);
    if (hd.length) out.push(`${cap(w.P)} head is topped with ${list(hd)}.`);
    const ac = tags(v.accessories).map(t => article(hum(t)));
    if (ac.length) out.push(`${w.S} is adorned with ${list(ac)}.`);
    const bare = tags(v.bareParts).map(t => W.bare[t] || hum(t));
    if (bare.length) out.push(`Cut and exposed areas: ${list(bare)}.`);
    const wp = weaponPhrase(v.weapon); if (wp) out.push(`${w.S} holds ${wp}.`);
    return out;
  }

  function poseSentences(v, w) {
    const out = [];
    const P = x => poss(x, w.P);
    const pose = phr(v.pose, W.pose, hum).map(P), arms = phr(v.armPos, W.armPos, hum).map(P), legs = phr(v.legPos, W.legPos, hum).map(P);
    const act = phr(v.action, W.action, hum).map(P), inter = phr(v.interaction, W.interaction, hum).map(P);
    let s = '';
    if (pose.length) s = `${w.S} ${list(pose)}`;
    else if (arms.length || legs.length || act.length || inter.length) s = `${w.S} is posed`;
    if (s) {
      const extra = [];
      if (arms.length) extra.push(`with ${list(arms)}`);
      if (legs.length) extra.push(`${arms.length ? 'and ' : 'with '}${list(legs)}`);
      if (extra.length) s += ' ' + extra.join(' ');
      if (act.length) s += `, ${list(act).replace(/^/, 'caught ')}`;
      out.push(s + '.');
    }
    if (inter.length) out.push(`${w.S} ${list(inter)}.`);
    const gz = phr(v.gaze, W.gaze, t => `looks ${hum(t)}`).map(P);
    if (gz.length) out.push(`${w.S} ${list(gz)}.`);
    return out;
  }
  function cameraSentence(v) {
    const cam = phr(v.cameraAngle, W.camera, hum), fr = tags(v.framing).map(hum);
    const fmt = (v.gFormat || [])[0], fg = (v.gFraming || [])[0], parts = [];
    if (cam.length) parts.push(`The shot is ${list(cam)}`);
    if (fr.length) parts.push(`framed as a ${list(fr)}`);
    let s = parts.join(', ');
    if (fmt) s += (s ? '. ' : '') + `Image format: ${fmt}`;
    if (fg) s += (s ? '. ' : '') + `Framing: ${fg}`;
    return s ? s + '.' : '';
  }

  function settingSentences(v) {
    const out = [];
    const io = (v.io || [])[0], bg = tags(v.background).map(hum), fgo = v.fgObjects || [];
    if (io && bg.length) out.push(`The scene is set ${io}, with ${list(bg)}.`);
    else if (io) out.push(`The scene is set ${io}.`);
    else if (bg.length) out.push(`The setting includes ${list(bg)}.`);
    if (fgo.length) out.push(`In the foreground: ${list(fgo)}.`);
    const tod = tags(v.timeOfDay).map(t => tbl(W.time, t) || hum(t)), wt = tags(v.weather).map(t => tbl(W.weather, t) || hum(t));
    if (tod.length && wt.length) out.push(`The time is ${list(tod)}, with ${list(wt)}.`);
    else if (tod.length) out.push(`The time is ${list(tod)}.`);
    else if (wt.length) out.push(`The sky and weather: ${list(wt)}.`);
    const lt = tags(v.lighting).map(hum); if (lt.length) out.push(`The lighting features ${list(lt)}.`);
    if (v.shadows && v.shadows.length) out.push(`Shadows: ${list(v.shadows)}.`);
    const fx = tags(v.effects).map(hum); if (fx.length) out.push(`Visual effects: ${list(fx)}.`);
    return out;
  }
  function moodSentences(v) {
    const out = [];
    if ((v.atmosphere || []).length) out.push(`The mood is ${list(v.atmosphere)}.`);
    if ((v.colorScheme || []).length) out.push(`Color palette: ${list(v.colorScheme)}.`);
    if ((v.materials || []).length) out.push(`Materials and textures: ${list(v.materials)}.`);
    if ((v.details || []).length) out.push(`Fine details: ${list(v.details)}.`);
    if ((v.finalAccent || []).length) out.push(`Finishing touches: ${list(v.finalAccent)}.`);
    return out;
  }
  function spriteSentences(v) {
    const out = [], views = v.sprViews || [];
    if (views.length) out.push(`The sheet shows the character in these views: ${list(views)}.`);
    if ((v.sprElev || []).length) out.push(`Camera: ${v.sprElev[0]}.`);
    if ((v.sprPose || []).length) out.push(`Base pose: ${v.sprPose[0]}.`);
    if ((v.sprParts || []).length) out.push(`For every view, the separated parts are drawn as individual pieces: ${list(v.sprParts)}.`);
    if ((v.sprLayout || []).length) out.push(`Layout: ${v.sprLayout[0]}.`);
    if ((v.sprBg || []).length) out.push(`Background: ${v.sprBg[0]}.`);
    if ((v.sprFormat || []).length) out.push(`Sheet format: ${v.sprFormat[0]}.`);
    return out;
  }

  /* Збирає абзаци. kind: 'char' | 'sprite' | 'scene'; get(id) → масив значень; theme — опис тематики (напр. high fantasy). */
  function paragraphs(kind, get, theme) {
    const ids = ['gender', 'age', 'race', 'raceFeat', 'skin', 'hairLen', 'hairColor', 'hairStyle', 'hairDetail', 'eyeColor', 'eyeDetail', 'emotion', 'expression', 'eyeExpr', 'makeup', 'nails', 'breasts', 'hips', 'limbs', 'build', 'permFeat',
      'weapon', 'outfit', 'outState', 'legwear', 'footwear', 'bareParts', 'gloves', 'headwear', 'accessories', 'gFormat', 'gFraming', 'cameraAngle', 'framing', 'gaze', 'pose', 'armPos', 'legPos', 'action', 'interaction',
      'io', 'background', 'fgObjects', 'effects', 'timeOfDay', 'weather', 'lighting', 'shadows', 'atmosphere', 'colorScheme', 'materials', 'details', 'finalAccent',
      'sprViews', 'sprElev', 'sprPose', 'sprParts', 'sprLayout', 'sprBg', 'sprFormat'];
    const v = {}; ids.forEach(id => { v[id] = get(id) || []; });
    const w = who(v.gender), P = [];
    const para = a => { const t = a.filter(Boolean).join(' '); if (t) P.push(t); };
    const themeS = theme ? `Theme: ${theme}.` : '';
    if (kind === 'scene') {
      para([themeS, ...settingSentences(v)]);
      para([cameraSentence(v)]);
      para(moodSentences(v));
      return P;
    }
    para([themeS, identitySentence(v, w), raceFeatSentence(v, w), hairSentence(v, w), eyesSentence(v, w), faceSentence(v, w), bodySentence(v, w), adornSentence(v, w)]);
    para(outfitSentences(v, w));
    if (kind === 'sprite') { para(spriteSentences(v)); return P; }
    para([...poseSentences(v, w), cameraSentence(v)]);
    para(settingSentences(v));
    para(moodSentences(v));
    return P;
  }
  return { paragraphs, who, list, article, tags };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FluxLang;
