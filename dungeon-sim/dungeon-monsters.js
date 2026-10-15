// Симулятор підземель: завантаження бази монстрів. Читає кожен файл medieval-world/monsters/*.js за реєстром (registry.js),
// нічого не вставляючи в код: новий монстр у папці з'являється в підземеллях без правок. Працює й зі сторінки з диска (теги script).
(function (g) {
  'use strict';
  const list = [], A = g.Atlas || (g.Atlas = {});
  A.registerMonster = m => { list.push(m); };
  for (const k of ['registerWorld', 'registerBiome', 'registerDungeon']) if (!A[k]) A[k] = () => {};
  const load = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  g.DungeonMonsters = {
    list,
    ready: (async () => {
      if (!await load('../medieval-world/registry.js')) return 0;
      await Promise.all(((A.manifest && A.manifest.monsters) || []).map(p => load('../medieval-world/' + p)));
      if (g.DungeonCore) g.DungeonCore.setMonsters(list);
      return list.length;
    })(),
  };
})(window);
