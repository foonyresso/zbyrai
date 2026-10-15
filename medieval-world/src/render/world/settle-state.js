/* ---- вигляд поселення за станом (rxState): занепале, зруйноване, покинуте, захоплене монстрами ----
   Працює, коли поселення видно з будинками (масштаб ≥ .5): будівлі напівпрозорі, частина лишається руїною, покинуті зарослі, на захоплених червоні жердини.
   Живі поселення й міста (tier ≥ 3) малюються як раніше. Вимкнений чіп «Стани поселень» (RLAY.st) повертає звичайний вигляд. */
const ST_KEEP = new Set(["forest", "field", "park", "well", "fountain", "plaza", "street", "road", "garden"]);
function stRubble(b, h, col) {
  const x = ox + b.cx * S, y = oy + b.cy * S, r = Math.max(2, b.r * S * .8);
  ctx.fillStyle = col;
  for (let q = 0; q < 4; q++) {
    const a = H2(Math.round(b.cx), Math.round(b.cy), WLD.s + 960 + q) * PI2, d = r * .55 * H2(Math.round(b.cx), Math.round(b.cy), WLD.s + 970 + q);
    const w = r * (.25 + .25 * H2(q, Math.round(b.cy), WLD.s + 980));
    ctx.fillRect(x + Math.cos(a) * d - w / 2, y + Math.sin(a) * d - w / 2, w, w * .8);
  }
}
function stDraw(b, st) {
  if (!RLAY.st || ST_KEEP.has(b.t)) { drawB(b); return; }
  const h = H2(Math.round(b.cx), Math.round(b.cy), WLD.s + 950), a0 = ctx.globalAlpha;
  if (st == "ruined" && h < .5) { stRubble(b, h, "#6e665a"); return; }
  ctx.globalAlpha = a0 * (st == "ruined" ? .7 : st == "abandoned" ? .62 : st == "fallen" ? .82 : 1);
  drawB(b);
  ctx.globalAlpha = a0;
  if (st == "ruined" || (st == "fallen" && h < .15)) stRubble(b, h, "#7d7466");
  else if (st == "abandoned" && h < .35) {
    ctx.fillStyle = "rgba(70,110,50,.6)";
    ctx.beginPath();
    ctx.arc(ox + b.cx * S, oy + b.cy * S, Math.max(2, b.r * S * .5), 0, PI2);
    ctx.fill();
  } else if (st == "occupied" && h < .12 && S >= 1) {
    const x = ox + (b.cx + b.r * .5) * S, y = oy + (b.cy - b.r * .2) * S, u = Math.max(4, Math.min(b.r * S * .55, 14));
    ctx.save();
    ctx.fillStyle = "#7a1c1c";
    ctx.strokeStyle = "#0008";
    ctx.lineWidth = 1;
    PPL_GLYPH.flag(x, y, u);
    ctx.restore();
  }
}
