/* ---- вигляд будівель за складом рас поселення ----
   Поки малюється поселення, RACC — середній відтінок його рас (raceTint). Вимкнений шар «Раси» (RLAY.pp) повертає звичайні кольори.
   Файли рас: races/*.js (look.tint). Формат: docs/atlas/race-files.md */
var RACC = null;
const raceHex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const raceMixCol = (c, to, k) => {
  const a = raceHex(c);
  return "#" + a.map((v, i) => Math.round(v * (1 - k) + to[i] * k).toString(16).padStart(2, "0")).join("");
};
/* ставить відтінок рас для поселення v (home: рідне місто); повертає попередній стан, щоб його відновити */
function raceEnter(v, home) {
  const prev = RACC;
  RACC = !RLAY.pp || !WLD || !WON || !Atlas.races.length ? null : raceTint(raceMix(home ? hh() : v));
  return prev;
}
function raceLeave(prev) { RACC = prev; }
/* колір будівлі c (після біомного відтінку): трохи відтінку рас */
function raceCol(c) {
  return RACC ? raceMixCol(c, RACC, .12) : c;
}
