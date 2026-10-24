/* Закладини: іконки будівель і інструментів (inline SVG, 24×24, штрихові). */
(function (root) {
  'use strict';
  const P = {
    select: 'M5 3l12 8-5 1 3 6-3 1-3-6-4 3z', demolish: 'M6 6l12 12M18 6 6 18',
    house: 'M4 11 12 4l8 7v9H4zM10 20v-5h4v5', farm: 'M12 21V8M12 8c-3-1-4-3-4-5 3 0 4 2 4 5zM12 8c3-1 4-3 4-5-3 0-4 2-4 5zM12 14c-3-1-4-3-4-5M12 14c3-1 4-3 4-5',
    lumber: 'M12 3 6 12h4l-4 6h12l-4-6h4zM12 18v3', quarry: 'M3 19 8 9l4 4 3-6 6 12z', mine: 'M5 6c4-3 10-3 14 0M12 5v15M9 20h6',
    fisher: 'M3 12c4-6 10-6 14 0-4 6-10 6-14 0zM17 12l4-4v8zM7 11h.01', herbalist: 'M5 19C5 9 11 5 20 4c0 9-4 15-13 15zM5 19c3-5 6-8 10-10',
    workshop: 'M4 9h12l3 3h-4l-2 2v4H8v-4l-2-2H4z', shop: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0', tavern: 'M6 7h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM15 9h3a2 2 0 0 1 0 5h-3',
    warehouse: 'M3 8l9-4 9 4v11H3zM3 8l9 4 9-4M12 12v7', yard: 'M3 6h3l2 9h10l2-7H7M9 20h.01M17 20h.01', guard: 'M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z',
  };
  root.Zak = root.Zak || {};
  root.Zak.Icons = { svg: id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[id] || P.house}"/></svg>` };
})(globalThis);
