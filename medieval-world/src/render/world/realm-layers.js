/* ---- малювання шарів карти королівств у нескінченному світі: морські шляхи, лігва й боси, місця, стани поселень ----
   Кожен шар має власний перемикач (RLAY.*); значки спільні з «Материком» (src/render/realm/icons-places.js) */
var RLAY = { mo: true, bs: true, po: true, sr: true, st: true };
const rlIk = () => Math.max(.6, Math.min(1.5, Math.sqrt(S * 14)));
/* чи показується об'єкт при поточному масштабі й перемикачах */
function rxShown(o) {
  if (o.type) return RLAY.po && S >= (o.cls == "major" ? .045 : .1);
  if (o.tier == 1) return RLAY.mo && S >= .07;
  return RLAY.bs && S >= (o.tier == 3 ? .02 : .035);
}
function drawSeaRoutes() {
  if (!RLAY.sr || S < .025) return;
  const x0 = -ox / S, y0 = -oy / S, x1 = (W - ox) / S, y1 = (H - oy) / S, m = SR_R + 1500,
    vs = vlist(x0 - m, y0 - m, x1 + m, y1 + m), seen = new Set();
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(30,90,140,.85)";
  ctx.lineWidth = Math.max(1.6, 3 * S);
  ctx.setLineDash([Math.max(5, 14 * S), Math.max(4, 9 * S)]);
  for (const v of vs) {
    const pa = srPort(v);
    if (!pa) continue;
    for (const pb of srEdges(v)) {
      const k = v.id < pb.v.id ? v.id + ">" + pb.v.id : pb.v.id + ">" + v.id;
      if (seen.has(k)) continue;
      seen.add(k);
      if (Math.max(pa.x, pb.x) < x0 - SR_R && Math.min(pa.x, pb.x) > x1 + SR_R) continue;
      const r = srRoute(pa, pb);
      if (!r || r.bb[2] < x0 || r.bb[0] > x1 || r.bb[3] < y0 || r.bb[1] > y1) continue;
      ctx.beginPath();
      r.pts.forEach((q, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, ox + q[0] * S, oy + q[1] * S));
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawRealmObjects() {
  const x0 = -ox / S, y0 = -oy / S, x1 = (W - ox) / S, y1 = (H - oy) / S, ik = rlIk(), P = RealmMap.IconsPlaces;
  if (RLAY.mo || RLAY.bs || RLAY.po) {
    const list = [];
    rxEach(x0 - 100, y0 - 100, x1 + 100, y1 + 100, (o) => rxShown(o) && list.push(o));
    list.sort((a, b) => a.y - b.y);
    for (const o of list) {
      const sx = ox + o.x * S, sy = oy + o.y * S;
      if (o.type) P.drawPoi(ctx, o, sx, sy, ik);
      else P.drawLair(ctx, o, sx, sy, ik, 0);
    }
  }
  if (RLAY.st && S >= .05) {
    for (const v of vlist(x0 - 320, y0 - 320, x1 + 320, y1 + 320)) {
      const st = rxState(v);
      if (st == "normal") continue;
      const full = S >= .5, rr = full ? v.rad * S * .85 : (S < .12 ? 2.2 + v.tier * 1.1 : RB[v.tier] * S * .85),
        x = ox + v.x * S + rr * .9 + 5, y = oy + v.y * S - rr * .9 - 5, r = 5 * ik;
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#2f2418";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, PI2);
      if (st == "occupied") {
        ctx.fillStyle = "#7a1c1c";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f0e4cc";
        ctx.fillRect(x - r * .5, y - r * .25, r * .3, r * .3);
        ctx.fillRect(x + r * .2, y - r * .25, r * .3, r * .3);
      } else if (st == "ruined") {
        ctx.fillStyle = "#b9b2a6";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r * .5, y - r * .5);
        ctx.lineTo(x + r * .5, y + r * .5);
        ctx.moveTo(x + r * .5, y - r * .5);
        ctx.lineTo(x - r * .5, y + r * .5);
        ctx.stroke();
      } else if (st == "abandoned") {
        ctx.fillStyle = "rgba(190,184,172,.45)";
        ctx.fill();
        ctx.setLineDash([2, 2]);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#e0a85a";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r * .5, y);
        ctx.lineTo(x + r * .5, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
