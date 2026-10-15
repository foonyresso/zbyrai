Atlas.registerMonster({
  format: 2,
  id: "zhaba",
  name: "Жаба",
  kind: "weak",
  nature: "threat",
  variants: ["отруйна деревна жаба", "велика жаба-бульбашник"],
  spawn: { biomes: ["jungle", "swamp"], worlds: "all" },
  order: 381,
  lore: {
    description: "Земноводне. Об'єднує схожих істот: отруйна деревна жаба, велика жаба-бульбашник.",
    behavior: "Зустрічається: джунглі; болота.",
    abilities: ["отруйний дотик", "маскування", "плюється липкими бульбашками", "сповільнює цілі"],
  },
});
