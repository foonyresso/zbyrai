Atlas.registerMonster({
  format: 2,
  id: "moroznyy-dzygar",
  name: "Морозний дзиґар",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 521,
  lore: {
    description: "Маленький звір із крижаним спіральним панциром.",
    behavior: "Замерзлі озера.",
    abilities: ["крутиться на місці й розлітається крижаними уламками"],
  },
});
