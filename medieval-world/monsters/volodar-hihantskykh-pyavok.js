Atlas.registerMonster({
  format: 2,
  id: "volodar-hihantskykh-pyavok",
  name: "Володар гігантських п’явок",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 293,
  lore: {
    description: "Болотний паразит.",
    behavior: "Зустрічається: затоплені руїни.",
    abilities: ["висмоктує життєву силу", "викликає рої п’явок", "регенерує у воді"],
  },
});
