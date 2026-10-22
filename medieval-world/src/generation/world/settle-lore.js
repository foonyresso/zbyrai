/* Лор поселень виміру (preset.settle): які ранги поселень існують, наскільки густо, яка частка зруйнована. Читають settlements.js (генерація) і realm-objects.js (стани). Дороги йдуть за рангом нижчого кінця, тож без великих міст великих доріг нема. */
/* max: найвищий ранг (6 столиця, 3 містечко, 2 велике село, 0 лише хутори, -1 без поселень); dens: множник густоти (0..1); ruin: частка зруйнованих і покинутих (0..1) */
const SETL = { max: 6, dens: 1, ruin: 0, names: null, roads: null };
function setSettleLore(p) {
  p = p || {};
  SETL.max = typeof p.max == "number" ? p.max : 6;
  SETL.dens = typeof p.dens == "number" ? p.dens : 1;
  SETL.ruin = typeof p.ruin == "number" ? p.ruin : 0;
  SETL.names = p.names || null;
  SETL.roads = p.roads || null;
}
