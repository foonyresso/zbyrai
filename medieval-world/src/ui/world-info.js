function wInfo(x, y) {
  const o = realmInfo(x, y) || wInfo0(x, y);
  o.d = (o.d || "") + " · Координати: X " + Math.round(x) + ", Y " +
    Math.round(y) + " (від центру " + Math.round(Math.hypot(x, y)) + ").";
  if (
    o.c === "Вода" && o.n !== "Озеро" && o.n !== "Річка" &&
    isWild(x, y)
  ) {
    o.n = "Дикий " + o.n.toLowerCase();
    o.d += " · Нічия вода далі " + Math.round(terrW(x, y) / 100) / 10 +
      " км від берега: монстри ≈ " + oceanLv(x, y)[0] + " ур., NPC немає.";
  } else if (o.c !== "Вода") {
    const h = regAt(x, y);
    if (h) {
      const pv = PV(h), pl = provLv(pv);
      o.d += " · " + (h.iso
        ? "Без окремого регіону (острів/глушина)"
        : regName(h) + (h === pv
          ? (isCap(h) ? " (столиця)" : " (окрема провінція)")
          : "") +
          ": монстри тут ≈ " + lvlAt(x, y)[0] + " ур., NPC ≈ " + lvlAt(x, y)[1] + " ур. (росте з відстанню від центру)") +
        " · " + provName(pv) + ": регіонів " + provN(pv) + ", монстри ≈ " +
        pl[0] + " ур. (від " + pv.lr[0] + " до " + pv.lr[1] + "), NPC ≈ " + pl[1] + " ур.";
    }
  }
  return o;
}
/* будинок під курсором у поселенні, коли видно кожну споруду (масштаб від .5); HVW — підсвітка для drawVillages */
var HVW = null;
function settleHit(v, x, y) {
  const st = S >= .5 && v.tier >= 0 && mkSettle(v);
  if (!st) return null;
  const lx = x - v.x, ly = y - v.y;
  for (let i = st.L.length - 1; i >= 0; i--) {
    const b = st.L[i];
    if (b.o || !T[b.t] || Math.hypot(lx - b.cx, ly - b.cy) > b.r || !pip(b.poly, lx, ly)) continue;
    HVW = { x: v.x, y: v.y, b };
    return { n: T[b.t].n, c: T[b.t].c + " · " + NAMES[v.tier] + " «" + v.name + "»", d: T[b.t].d };
  }
  return null;
}
function wInfo0(x, y) {
  HVW = null;
  if (!WLD) wsetup();
  const p = tsamp(x, y, 4);
  /* зі зменшенням масштабу значок більший за саме поселення: допуск у пікселях екрана */
  const tol = Math.max(90, 16 / S);
  for (const v of vlist(x - tol, y - tol, x + tol, y + tol)) {
    if (S < .5 && (S < .07 && v.tier < 2 || S < .045 && v.tier == 2)) continue;
    if (Math.hypot(v.x - x, v.y - y) < Math.max(v.rad, S < .5 ? 16 / S : 0)) {
      const st = mkSettle(v), hb = settleHit(v, x, y);
      if (hb) return hb;
      return {
        n: NAMES[v.tier] + " «" + v.name + "»" + (rxState(v) != "normal" ? " — " + RX_STATE_NAMES[rxState(v)] : ""),
        c: (v.tier >= 3 && isCap(v) ? "Столиця провінції" : "Поселення") + (srPort(v) ? " · Порт" : ""),
        d: (st
          ? "Стиль: " + CITY_STYLES[cityStyleOf(v)].name + " · споруд: " + st.n + " · мешканців ≈ " + st.p +
            ". Дороги ведуть до сусідніх поселень."
          : "Невелике поселення.") + (srPort(v) ? " ⚓ Порт: " + (srPort(v).river ? "річковий, виходить до моря руслом" : "на узбережжі") + ", звідси ходять морські шляхи." : "") + (RLAY.pp ? raceInfo(v) : ""),
      };
    }
  }
  const inf = " Висота ≈ " + Math.max(0, Math.round(p.E * 1000)) +
    " м · вологість " + Math.round(p.mo * 100) + "% · температура " +
    Math.round(p.tp * 100) + "%.";
  if (p.E <= 0) {
    return p.lake || !seaBody(x, y)
      ? { n: "Озеро", c: "Вода", d: "Прісна вода, риба й очерет." }
      : {
        n: p.E < -.1 ? "Океан" : "Море",
        c: "Вода",
        d: "Глибина ≈ " + Math.round(-p.E * 300) + " м.",
      };
  }
  if (p.rv > .4 || riverBank(x, y) < 0) {
    return {
      n: "Річка",
      c: "Вода",
      d: "Тече до моря, береги придатні для млинів.",
    };
  }
  if (p.E > .62) {
    return {
      n: "Засніжені вершини",
      c: "Гори",
      d: "Непрохідні без спорядження." + inf,
    };
  }
  if (p.E > .4) {
    return { n: "Гори", c: "Гори", d: "Скелі, перевали, рудні жили." + inf };
  }
  if (p.E > .28) {
    return { n: "Передгір’я", c: "Височина", d: "Пагорби, пасовиська." + inf };
  }
  if (p.fo > .5) {
    return {
      n: "Ліс",
      c: "Рослинність",
      d: "Дрова, дичина й небезпека." + inf,
    };
  }
  if (p.fa > .5) {
    return {
      n: "Рілля",
      c: "Сільгосп-угіддя",
      d: "Поля, садиби й сади." + inf,
    };
  }
  return {
    n: {
      snow: "Тундра",
      desert: "Пустеля",
      swamp: "Болото",
      grass: "Рівнина",
    }[p.bk],
    c: "Місцевість",
    d: "Вільна земля." + inf,
  };
}
