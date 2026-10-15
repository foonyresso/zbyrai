/* Світ «Нескінченний»: стандарт, відкривається за замовчуванням. Працює в основному полотні Атласу (runner: builtin). Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "infinite",
  name: "Нескінченний (стандарт)",
  order: 0,
  default: true,
  runner: "builtin",
  description: "Нескінченний світ: міста, села, хутори, чотири типи доріг, моря й річки; генерується під час руху.",
  biomes: { allow: ["grass", "snow", "desert", "swamp"] },
});
