// Симулятор підземель: завантаження баз із файлів. Читає кожен файл medieval-world/monsters/*.js і dungeons/*.js за реєстром
// (registry.js), а також dungeon-sim/room-kinds/*.js за списком manifest.js: нічого не вставляє в код, новий файл зʼявляється сам.
// Працює й зі сторінки з диска (теги script).
(function (g) {
  'use strict';
  const list = [], dungeons = [], kinds = [], A = g.Atlas || (g.Atlas = {});
  A.registerMonster = m => { list.push(m); };
  A.registerDungeon = d => { dungeons.push(d); };
  for (const k of ['registerWorld', 'registerBiome']) if (!A[k]) A[k] = () => {};
  g.DungeonRooms = { register: a => { for (const k of a) kinds.push(k); } };
  const load = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  const row = d => ({ id: d.id, name: d.name, anchor: d.anchor && d.anchor.type, rooms: d.size.rooms, levels: d.size.levels, length: d.size.length, area: d.size.area, danger: d.danger === undefined ? 1 : d.danger, inhabitants: d.inhabitants || [], worlds: (d.spawn && d.spawn.worlds) || 'all', monsterIds: d.monsters || [], desc: (d.lore && d.lore.description) || '', sim: d.sim || null });
  g.DungeonMonsters = {
    list, kinds,
    ready: (async () => {
      if (await load('../medieval-world/registry.js')) {
        const man = A.manifest || {};
        await Promise.all([].concat(man.monsters || [], man.dungeons || []).map(p => load('../medieval-world/' + p)));
      }
      if (await load('./room-kinds/manifest.js')) await Promise.all((g.DungeonRoomFiles || []).map(f => load('./room-kinds/' + f)));
      const C = g.DungeonCore; if (C) { C.setMonsters(list); C.setRoomKinds(kinds); if (dungeons.length) C.setTypes(dungeons.slice().sort((a, b) => (a.order === undefined ? 100 : a.order) - (b.order === undefined ? 100 : b.order) || (a.id < b.id ? -1 : 1)).map(row)); }
      return list.length;
    })(),
  };
})(window);
