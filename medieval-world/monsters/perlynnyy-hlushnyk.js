Atlas.registerMonster({
  format: 2,
  id: "perlynnyy-hlushnyk",
  name: "Перлинний Глушник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 824,
  lore: {
    description: "Велетенська двостулкова істота, прикріплена до підводної дзвіниці, з перламутровими ребрами та темною щілиною між стулками.",
    behavior: "Ховається в затоплених гаванях.",
    abilities: ["різко змикає мушлю, створюючи тискову хвилю, що оглушує істот і руйнує підводні споруди"],
  },
});
