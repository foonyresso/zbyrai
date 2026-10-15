function drawSea() {
  if (!SE) return;
  const u = [SE.ux, SE.uy],
    n = [-SE.uy, SE.ux],
    M = Math.max(...R) * 2 + 400,
    P = (
      q,
      d,
    ) => [ox + (u[0] * d + n[0] * q) * S, oy + (u[1] * d + n[1] * q) * S],
    cl = () => {
      for (let q = -M; q <= M; q += 10) {
        const z = P(q, shoreAt(q));
        q == -M ? ctx.moveTo(z[0], z[1]) : ctx.lineTo(z[0], z[1]);
      }
    };
  ctx.beginPath();
  cl();
  let z = P(M, shoreAt(M) + M);
  ctx.lineTo(z[0], z[1]);
  z = P(-M, shoreAt(-M) + M);
  ctx.lineTo(z[0], z[1]);
  ctx.closePath();
  ctx.fillStyle = SE.kind == "ocean" ? "#8fbad6" : "#a8cde3";
  ctx.fill();
  ctx.strokeStyle = "#6f9fbd";
  ctx.lineWidth = Math.max(1, 1.4 * S);
  ctx.beginPath();
  cl();
  ctx.stroke();
}
function drawRiver() {
  if (!RV) return;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  path0(RV.pts);
  ctx.strokeStyle = "#6f9fbd";
  ctx.lineWidth = (RV.w + 3) * S;
  ctx.stroke();
  ctx.strokeStyle = "#a8cde3";
  ctx.lineWidth = RV.w * S;
  ctx.stroke();
  ctx.lineCap = "butt";
}
