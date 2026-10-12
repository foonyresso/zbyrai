function drawFx() {
  drawMana();
  if (F.nit) {
    ctx.fillStyle = "rgba(8,12,44,.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.shadowColor = "#ffb347";
    ctx.shadowBlur = 6;
    for (const b of L) {
      if (b.o || !b.rc) continue;
      const h = Math.abs(Math.sin(b.cx * 12.9 + b.cy * 7.7) * 999) % 1,
        tv = b.t == "tavern" || b.t == "inn";
      if (h > (tv ? 1 : .55)) continue;
      const x = ox + b.cx * S, y = oy + b.cy * S;
      if (x < 0 || y < 0 || x > W || y > H) continue;
      ctx.fillStyle = tv ? "#ffd27a" : "#ffc860";
      dot(x, y, Math.max(1, (tv ? 2.4 : 1.5) * S));
    }
    ctx.restore();
  }
  if (F.ugr) {
    ctx.fillStyle = "rgba(18,16,26,.88)";
    ctx.fillRect(0, 0, W, H);
    if (!UG) {
      const r = mk(seed + "ug"), ch = [], tn = [];
      for (const rd of RDS) {
        const sg = rd.filter((p) =>
          Math.hypot(p[0], p[1]) < Rat(Math.atan2(p[1], p[0])) - 6
        );
        if (sg.length > 1) {
          sg.k = "main";
          tn.push(sg);
        }
      }
      const ring = [];
      for (let k = 0; k <= 24; k++) {
        const a = k / 24 * PI2, rr = Rat(a) * .5;
        ring.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      ring.k = "ring";
      tn.push(ring);
      for (let i = 0, nc = 3 + tier * 2; i < nc; i++) {
        const a = r() * PI2,
          d = r() * .8 * Rat(a),
          th = i == 0 && L.find((b) => b.t == "gthief" && !b.o),
          x = th ? th.cx : Math.cos(a) * d,
          y = th ? th.cy : Math.sin(a) * d;
        ch.push({
          x,
          y,
          r: 6 + r() * 8,
          k: i == 0 ? "lair" : r() < .3 ? "crypt" : "cell",
        });
        let bp = null, bd = 1e9;
        for (const s of tn) {
          for (const p of s) {
            const e = Math.hypot(p[0] - x, p[1] - y);
            if (e < bd) {
              bd = e;
              bp = p;
            }
          }
        }
        if (bp) {
          const br = [[x, y], bp];
          br.k = "br";
          tn.push(br);
        }
      }
      UG = { tn, ch };
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#6fb3a8";
    ctx.lineWidth = Math.max(2, 3.2 * S);
    for (const s of UG.tn) {
      ctx.beginPath();
      s.forEach((p, k) =>
        k
          ? ctx.lineTo(ox + p[0] * S, oy + p[1] * S)
          : ctx.moveTo(ox + p[0] * S, oy + p[1] * S)
      );
      ctx.stroke();
    }
    for (const c of UG.ch) {
      ctx.fillStyle = c.k == "lair"
        ? "#8a3a4a"
        : c.k == "crypt"
        ? "#6a6a82"
        : "#5a8a80";
      dot(ox + c.x * S, oy + c.y * S, c.r * S);
    }
    if (HV && HV.t == "uc") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ox + HV.c.x * S, oy + HV.c.y * S, HV.c.r * S + 3, 0, PI2);
      ctx.stroke();
    }
    if (HV && HV.t == "ut") {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = Math.max(4, 5.5 * S);
      ctx.beginPath();
      HV.s.forEach((p, k) =>
        k
          ? ctx.lineTo(ox + p[0] * S, oy + p[1] * S)
          : ctx.moveTo(ox + p[0] * S, oy + p[1] * S)
      );
      ctx.stroke();
    }
    ctx.fillStyle = "#e8f6f0";
    dot(ox, oy, Math.max(3, 4 * S));
    ctx.lineCap = "butt";
  }
  if (F.lbl) {
    const key = [ox, oy, S, W, H, Y.length, seed, tier, LAY, R[0]].join(),
      d = window.devicePixelRatio || 1;
    if (!ZC || ZC.k !== key) {
      const c = ZC ? ZC.c : document.createElement("canvas");
      c.width = W * d;
      c.height = H * d;
      const z = c.getContext("2d");
      z.scale(d, d);
      z.lineJoin = "round";
      z.lineWidth = Math.max(4, 9 * S);
      const pp = (q) => {
        z.beginPath();
        q.forEach((u, k) =>
          k
            ? z.lineTo(ox + u[0] * S, oy + u[1] * S)
            : z.moveTo(ox + u[0] * S, oy + u[1] * S)
        );
        z.closePath();
        z.fill();
        z.stroke();
      };
      for (let i = 0; i < Y.length; i++) {
        z.fillStyle = z.strokeStyle = (ZK[YK[i]] || ZK.res)[1];
        pp(Y[i]);
      }
      if (CAS) {
        z.fillStyle = z.strokeStyle = ZK.castle[1];
        pp(CP || CAS.poly);
      }
      ZC = { k: key, c };
    }
    ctx.save();
    wpath();
    ctx.clip();
    ctx.globalAlpha = .22;
    ctx.drawImage(ZC.c, 0, 0, W, H);
    ctx.restore();
    if (HV && HV.t == "d") {
      ctx.save();
      wpath();
      ctx.clip();
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(4, 9 * S);
      for (let i = 0; i < Y.length; i++) {
        if (YD[i] == HV.d) {
          ctx.globalAlpha = .6;
          ctx.fillStyle = ctx.strokeStyle = (ZK[YK[i]] || ZK.res)[1];
          path(Y[i]);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      for (let i = 0; i < Y.length; i++) {
        if (YD[i] == HV.d) {
          path(Y[i]);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    ctx.font = "600 " + Math.max(10, Math.min(16, 6 * S + 4)) + "px system-ui";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,252,240,.85)";
    ctx.fillStyle = "#3a2a18";
    const tx = (s, x, y) => {
      ctx.strokeText(s, ox + x * S, oy + y * S);
      ctx.fillText(s, ox + x * S, oy + y * S);
    };
    DCL.forEach((c) => tx(c.n, c.x, c.y));
    if (CAS) {
      tx("Замок «" + cname(seed + "cas") + "»", CAS.cx, CAS.cy - CAS.r * 1.3);
    }
    tx(cname($("#seed").value), 0, -PRD * 1.3 - 4);
  }
}
