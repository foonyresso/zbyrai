Atlas.registerMonster({
  format: 2,
  id: "rozkolopazur",
  name: "Розколопазур",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 800,
  lore: {
    description: "Приземкувата ящірка з двома зчепленими броньованими частинами тіла та товстим пласким хвостом.",
    behavior: "Живе серед шаруватих скель.",
    abilities: ["під час втечі залишає задню броньовану частину як рухому перешкоду, а сама тікає в ущелину"],
  },
});
