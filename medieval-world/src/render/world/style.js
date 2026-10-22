/* ---- оформлення виміру на спільному рушії: тема (море, суша, дороги, річки) з worlds/continent/render/themes.js; без теми діє стандартний вигляд ---- */
const WSTYLE = {
  theme: null,
  id: null,
  river: "#a8cde3",
  riverEdge: "#6f9fbd",
  base: JSON.parse(JSON.stringify({ ROAD_STYLE, COAST })),
  /* id теми з preset.theme виміру; null або невідомий id повертає стандартний вигляд */
  apply(id) {
    const T = id && RealmMap.Themes[id] || null, B = this.base;
    this.theme = T;
    this.id = T ? id : null;
    if (T) RealmMap.Palette.setTheme(id);
    for (const k in PCL) delete PCL[k];
    for (const k in ROAD_STYLE) ROAD_STYLE[k].splice(0, ROAD_STYLE[k].length, ...B.ROAD_STYLE[k]);
    COAST.splice(0, 3, ...B.COAST);
    this.river = "#a8cde3";
    this.riverEdge = "#6f9fbd";
    if (T) {
      const r = T.roads;
      ROAD_STYLE.major[1] = r.major; ROAD_STYLE.major[5] = r.casing;
      ROAD_STYLE.medium[1] = r.medium; ROAD_STYLE.medium[5] = r.casing;
      ROAD_STYLE.minor[1] = ROAD_STYLE.trail[1] = r.minor;
      COAST.splice(0, 3, ...hx(rgbHex(T.sea[3], .85)));
      this.river = T.lake;
      this.riverEdge = T.river;
    }
    if (typeof WLD !== "undefined" && WLD) { WLD.t.clear(); WLD.gl = null; WLD.dn = null; }
  },
};
function rgbHex(hex, f) {
  return "#" + hx(hex).map((v) => Math.round(v * f).toString(16).padStart(2, "0")).join("");
}
