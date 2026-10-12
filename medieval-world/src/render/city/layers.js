const UGN = {
  lair: [
    "Лігво гільдії злодіїв",
    "Таємна база: схрони, фальшиві двері й вхід з підвалу «гільдії, якої не існує».",
  ],
  crypt: [
    "Склеп",
    "Давнє поховання під містом. Можливі нежить і прокляті реліквії.",
  ],
  cell: [
    "Підземна комора",
    "Забутий підвал: контрабанда, схрон або ритуальна кімната.",
  ],
};
const MZ = {
  mtower: ["Вежа чарівників", "Резонатор мани: підсилює закляття довкола.", 1],
  academy: [
    "Магічна академія",
    "Тут вчаться чародії, багато заряджених артефактів.",
    .9,
  ],
  gmage: ["Гільдія магів", "Центр чарів і торгівлі артефактами.", .8],
  cathedral: ["Собор", "Свята мана: захист від прокльонів і нежиті.", .6],
  temple: ["Храм", "Місце молитви зі слабким священним полем.", .45],
};
function mnodes() {
  const n = [];
  for (const b of L) {
    if (!b.o && MZ[b.t]) n.push({ x: b.cx, y: b.cy, i: MZ[b.t] });
  }
  if (ST) {
    n.push({
      x: ST.x,
      y: ST.y,
      i: ["Кромлех", "Давні камені: природне джерело мани, нестабільне.", 1.1],
    });
  }
  n.push({
    x: 0,
    y: 0,
    i: ["Центральна площа", "Тут сходяться потоки мани міста.", .5],
  });
  return n;
}
const sgm = () => Math.max(18, Rm * .28);
function mana(x, y) {
  let s = 0, g = sgm();
  for (const n of mnodes()) {
    s += n.i[2] * Math.exp(-((x - n.x) ** 2 + (y - n.y) ** 2) / (2 * g * g));
  }
  return Math.min(1, s / 1.1);
}
function drawMana() {
  if (!MAG) return;
  const g = sgm();
  ctx.save();
  for (const n of mnodes()) {
    const x = ox + n.x * S,
      y = oy + n.y * S,
      r = g * 2.2 * S,
      gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(150,110,255," + (.38 * Math.min(1, n.i[2])) + ")");
    gr.addColorStop(1, "rgba(150,110,255,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  if (HV && (HV.t == "mn" || HV.t == "mp")) {
    const q = HV.t == "mn" ? HV.n : HV;
    ctx.strokeStyle = "#efe6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ox + q.x * S, oy + q.y * S, (HV.t == "mn" ? 10 : 16) * S, 0, PI2);
    ctx.stroke();
  }
  ctx.restore();
}
function distInfo(d, i) {
  if (!DS) {
    DS = new Map();
    let tn = 0, ta = 0;
    for (let j = 0; j < Y.length; j++) {
      let e = DS.get(YD[j]);
      if (!e) {
        e = { n: 0, p: 0, a: 0, c: {}, t: {} };
        DS.set(YD[j], e);
      }
      const A = Math.abs(area(Y[j]));
      e.a += A;
      ta += A;
    }
    for (const b of L) {
      if (b.o || !b.rc) continue;
      const dd = ZB.get(parseInt(b.id));
      const e = DS.get(dd);
      if (!e) continue;
      e.n++;
      tn++;
      if (T[b.t].c === "Житлова") e.p += 5;
      const ct = CT[T[b.t].c] || T[b.t].c, nm = T[b.t].n;
      e.c[ct] = (e.c[ct] || 0) + 1;
      e.t[nm] = (e.t[nm] || 0) + 1;
    }
    DS.avg = tn / (ta || 1);
  }
  const e = DS.get(d) || { n: 0, p: 0, a: 1, c: {}, t: {} },
    z = DCL.find((c) => c.d == d),
    k = z ? z.k : (YK[i] || "res"),
    zk = ZK[k] || ZK.res,
    r = e.n / (e.a || 1) / (DS.avg || 1),
    dens = r > 1.25 ? "висока" : r < .75 ? "низька" : "середня",
    cats = Object.entries(e.c).sort((a, b) => b[1] - a[1]).slice(0, 5).map((
      [c, v],
    ) => "<span>" + c + "</span><b>" + v + "</b>").join(""),
    top = Object.entries(e.t).filter((x) =>
      !["Житловий будинок", "Халупа", "Садиба заможних"].includes(x[0])
    ).sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0] + " ×" + x[1])
      .join(", ");
  return '<div class="tt-h"><i class="tt-dot" style="background:' + zk[1] +
    '"></i>' + (z ? z.n : zk[0]) + '</div><div class="tt-s">' + zk[0] +
    '</div><div class="tt-p">' + (KD[k] || "") + "</div>" +
    '<div class="tt-g"><span>Будівель</span><b>' + e.n +
    "</b><span>Мешканців</span><b>≈ " + e.p + "</b><span>Забудова</span><b>" +
    dens + "</b></div>" +
    (cats
      ? '<div class="tt-sec">За категоріями</div><div class="tt-g">' + cats +
        "</div>"
      : "") +
    (top
      ? '<div class="tt-sec">Найчастіше</div><div class="tt-p">' + top +
        "</div>"
      : "");
}
function layerHover(x, y) {
  if (F.ugr && UG) {
    for (const c of UG.ch) {
      if (Math.hypot(c.x - x, c.y - y) < c.r + 2) {
        HV = { t: "uc", c };
        return "<b>" + UGN[c.k][0] + "</b><br><i>Підземелля</i><br>" +
          UGN[c.k][1];
      }
    }
    for (const s of UG.tn) {
      for (let i = 0; i < s.length - 1; i++) {
        if (segD([x, y], s[i], s[i + 1]) < 4) {
          HV = { t: "ut", s };
          return "<b>" +
            ({
              main: "Головний колектор",
              ring: "Кільцевий колектор",
              br: "Бічний хід",
            }[s.k] || "Тунель") + "</b><br><i>Підземелля</i><br>" +
            ({
              main: "Іде під вулицею до воріт: стоки й потайні ходи.",
              ring: "Обводить місто під кварталами й сполучає колектори.",
              br: "Вузький хід до підземної кімнати.",
            }[s.k] || "");
        }
      }
    }
    return "<b>Порода</b><br><i>Підземелля</i><br>Тут немає ходів.";
  }
  if (F.lbl && Y.length) {
    let id = -1;
    for (let i = 0; i < Y.length; i++) {
      if (pip(Y[i], x, y)) {
        id = i;
        break;
      }
    }
    if (id < 0) {
      let bd = 22;
      for (let i = 0; i < YC.length; i++) {
        const d = Math.hypot(YC[i][0] - x, YC[i][1] - y);
        if (d < bd) {
          bd = d;
          id = i;
        }
      }
    }
    if (id >= 0) {
      HV = { t: "d", d: YD[id] };
      return distInfo(YD[id], id);
    }
  }
  if (F.mag) {
    let nn = null, nd = 10;
    for (const n of mnodes()) {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < nd) {
        nd = d;
        nn = n;
      }
    }
    if (nn) {
      HV = { t: "mn", n: nn };
      return "<b>" + nn.i[0] + "</b><br><i>Вузол сили · " +
        Math.round(nn.i[2] / 1.1 * 100) + "%</i><br>" + nn.i[1];
    }
    const m = mana(x, y);
    HV = { t: "mp", x, y };
    return "<b>Мана: " + Math.round(m * 100) + "%</b><br><i>" + (m < .15
      ? "Звичайна зона"
      : m < .4
      ? "Слабке магічне тло"
      : m < .7
      ? "Підвищена мана"
      : "Магічний вузол") +
      "</i><br>" + (m < .15
        ? "Без бонусів, чари стабільні."
        : m < .4
        ? "Зілля настоюються швидше, закляття трохи сильніші."
        : m < .7
        ? "Закляття сильніші, можливі дивні явища; потрібні обереги."
        : "Чари потужні й нестабільні: сплески, портали, аномалії.");
  }
  return null;
}
