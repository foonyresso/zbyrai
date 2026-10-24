// Атлас 2.0: конвеєр генерації. Кожна стадія додає свої шари до світу. Детерміновано від seed + параметрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  // річкові долини: русло знижує рельєф, тож річка стає частиною ландшафту (світлотінь, схили доріг)
  function carveValleys(T, H) {
    let mx = 1; for (let i = 0; i < H.acc.length; i++) if (H.acc[i] > mx) mx = H.acc[i];
    for (let i = 0; i < H.river.length; i++) if (H.river[i]) T.elev[i] -= 0.012 + 0.035 * Math.sqrt(H.acc[i] / mx);
    return true;
  }
  // кроки конвеєра з назвами для смуги завантаження; run(ctx) виконує крок, ctx — проміжний стан
  const STEPS = [
    { id: 'terrain', label: 'Ландшафт', run: c => { c.T = A.terrain(c.p); } },
    { id: 'hydrology', label: 'Річки й озера', run: c => { c.H = A.hydrology(c.p, c.T); carveValleys(c.T, c.H); } },
    { id: 'climate', label: 'Клімат і біоми', run: c => {
      const { p, T, H } = c, C = A.climate(p, T, H);
      c.world = { version: 1, params: p, w: p.w, h: p.h, sea: T.sea, height: T.height, elev: T.elev, land: T.land, ocean: T.ocean, lake: H.lake, river: H.river, acc: H.acc, down: H.down, rivers: H.rivers, lakes: H.lakes, temp: C.temp, moist: C.moist, bio: C.bio, waterDist: C.waterDist, riverThr: H.riverThr };
    } }
  ];
  const STAGE_LABEL = { politics: 'Провінції й регіони', settlements: 'Міста й села', roads: 'Дороги', landmarks: 'Місця за містами', searoutes: 'Морські шляхи', seas: 'Назви морів і океанів', danger: 'Рівні й небезпека', sites: 'Локації й монстри' };
  const steps = () => STEPS.concat((A.stages || []).map(f => ({ id: f.name, label: STAGE_LABEL[f.name] || f.name, run: c => f(c.world) })));
  // приблизна частка часу кроків (за заміром на середній карті), для відсотків
  const WEIGHT = { terrain: 6, hydrology: 8, climate: 3, politics: 42, settlements: 8, roads: 14, searoutes: 3, seas: 3, danger: 8, sites: 8 };
  function generate(input) { const c = { p: A.Params.normalize(input) }; for (const st of steps()) st.run(c); return c.world; }
  // те саме по кроках, з поверненням керування браузеру між ними: onProgress(частка 0..1, назва кроку) встигає перемалюватись
  async function generateAsync(input, onProgress) {
    const c = { p: A.Params.normalize(input) }, list = steps(), total = list.reduce((a, s) => a + (WEIGHT[s.id] || 5), 0); let done = 0;
    const tick = () => new Promise(r => setTimeout(r, 0));
    for (const st of list) { if (onProgress) { if (onProgress(done / total, st.label) === false) return null; await tick(); } st.run(c); done += WEIGHT[st.id] || 5; }
    if (onProgress) onProgress(1, 'Готово');
    return c.world;
  }
  A.generateAsync = generateAsync;
  A.generate = generate;
})();
