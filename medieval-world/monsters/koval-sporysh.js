Atlas.registerMonster({
  format: 2,
  id: "koval-sporysh",
  name: "Коваль-Спориш",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 793,
  lore: {
    description: "Невеликий гуманоїд із трав’яним тілом, насіннєвою головою та важким молотом із кореня.",
    behavior: "Мешкає в зарослих кузнях.",
    abilities: ["під час сутички підправляє обладунок сусідніх істот, зміцнюючи їхні пошкоджені пластини, доки його не відігнати"],
  },
});
