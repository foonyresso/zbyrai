/* ---- вигляд будівель за народом провінції та складом рас поселення ----
   Поки малюється поселення, PPLC — народ його провінції, RACC — середній відтінок його рас. Вимкнений шар «Народи й раси» (RLAY.pp)
   повертає звичайні кольори. Файли народів і рас: peoples/*.js, races/*.js (look). Формат: docs/atlas/people-files.md */
var PPLC = null, RACC = null;
const pplHex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const pplMix = (c, to, k) => {
  const a = pplHex(c);
  return "#" + a.map((v, i) => Math.round(v * (1 - k) + (Array.isArray(to) ? to[i] : pplHex(to)[i]) * k).toString(16).padStart(2, "0")).join("");
};
/* ставить народ і раси для поселення v (null: світу немає чи шар вимкнено); повертає попередній стан, щоб його відновити */
function pplEnter(v, home) {
  const prev = [PPLC, RACC];
  if (!RLAY.pp || !WLD || !WON) { PPLC = RACC = null; return prev; }
  PPLC = home ? pplOfProv(PV(hh())) : pplOfSettle(v);
  RACC = PPLC ? raceTint(raceMix(home ? hh() : v, PPLC)) : null;
  return prev;
}
function pplLeave(prev) { [PPLC, RACC] = prev; }
/* колір будівлі c (після біомного відтінку): стіни чи дах за палітрою народу + трохи відтінку рас */
function pplCol(c, b, roof) {
  if (!PPLC || !RLAY.pp) return c;
  const L = PPLC.look, pal = roof ? L.roofs : L.walls, h = Math.abs(Math.floor(b.cx * 12.9 + b.cy * 7.3));
  let o = pplMix(c, pal[h % pal.length], HS.has(b.t) || roof ? .5 : .24);
  if (RACC) o = pplMix(o, RACC, .12);
  return o;
}
/* кольори дахів сіл на малому масштабі: палітра народу замість стандартної */
const pplRoof = (v, q) => {
  const p = RLAY.pp ? pplOfSettle(v) : null;
  return p ? p.look.roofs[Math.floor(H2(v.i, v.j, q + 500) * p.look.roofs.length)] : ROOF[Math.floor(H2(v.i, v.j, q + 500) * ROOF.length)];
};
/* значок-прикраса народу біля будівлі: прапор, жердина з бунчуком, арка, піраміда, купол, пальова хата, вогонь, камінь... */
const PPL_GLYPH = {
  pole(x, y, u) { ctx.fillRect(x - u * .08, y - u, u * .16, u * 1.2); ctx.beginPath(); ctx.arc(x, y - u, u * .3, 0, PI2); ctx.fill(); },
  flag(x, y, u) { ctx.fillRect(x - u * .08, y - u, u * .16, u * 1.2); ctx.fillRect(x, y - u, u * .7, u * .45); },
  arch(x, y, u) { ctx.fillRect(x - u * .55, y - u * .8, u * .18, u); ctx.fillRect(x + u * .37, y - u * .8, u * .18, u); ctx.fillRect(x - u * .7, y - u * .9, u * 1.4, u * .22); },
  tower(x, y, u) { ctx.fillRect(x - u * .22, y - u, u * .44, u * 1.2); ctx.beginPath(); ctx.moveTo(x - u * .4, y - u); ctx.lineTo(x, y - u * 1.45); ctx.lineTo(x + u * .4, y - u); ctx.fill(); },
  step(x, y, u) { ctx.fillRect(x - u * .6, y - u * .2, u * 1.2, u * .4); ctx.fillRect(x - u * .4, y - u * .55, u * .8, u * .35); ctx.fillRect(x - u * .2, y - u * .85, u * .4, u * .3); },
  dome(x, y, u) { ctx.beginPath(); ctx.arc(x, y, u * .6, Math.PI, 0); ctx.fill(); },
  stilt(x, y, u) { ctx.fillRect(x - u * .5, y - u * .5, u, u * .4); ctx.fillRect(x - u * .4, y - u * .1, u * .12, u * .5); ctx.fillRect(x + u * .28, y - u * .1, u * .12, u * .5); },
  flame(x, y, u) { ctx.beginPath(); ctx.moveTo(x - u * .3, y + u * .2); ctx.quadraticCurveTo(x - u * .35, y - u * .5, x, y - u); ctx.quadraticCurveTo(x + u * .35, y - u * .5, x + u * .3, y + u * .2); ctx.fill(); },
  cairn(x, y, u) { ctx.fillRect(x - u * .5, y - u * .15, u, u * .3); ctx.fillRect(x - u * .3, y - u * .45, u * .6, u * .3); ctx.fillRect(x - u * .15, y - u * .7, u * .3, u * .25); },
  spire(x, y, u) { ctx.beginPath(); ctx.moveTo(x - u * .4, y + u * .2); ctx.lineTo(x, y - u * 1.1); ctx.lineTo(x + u * .4, y + u * .2); ctx.fill(); },
};
const PPL_DECOR_T = new Set(["hall", "elder", "temple", "chapel", "cathedral", "market", "tavern", "inn", "gmerch", "castle"]);
/* прикраса біля частини будівель: біля громадських завжди, біля решти зрідка */
function pplDecor(b) {
  if (!PPLC || !RLAY.pp || S < 1) return;
  const L = PPLC.look, f = PPL_GLYPH[L.decor];
  if (!f || b.t == "forest" || b.t == "well" || b.t == "fountain" || b.t == "plaza" || b.t == "field" || b.t == "park" || b.t == "street" || b.t == "road") return;
  if (!PPL_DECOR_T.has(b.t) && H2(Math.round(b.cx), Math.round(b.cy), WLD.s + 740) > .09) return;
  const x = ox + b.cx * S, y = oy + b.cy * S, u = Math.max(4, Math.min(b.r * S * .55, 14));
  ctx.save();
  ctx.fillStyle = L.trim;
  ctx.strokeStyle = "#0008";
  ctx.lineWidth = 1;
  f(x + b.r * S * .5, y - b.r * S * .2, u);
  ctx.restore();
}
