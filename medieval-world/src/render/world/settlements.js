/* значки поселень: ранг за рівнем */
const TIER_RANK = ["hamlet", "village", "town", "regional", "capital", "capital", "capital"];
/* значок за рангом: столиця провінції — замок із золотою зіркою, решта великих міст — місто з муром */
const hubRank = (h) => h.tier >= 3 ? (isCap(h) ? "capital" : "regional") : TIER_RANK[Math.min(h.tier, 6)];
function capStar(x, y, k) {
  const r = 5.5 * k, cy = y - 27 * k;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r;
    ctx.lineTo(x + Math.cos(a) * q, cy + Math.sin(a) * q);
  }
  ctx.closePath();
  ctx.fillStyle = "#f2c230";
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();
}
function drawVillages() {
  if (WBD) drawBorders();
  if (S < .04) return;
  const x0 = -ox / S,
    y0 = -oy / S,
    x1 = (W - ox) / S,
    y1 = (H - oy) / S,
    vs = vlist(x0 - 320, y0 - 320, x1 + 320, y1 + 320);
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  for (const v of vs) {
    if (S < .07 && v.tier < 2 || S < .045 && v.tier == 2) continue;
    const x = ox + v.x * S, y = oy + v.y * S, r = RB[v.tier] * S;
    let full = false;
    if (S >= .5) {
      if (v.st !== undefined || tick()) full = drawSettle(v);
      else WPEND = true;
    }
    if (!full) {
      /* значки поселень спільні з «Материком» (worlds/continent/render/icons-settlements.js); стан малює шар RLAY.st */
      const ik = Math.max(.6, Math.min(1.5, .5 + S * 6));
      RealmMap.IconsSettlements.drawSettlement(ctx, { rank: hubRank(v), state: "normal" }, x, y, ik);
      if (v.tier >= 3 && isCap(v)) capStar(x, y, ik);
    }
    if (RLAY.sr && S >= .045 && srPort(v)) portBadge(x + (full ? v.rad * S * .7 : r * .9 + 5), y - (full ? v.rad * S * .7 : r * .9 + 5), full ? 1.3 : Math.max(.9, Math.min(1.4, .6 + S * 6)));
    if ((v.tier >= 3 ? S >= .025 : S >= .15) && S < 2.4) {
      ctx.font = (v.tier >= 3 ? "700 " : "600 ") + (v.tier >= 3
        ? Math.min(18, 10 + v.tier * 1.6 + S * 4)
        : Math.max(10, Math.min(12, 8 + S * 8))) +
        "px system-ui";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(243,239,224,.92)";
      ctx.fillStyle = "#3a2a18";
      const ty = y + (full ? -v.rad * S * .9 - 4 : r * .85 + 12);
      ctx.strokeText(v.name, x, ty);
      ctx.fillText(v.name, x, ty);
    }
  }
}

/* значок порту: якір у бірюзовому колі біля поселення */
function portBadge(x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, PI2);
  ctx.fillStyle = "#1f7f8a";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#f3fbff";
  ctx.stroke();
  ctx.strokeStyle = "#f3fbff";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -4.6, 1.5, 0, PI2);
  ctx.moveTo(0, -3); ctx.lineTo(0, 4.6);
  ctx.moveTo(-2.6, -1); ctx.lineTo(2.6, -1);
  ctx.moveTo(-4.4, 1.4); ctx.quadraticCurveTo(-3.6, 5, 0, 4.8); ctx.quadraticCurveTo(3.6, 5, 4.4, 1.4);
  ctx.stroke();
  ctx.restore();
}
