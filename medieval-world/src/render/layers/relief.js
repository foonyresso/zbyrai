function hgt(x, y) {
  return .5 + .28 * Math.sin(x * .012 + HP[0]) * Math.cos(y * .014 + HP[1]) +
    .2 * Math.sin((x * .7 + y) * .008 + HP[2]) +
    .12 * Math.cos((x - y * .8) * .021 + HP[3]);
}
function drawRel() {
  if (!RL) {
    RL = [];
    const r = mk(seed + "h");
    HP = [r() * 6, r() * 6, r() * 6, r() * 6];
    const m = Math.max(...R) + 130,
      st = 10,
      n = Math.ceil(2 * m / st),
      skip = (x, y) =>
        Math.hypot(x, y) < Rat(Math.atan2(y, x)) + 6 ||
        (SE && seaD(x, y) > -3) || (RV && rivD(x, y) < RV.w / 2 + 3);
    RS = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = -m + i * st, y = -m + j * st;
        if (skip(x + 5, y + 5)) continue;
        const h = hgt(x + 5, y + 5) - .5,
          b = Math.round(Math.max(-.28, Math.min(.28, h * .5)) * 20) / 20;
        if (b) {
          RS.push([
            x,
            y,
            b > 0
              ? "rgba(255,250,230," + b + ")"
              : "rgba(30,40,20," + (-b) + ")",
          ]);
        }
      }
    }
    for (const lv of [.42, .55, .68, .8]) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const x = -m + i * st, y = -m + j * st;
          if (skip(x + st / 2, y + st / 2)) continue;
          const xs = [x, x + st, x + st, x],
            ys = [y, y, y + st, y + st],
            v = xs.map((u, k) => hgt(u, ys[k])),
            pt = [];
          for (const [a, b] of [[0, 1], [1, 2], [3, 2], [0, 3]]) {
            if ((v[a] - lv) * (v[b] - lv) < 0) {
              const q = (lv - v[a]) / (v[b] - v[a]);
              pt.push([
                xs[a] + (xs[b] - xs[a]) * q,
                ys[a] + (ys[b] - ys[a]) * q,
              ]);
            }
          }
          if (pt.length >= 2) {
            RL.push([pt[0], pt[1]]);
          }
          if (pt.length == 4) RL.push([pt[2], pt[3]]);
        }
      }
    }
  }
  for (const q of RS) {
    ctx.fillStyle = q[2];
    ctx.fillRect(ox + q[0] * S, oy + q[1] * S, 10 * S + 1, 10 * S + 1);
  }
  ctx.strokeStyle = "rgba(95,72,40,.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const s of RL) {
    ctx.moveTo(ox + s[0][0] * S, oy + s[0][1] * S);
    ctx.lineTo(ox + s[1][0] * S, oy + s[1][1] * S);
  }
  ctx.stroke();
}
