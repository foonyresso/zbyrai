function drawBase() {
  RT0 = performance.now();
  OPS = 0;
  WPEND = false;
  if (WON) drawWorld();
  else {
    ctx.fillStyle = BIO.g;
    ctx.fillRect(0, 0, W, H);
    drawSea();
  }
  if (F.rel) drawRel();
  if (WON) {
    drawRoads();
    drawVillages();
  }
  for (const b of L) if (b.o && !(WON && WSK.has(b.t))) drawB(b);
  wpath();
  ctx.fillStyle = "#cdbf9e";
  ctx.fill();
  drawRiver();
  ctx.strokeStyle = "#c4b080";
  ctx.lineWidth = Math.max(1, S * 7);
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  for (const p of RDS) {
    path0(p);
    ctx.stroke();
  }
  ctx.strokeStyle = "#8a6a45";
  ctx.lineWidth = Math.max(2, 8 * S);
  for (const q of BR) {
    ctx.beginPath();
    ctx.moveTo(ox + q[0][0] * S, oy + q[0][1] * S);
    ctx.lineTo(ox + q[1][0] * S, oy + q[1][1] * S);
    ctx.stroke();
  }
  ctx.fillStyle = "#d6cdb2";
  dot(ox, oy, PRD * S);
  ctx.fillStyle = "#c3b690";
  for (const p of Y) {
    path(p);
    ctx.fill();
  }
  for (const b of L) if (!b.o) drawB(b);
  drawWall();
  if (ST) {
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * PI2;
      ctx.fillStyle = MAG ? "#c9b8ff" : "#7c7c8a";
      dot(
        ox + (ST.x + Math.cos(a) * 9) * S,
        oy + (ST.y + Math.sin(a) * 9) * S,
        Math.max(1.5, 2.2 * S),
      );
    }
    if (MAG) {
      ctx.fillStyle = "#a58aff88";
      dot(ox + ST.x * S, oy + ST.y * S, 6 * S);
    }
  }
  if (MAG) {
    const mg = L.filter((b) =>
      !b.o &&
      ["mtower", "gmage", "academy", "temple", "cathedral"].includes(b.t)
    );
    ctx.save();
    ctx.shadowColor = "#9b7bff";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#a58aff99";
    ctx.lineWidth = Math.max(1.5, 1.6 * S);
    ctx.setLineDash([8, 6]);
    for (const b of mg) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + b.cx * S, oy + b.cy * S);
      ctx.stroke();
    }
    if (ST) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + ST.x * S, oy + ST.y * S);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = "#d4c4ff";
    for (const b of mg) dot(ox + b.cx * S, oy + b.cy * S, Math.max(2, 3.5 * S));
    ctx.beginPath();
    ctx.arc(ox, oy, Math.max(PRD * 1.6, 10) * S, 0, PI2);
    ctx.stroke();
    ctx.restore();
  }
  if (WPEND && !moving()) {
    bdirty = true;
    requestAnimationFrame(() => {
      q = 0;
      redraw();
    });
  }
}
let homeShown = null;
function homeBtn() {
  const away =
    Math.hypot((W / 2 - ox) / S, (H / 2 - oy) / S) > Math.max(...R) + 120;
  if (away !== homeShown) {
    homeShown = away;
    $("#home").style.display = away ? "block" : "none";
  }
}
function goHome() {
  if (HH) {
    $("#cn").textContent = HH[0];
    $("#stat").textContent = HH[1];
    HH = null;
  }
  fit();
}
function flyTo(v) {
  const st = mkSettle(v);
  if (!HH) HH = [$("#cn").textContent, $("#stat").textContent];
  $("#cn").textContent = NAMES[v.tier] + " «" + v.name + "»";
  $("#stat").textContent = st
    ? "споруд: " + st.n + " · мешканців ≈ " + st.p
    : "";
  S = Math.max(.3, Math.min(20, Math.min(W, H) / (v.rad * 2.1)));
  ox = W / 2 - v.x * S;
  oy = H / 2 - v.y * S;
  bdirty = true;
  redraw();
}
function randomSettle() {
  if (!WLD) wsetup();
  const want = $("#rsz").value, cx = (W / 2 - ox) / S, cy = (H / 2 - oy) / S;
  for (const r0 of [12000, 30000]) {
    const ls = vlist(cx - r0, cy - r0, cx + r0, cy + r0).filter((v) =>
      Math.hypot(v.x - cx, v.y - cy) < r0 &&
      Math.hypot(v.x - cx, v.y - cy) > 150 && (want == "a" || v.tier == +want)
    );
    if (ls.length) {
      flyTo(ls[Math.floor(Math.random() * ls.length)]);
      return;
    }
    if (want == "a" || +want < 5) break;
  }
  $("#stat").textContent = "Таких поселень поблизу не знайдено";
}
let sclT = "",
  WHL = 0,
  whlT = 0,
  bS = 1,
  bOx = 0,
  bOy = 0,
  HH = null;
