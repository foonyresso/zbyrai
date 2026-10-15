Atlas.registerMonster({
  format: 2,
  id: "krystalnyy-skorpion",
  name: "Кристальний скорпіон",
  kind: "mini-boss",
  nature: "magic",
  variants: ["кристальний скорпіон", "скорпіон-кристал"],
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 302,
  lore: {
    description: "Комаха. Об'єднує схожих істот: кристальний скорпіон, скорпіон-кристал.",
    behavior: "Зустрічається: геодні печери; геоди.",
    abilities: ["кристалічні шипи", "отрута", "броньований панцир", "відбиття світлових атак"],
  },
});
