Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-krokodyl",
  name: "Болотяний крокодил",
  kind: "monster",
  nature: "threat",
  variants: ["болотяний крокодил", "болотяний крокодил-людожер"],
  spawn: { biomes: ["lake", "swamp", "jungle"], worlds: "all" },
  order: 334,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: болотяний крокодил, болотяний крокодил-людожер.",
    behavior: "Зустрічається: болота, річки; тропічні болота.",
    abilities: ["ривок із води", "захоплення щелепами"],
  },
});
