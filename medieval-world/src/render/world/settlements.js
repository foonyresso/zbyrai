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
      if (S < .12) {
        const rr = 2.2 + v.tier * 1.1;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#3a2e22";
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, PI2);
        ctx.fill();
        ctx.stroke();
        if (v.tier >= 3) {
          ctx.fillStyle = "#3a2e22";
          dot(x, y, rr * .45);
        }
      } else {
        path0([[v.x, v.y]]);
        ctx.beginPath();
        ctx.arc(x, y, r * .85, 0, PI2);
        ctx.fillStyle = "#cdbf9e";
        ctx.fill();
        ctx.strokeStyle = "#7a5a38";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (r > 6) {
          for (let q = 0, n = 4 + v.tier * 5; q < n; q++) {
            const a = H2(v.i, v.j, q + 300) * PI2,
              d = Math.sqrt(H2(v.i, v.j, q + 400)) * .65 * RB[v.tier],
              z = Math.max(1.6, 5 * S);
            ctx.fillStyle = pplRoof(v, q);
            ctx.fillRect(
              ox + (v.x + Math.cos(a) * d) * S - z / 2,
              oy + (v.y + Math.sin(a) * d) * S - z / 2,
              z,
              z,
            );
          }
        }
      }
    }
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
  if (S < .6) {
    ctx.font = "700 " + Math.max(12, Math.min(20, 10 + S * 16)) +
      "px system-ui";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,252,240,.9)";
    ctx.fillStyle = "#2a1c0c";
    const nm = cname($("#seed").value), ty = oy - (Math.max(...R) + 10) * S;
    ctx.strokeText(nm, ox, ty);
    ctx.fillText(nm, ox, ty);
  }
}
