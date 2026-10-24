/* Розкладка міста: розміри світу, дороги, стіни з брамою, будівлі (20 домів + громадські), ставок, парк, поля, точки призначення.
   Без DOM, детермінована від зерна; для шляхів будує сітку перешкод (Mech.Pathgrid). Глобал SS.Layout / module.exports. */
(function (root) {
  'use strict';
  const SS = root.SS = root.SS || {};
  const W = 1120, H = 800;
  const WALL = { x0: 70, x1: 1050, y0: 80, y1: 690, gate: { x: 560, y: 690, half: 24 } };
  const PLAZA = { x: 560, y: 405, rx: 92, ry: 56 };
  const POND = { x: 950, y: 150, rx: 56, ry: 30 };
  const PARK = { x0: 860, y0: 92, x1: 1034, y1: 232 };
  const FIELD = { x0: 270, y0: 580, x1: 500, y1: 676 };
  // стовпчики дорожньої мережі: [x0,y0,x1,y1,ширина]
  const ROADS = [[560, 128, 560, 800, 22], [84, 405, 1036, 405, 16], [96, 248, 1024, 248, 10], [96, 535, 1024, 535, 10], [680, 640, 1024, 640, 10]];
  // типи споруд: w,d — габарит для зіткнень (по низу), де d — глибина
  const SPECIAL = [
    { type: 'mayor', x: 560, y: 205, w: 62, d: 10 }, { type: 'church', x: 400, y: 232, w: 62, d: 10 },
    { type: 'tavern', x: 700, y: 385, w: 58, d: 10 }, { type: 'shop', x: 410, y: 385, w: 46, d: 10 },
    { type: 'smithy', x: 470, y: 520, w: 52, d: 10 }, { type: 'barn', x: 190, y: 622, w: 60, d: 10 },
  ];
  // 19 домів (20-та оселя — дім старости): рядки уздовж вулиць
  const HOUSE_XY = [
    [135, 232], [205, 232], [275, 232], [690, 232], [760, 232], [820, 232],
    [135, 380], [205, 380], [275, 380], [790, 380], [860, 380], [930, 380],
    [135, 520], [205, 520], [275, 520], [650, 520], [720, 520], [790, 520],
    [720, 625],
  ];
  const rect = (x, y, w, d) => ({ x0: x - w / 2, y0: y - d, x1: x + w / 2, y1: y });

  function build(seed) {
    const R = root.Mech.Rng.stream(seed, 'layout');
    const pick = a => a[Math.floor(R() * a.length)];
    const blocks = [], ells = [], buildings = [], houses = [];
    const add = (b) => { blocks.push(b); return b; };
    // стіни: північна, західна, східна, південна з проломом для брами
    add({ x0: WALL.x0 - 8, y0: WALL.y0 - 24, x1: WALL.x1 + 8, y1: WALL.y0 + 2, wall: 1 });
    add({ x0: WALL.x0 - 8, y0: WALL.y0, x1: WALL.x0 + 8, y1: WALL.y1, wall: 1 });
    add({ x0: WALL.x1 - 8, y0: WALL.y0, x1: WALL.x1 + 8, y1: WALL.y1, wall: 1 });
    const gx0 = WALL.gate.x - WALL.gate.half - 28, gx1 = WALL.gate.x + WALL.gate.half + 28;
    add({ x0: WALL.x0 - 8, y0: WALL.y1 - 26, x1: gx0, y1: WALL.y1, wall: 1 });
    add({ x0: gx1, y0: WALL.y1 - 26, x1: WALL.x1 + 8, y1: WALL.y1, wall: 1 });
    // вежі брами (вузький прохід між ними)
    add({ x0: WALL.gate.x - 52, y0: WALL.y1 - 26, x1: WALL.gate.x - WALL.gate.half, y1: WALL.y1 + 2, wall: 1 });
    add({ x0: WALL.gate.x + WALL.gate.half, y0: WALL.y1 - 26, x1: WALL.gate.x + 52, y1: WALL.y1 + 2, wall: 1 });
    for (const s of SPECIAL) { const b = { ...s, door: { x: s.x, y: s.y + 6 } }; buildings.push(b); add(rect(s.x, s.y, s.w, s.d)); }
    HOUSE_XY.forEach(([x, y], i) => {
      const hw = pick([15, 16, 17, 18]);
      const h = { id: i, type: 'house', x, y, hw, w: 2 * hw + 2, d: 8, door: { x, y: y + 6 }, look: { wall: pick(['#e6d5b4', '#d9b98a', '#e8c9c0', '#c9d6c0', '#d8d0e0', '#b9c4d4']), roof: pick(['#b8452f', '#3a62a8', '#4c8a4a', '#8a5a2b', '#7a45a8', '#c0702f']), hw, chim: R() < 0.7, flowers: R() < 0.5, shutters: R() < 0.5, timber: R() < 0.3 } };
      houses.push(h); buildings.push(h); add(rect(x, y, h.w, h.d));
    });
    // колодязь, фонтан, ставок
    const well = { x: 470, y: 462 }; add(rect(well.x, well.y, 14, 6));
    ells.push({ x: PLAZA.x, y: PLAZA.y, rx: 26, ry: 10 }, { x: POND.x, y: POND.y, rx: POND.rx, ry: POND.ry });
    // дерева: у вільних місцях між кварталами, у парку й навколо міста; не на дорогах і будівлях
    const onRoad = (x, y, pad) => ROADS.some(r => { const x0 = Math.min(r[0], r[2]) - r[4] / 2 - pad, x1 = Math.max(r[0], r[2]) + r[4] / 2 + pad, y0 = Math.min(r[1], r[3]) - r[4] / 2 - pad, y1 = Math.max(r[1], r[3]) + r[4] / 2 + pad; return x >= x0 && x <= x1 && y >= y0 && y <= y1; });
    const free = (x, y, pad) => !onRoad(x, y, pad) && !blocks.some(b => x > b.x0 - pad - 8 && x < b.x1 + pad + 8 && y > b.y0 - pad - 12 && y < b.y1 + pad + 6) &&
      !ells.some(e => Math.pow((x - e.x) / (e.rx + pad + 6), 2) + Math.pow((y - e.y) / (e.ry + pad + 6), 2) < 1) &&
      !(Math.pow((x - PLAZA.x) / (PLAZA.rx + 8), 2) + Math.pow((y - PLAZA.y) / (PLAZA.ry + 8), 2) < 1) &&
      !(x > FIELD.x0 - 12 && x < FIELD.x1 + 12 && y > FIELD.y0 - 6 && y < FIELD.y1 + 6);
    const trees = [];
    const tryTree = (x, y, pad) => { if (free(x, y, pad) && !trees.some(t => Math.hypot(t.x - x, t.y - y) < 20)) trees.push({ x, y, k: Math.floor(R() * 6) }); };
    for (let i = 0; i < 700 && trees.length < 90; i++) {
      const x = WALL.x0 + 14 + R() * (WALL.x1 - WALL.x0 - 28), y = WALL.y0 + 12 + R() * (WALL.y1 - WALL.y0 - 30);
      // у парку густіше, решта міста рідше
      const inPark = x > PARK.x0 && x < PARK.x1 && y > PARK.y0 && y < PARK.y1;
      if (inPark || R() < 0.14) tryTree(x, y, 6);
    }
    for (let i = 0; i < 900 && trees.length < 220; i++) { // ліс навколо міста
      const x = R() * W, y = R() * H;
      const outside = x < WALL.x0 - 14 || x > WALL.x1 + 14 || y < WALL.y0 - 26 || y > WALL.y1 + 12;
      if (outside && !onRoad(x, y, 12) && !trees.some(t => Math.hypot(t.x - x, t.y - y) < 22) && R() < (y > WALL.y1 + 12 ? 0.35 : 0.8)) trees.push({ x, y, k: Math.floor(R() * 6) });
    }
    const treeBlocks = trees.map(t => ({ x0: t.x - 4, y0: t.y - 4, x1: t.x + 4, y1: t.y, tree: 1 }));
    const circle = (cx, cy, rx, ry, n, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * 6.2832) * rx, cy + Math.sin(a0 + i / n * 6.2832) * ry]);
    const door = id => buildings.find(b => b.type === id).door;
    const spots = {
      plaza: circle(PLAZA.x, PLAZA.y, 52, 30, 10), well: circle(well.x, well.y + 4, 16, 10, 4),
      tavern: [[680, 399], [700, 402], [722, 399], [740, 402]], shop: [[390, 399], [410, 402], [430, 399]],
      church: [[380, 246], [400, 250], [420, 246], [400, 262]], mayor: [[540, 222], [560, 226], [580, 222], [560, 240]],
      smithy: [[455, 536], [480, 540], [500, 536]], barn: [[160, 640], [190, 644], [220, 640]],
      field: Array.from({ length: 12 }, (_, i) => [FIELD.x0 + 20 + (i % 4) * 56, FIELD.y0 + 20 + Math.floor(i / 4) * 28]),
      park: [[890, 120], [930, 100], [1000, 112], [880, 210], [1010, 210], [960, 225], [905, 160]],
      pond: [[890, 180], [950, 190], [1010, 175], [915, 124], [985, 118]],
      gate: [[528, 668], [592, 668], [548, 662], [572, 662]], wall: [[110, 105], [1010, 105], [110, 660], [1010, 660], [300, 108], [820, 108]],
    };
    const g = root.Mech.Pathgrid.create(W, H, 8);
    for (const b of blocks.concat(treeBlocks)) root.Mech.Pathgrid.blockRect(g, b.x0, b.y0, b.x1, b.y1);
    for (const e of ells) root.Mech.Pathgrid.blockEllipse(g, e.x, e.y, e.rx, e.ry);
    return { W, H, WALL, PLAZA, POND, PARK, FIELD, ROADS, buildings, houses, trees, well, spots, grid: g, blocks, ells, door };
  }
  SS.Layout = { W, H, WALL, PLAZA, POND, PARK, FIELD, ROADS, build };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.Layout;
})(globalThis);
