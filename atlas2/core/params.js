// Атлас 2.0: параметри й межі. Усе детерміноване від seed + параметрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const SIZES = { small: [450, 300], medium: [800, 540], large: [1150, 780] }; // клітин; 1 клітина = 250 м
  const DIMS = { main: { name: 'Основний світ' }, astrakor: { name: 'Астракор' } }; // виміри: основний (материк і моря) та Астракор (материк на коренях дерева в космосі)
  const DEF = { seed: 'atlas', dimension: 'main', size: 'medium', provinces: 12, regionsPerProvince: 8, density: 1, rugged: 1, riverDensity: 1, landFrac: 0, lakeDepth: 0.014, lakeFlow: 40, kmPerCell: 0.25, infinite: true, bx: 0, by: 0 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function normalize(inp) {
    const p = Object.assign({}, DEF, inp || {});
    p.seed = String(p.seed || DEF.seed);
    if (!SIZES[p.size]) p.size = 'medium';
    [p.w, p.h] = SIZES[p.size];
    if (!DIMS[p.dimension]) p.dimension = 'main';
    const ast = p.dimension === 'astrakor';
    delete p.worldType; // «Тип світу» прибрано: завжди один материк; поле зі старих збережень і посилань ігнорується
    p.provinces = ast ? clamp(Math.round(inp && inp.provinces != null ? p.provinces : 64), 50, 100) : clamp(Math.round(p.provinces), 2, 50);
    if (ast) { if (!(inp && inp.lakeDepth != null)) p.lakeDepth = 0.03; if (!(inp && inp.lakeFlow != null)) p.lakeFlow = 200; } // на куполі менше й менші озера
    p.regionsPerProvince = clamp(Math.round(p.regionsPerProvince), 2, 24);
    p.infinite = p.infinite !== false && p.infinite !== 'false' && p.infinite !== 0 && !ast; // безкінечний основний світ: поруч з материком генеруються сусідні (core/blocks.js); в Астракорі завжди один материк
    p.bx = Math.round(+p.bx || 0); p.by = Math.round(+p.by || 0); // номер блока-материка в безкінечному світі (0,0 = домашній); задає лише рівні за відстанню від центру світу
    p.density = clamp(+p.density, 0.3, 2.2); p.rugged = clamp(+p.rugged, 0, 2); p.riverDensity = clamp(+p.riverDensity, 0.1, 2.5);
    if (!(p.landFrac > 0)) p.landFrac = 0.3;
    p.landFrac = clamp(+p.landFrac, 0.15, 0.7);
    return p;
  }
  const isVoid = p => !!p && p.dimension === 'astrakor'; // за краєм не море, а космос: без океанів, портів і морських шляхів
  A.Params = { SIZES, DEF, DIMS, normalize, isVoid };
})();
