Atlas.registerMonster({
  format: 2,
  id: "snihovyy-naperstok",
  name: "Сніговий Наперсток",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 927,
  lore: {
    description: "Крихітна істота у формі білого конуса з двома чорними очима й чотирма короткими ніжками.",
    behavior: "Живе серед заметених кам'яних огорож.",
    abilities: ["заривається в пухкий сніг і вискакує перед гравцем, залишаючи маленькі замети, що сповільнюють рух"],
  },
});
