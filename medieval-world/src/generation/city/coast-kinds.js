/* Типи берега міста: річка, море (затока), океан, дельта (річка + море).
   Вода — частина плану міста: обирається першою, від неї залежать форма міста, дороги, брами, стіни й причали. */
const SHORE_NAMES = {
  none: "суходіл",
  river: "річкове",
  sea: "морське",
  ocean: "океанічне",
  delta: "дельта (річка й море)",
};
/* Вибір типу берега: sel — значення #shore; ro/so — старі перемикачі «Річка»/«Море» (1/0/null = авто) */
function pickShore(r, tierN, sel, ro, so) {
  let hr, sea = null;
  const seaKind = () => (r() < (tierN >= 2 ? .35 : .12) ? "ocean" : "sea");
  if (sel == "none") hr = false;
  else if (sel == "river") hr = true;
  else if (sel == "sea") sea = "sea", hr = r() < .3;
  else if (sel == "ocean") sea = "ocean", hr = r() < .3;
  else if (sel == "delta") hr = true, sea = seaKind();
  else {
    hr = r() < .45;
    if (r() < .18 + .05 * Math.min(tierN, 4)) sea = seaKind();
  }
  if (ro !== null) hr = !!ro;
  if (so === 0) sea = null;
  else if (so === 1 && !sea) sea = seaKind();
  return { river: hr, sea };
}
/* Лінія берега: відстань від центру міста до води вздовж напрямку моря на «поперечній» координаті q */
function shoreAt(q) {
  const S_ = SE;
  const wob = S_.kind == "ocean" ? 9 * Math.sin(q * .025) + 4 * Math.sin(q * .09) : 4 * Math.sin(q * .04);
  const bay = Math.min(S_.bayMax, q * q / (2 * S_.bayR));
  const a = Math.abs(q),
    big = a < 900 ? 0 : sst(900, 1900, a) * (vn(q * .0016, 5.5, S_.sb) - .5) * 900;
  return S_.D + wob - bay + big;
}
/* Ширина міста вздовж берега збільшується, щоб місто не «зрізало» колом: воно розтягується вздовж води */
function shoreStretch(a) {
  const t = Math.sin(a - SE.a);
  return 1 + (SE.kind == "ocean" ? .22 : .3) * t * t;
}