const moving = () => (drag && drag.mv) || WHL;
function scaleBar() {
  const t = 100 / S,
    p = Math.pow(10, Math.floor(Math.log10(t))),
    m = t / p,
    n = (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p,
    h = '<i style="width:' + (n * S).toFixed(0) + 'px"></i>' +
      (n >= 1000 ? n / 1000 + " км" : n + " м");
  if (h !== sclT) {
    sclT = h;
    $("#scl").innerHTML = h;
  }
}
function render() {
  if (!R) return;
  if (!cv.width || !cv.height) return;
  const d = window.devicePixelRatio || 1, key = [ox, oy, S, W, H, d].join();
  if (
    bc && !bdirty && bkey !== key && moving() && bc.width === Math.round(W * d)
  ) {
    const k = S / bS;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ebe8d2";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(
      bc,
      (ox - bOx * k) * d,
      (oy - bOy * k) * d,
      bc.width * k,
      bc.height * k,
    );
    ctx.setTransform(d, 0, 0, d, 0, 0);
  } else {
    if (bdirty || bkey !== key || !bc) {
      if (!bc) {
        bc = document.createElement("canvas");
        bx = bc.getContext("2d");
      }
      if (bc.width !== Math.round(W * d) || bc.height !== Math.round(H * d)) {
        bc.width = W * d;
        bc.height = H * d;
      }
      const main = ctx;
      ctx = bx;
      bdirty = false;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, W, H);
      try {
        drawBase();
      } finally {
        ctx = main;
      }
      bkey = key;
      bS = S;
      bOx = ox;
      bOy = oy;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bc, 0, 0);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  scaleBar();
  homeBtn();
  drawFx();
  if (hov && mode === "build") {
    const [w, h] = dims(sel.value);
    path(rp(hov[0], hov[1], w, h, Math.atan2(hov[1], hov[0]) + 1.5708));
    ctx.strokeStyle = free(hov[0], hov[1]) ? "#3cd05a" : "#d03030";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (hov && mode !== "wall" && !HV) {
    const b = hit(hov[0], hov[1]);
    if (b) {
      path(b.poly);
      ctx.strokeStyle = mode === "del" ? (b.o ? "#888" : "#d03030") : "#fff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }
  if (pts && pts.length > 1) {
    ctx.strokeStyle = "#ffd23c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    pts.forEach((p, k) =>
      k
        ? ctx.lineTo(ox + p[0] * S, oy + p[1] * S)
        : ctx.moveTo(ox + p[0] * S, oy + p[1] * S)
    );
    ctx.stroke();
  }
}
function redraw() {
  if (!q) {
    q = requestAnimationFrame(() => {
      q = 0;
      render();
    });
  }
}
function resize() {
  const d = window.devicePixelRatio || 1;
  W = cv.clientWidth;
  H = cv.clientHeight;
  cv.width = W * d;
  cv.height = H * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  if (R) fit();
  else redraw();
}
const wpt = (e) => [(e.offsetX - ox) / S, (e.offsetY - oy) / S];
cv.onpointerdown = (e) => {
  cv.setPointerCapture(e.pointerId);
  drag = {
    x: e.offsetX,
    y: e.offsetY,
    lx: e.offsetX,
    ly: e.offsetY,
    mv: false,
  };
  if (mode === "wall") pts = [wpt(e)];
};
cv.onpointermove = (e) => {
  if (drag) {
    if (mode === "wall") {
      const p = wpt(e), l = pts[pts.length - 1];
      if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 6 / S) pts.push(p);
    } else if (
      drag.mv || Math.hypot(e.offsetX - drag.x, e.offsetY - drag.y) > 5
    ) {
      drag.mv = true;
      ox += e.offsetX - drag.lx;
      oy += e.offsetY - drag.ly;
    }
    drag.lx = e.offsetX;
    drag.ly = e.offsetY;
  }
  hov = wpt(e);
  if (mode !== "wall" && !(drag && drag.mv)) {
    HV = null;
    const lh = mode === "info" && layerHover(hov[0], hov[1]),
      b = hit(hov[0], hov[1]),
      ins = Math.hypot(hov[0], hov[1]) < Rat(Math.atan2(hov[1], hov[0])),
      D = b
        ? T[b.t]
        : (SE && seaD(hov[0], hov[1]) > 0)
        ? T.sea
        : (RV && rivD(hov[0], hov[1]) < RV.w / 2)
        ? T.river
        : ins
        ? T.street
        : (WON ? wInfo(hov[0], hov[1]) : T.grass);
    tip.innerHTML = lh ||
      "<b>" + D.n + "</b><br><i>" + D.c +
        ((b ? b.o : !ins) ? " · за мурами" : "") + "</i><br>" + D.d;
    tip.style.display = "block";
    tip.style.left = Math.min(e.clientX + 14, innerWidth - 240) + "px";
    tip.style.top = (e.clientY + 14) + "px";
  } else tip.style.display = "none";
  redraw();
};
cv.onpointerup = (e) => {
  if (mode === "wall" && pts && pts.length > 10) applyWall(pts);
  else if (drag && !drag.mv && mode !== "wall") {
    const p = wpt(e);
    act(p[0], p[1]);
  }
  drag = null;
  pts = null;
  redraw();
};
cv.onpointerleave = () => {
  tip.style.display = "none";
  hov = null;
  HV = null;
  redraw();
};
cv.addEventListener("wheel", (e) => {
  e.preventDefault();
  const n = Math.max(.015, Math.min(30, S * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
  ox = e.offsetX - (e.offsetX - ox) * n / S;
  oy = e.offsetY - (e.offsetY - oy) * n / S;
  S = n;
  WHL = 1;
  clearTimeout(whlT);
  whlT = setTimeout(() => {
    WHL = 0;
    redraw();
  }, 170);
  redraw();
}, { passive: false });
document.querySelectorAll("[data-m]").forEach((b) =>
  b.onclick = () => {
    mode = b.dataset.m;
    document.querySelectorAll("[data-m]").forEach((x) =>
      x.classList.toggle("on", x === b)
    );
    sel.hidden = mode !== "build";
    if (mode === "wall") {$("#stat").textContent =
        "Намалюй замкнений контур мишкою або пальцем";} else rebuild();
  }
);
document.querySelectorAll("[data-tab]").forEach((b) =>
  b.onclick = () => {
    document.querySelectorAll("[data-tab]").forEach((x) =>
      x.classList.toggle("on", x === b)
    );
    document.querySelectorAll("[data-pn]").forEach((x) =>
      x.classList.toggle("on", x.dataset.pn === b.dataset.tab)
    );
    $("#side").classList.remove("closed");
  }
);
if (window.ResizeObserver) {
  new ResizeObserver(() => resize()).observe(document.querySelector("main"));
}
$("#won").onclick = () => {
  bdirty = true;
  WON = !WON;
  $("#won").classList.toggle("on", WON);
  redraw();
};
$("#wtype").onchange = $("#wseed").onchange = () => {
  WLD = null;
  bdirty = true;
  redraw();
};
$("#wrd").onclick = () => {
  WRD = !WRD;
  bdirty = true;
  $("#wrd").classList.toggle("on", WRD);
  redraw();
};
$("#wall1").onclick = () => {
  S = .03;
  ox = W / 2;
  oy = H / 2;
  bdirty = true;
  redraw();
};
$("#wcity").onclick = goHome;
$("#home").onclick = goHome;
$("#rnd").onclick = randomSettle;
cv.ondblclick = (e) => {
  if (mode !== "info" || !WON || !WLD) return;
  const p = wpt(e);
  for (const v of vlist(p[0] - 320, p[1] - 320, p[0] + 320, p[1] + 320)) {
    if (Math.hypot(v.x - p[0], v.y - p[1]) < v.rad) {
      flyTo(v);
      break;
    }
  }
};
$("#gen").onclick = () => gen(true);
$("#size").onchange = () => gen(false);
$("#seed").onchange = () => gen(false);
$("#riv").onchange =
  $("#sea").onchange =
  $("#lay").onchange =
  $("#bio").onchange =
    () => gen(false);
for (const k of ["nit", "lbl", "ugr", "rel"]) {
  $("#" + k).onclick = (e) => {
    F[k] = !F[k];
    bdirty = true;
    HV = null;
    e.currentTarget.classList.toggle("on", F[k]);
    if (k == "lbl") $("#leg").style.display = F.lbl ? "block" : "none";
    redraw();
  };
}
$("#leg").innerHTML = Object.entries(ZK).filter((e) => e[0] != "res").map((e) =>
  '<div><i style="background:' + e[1][1] + '"></i>' + e[1][0] + "</div>"
).join("");
$("#mag").onclick = () => {
  MAG = !MAG;
  bdirty = true;
  $("#mag").classList.toggle("on", MAG);
  redraw();
};
addEventListener("resize", resize);
$("#seed").value = Math.floor(Math.random() * 99999);
resize();
gen(false);
