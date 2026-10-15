Atlas.registerMonster({
  format: 2,
  id: "matrona-ostannoho-snihopadu",
  name: "Матрона Останнього Снігопаду",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "tundra", "snow", "grass"], worlds: "all" },
  order: 838,
  lore: {
    description: "Величезна шестинога постать із білих дерев'яних плит, підвішених у повітрі навколо порожньої грудної клітки.",
    behavior: "Володарює у замерзлій долині, де сніг падає навіть угору.",
    abilities: ["викликає сніг, який поступово заморожує самі звуки, позбавляючи гравця можливості чути наближення атак"],
  },
});
