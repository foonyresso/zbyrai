Atlas.registerMonster({
  format: 2,
  id: "kraken-chornykh-techiy",
  name: "Кракен чорних течій",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 270,
  lore: {
    description: "Морський гігант.",
    behavior: "Зустрічається: темні океанічні жолоби.",
    abilities: ["щупальця", "водяні вирви", "затоплення арени"],
  },
});
