// Атлас 2.0: потреби поселень. Норми на людину за добу (скромні, без роздутих чисел); виробничі потреби поки не враховано.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const NORMS = { food: 0.1, water: 0.05, wood: 0.02 }; // 1 одиниця їжі годує 10 людей на добу; води й дров потрібно менше
  const NAMES = { food: 'Їжа', water: 'Вода', wood: 'Дрова', stone: 'Камінь', ore: 'Руда й копалини', herbs: 'Трави й збирання', hide: 'Шкури й хутро' };
  const need = pop => { const o = {}; for (const k in NORMS) o[k] = Math.round(pop * NORMS[k] * 10) / 10; return o; };
  // як далеко (км) поселення «захоплює» точки ресурсів: чим більше, тим ширше
  const REACH_KM = { capital: 14, regional: 10, town: 7, village: 4.5, hamlet: 3 };
  A.Needs = { NORMS, NAMES, need, REACH_KM };
})();
