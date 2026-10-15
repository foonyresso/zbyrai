Atlas.registerMonster({
  format: 2,
  id: "trychovnovyy-pereviznyk",
  name: "Тричовновий Перевізник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 768,
  lore: {
    description: "Чудернацька істота з одного плаща з очерету, трьох зчеплених човнів та рук-весел.",
    behavior: "Мешкає біля затонулого переправного двору.",
    abilities: ["роз’єднує човни й перекриває ними водні маршрути, а під час атаки гребе одразу в трьох напрямках"],
  },
});
