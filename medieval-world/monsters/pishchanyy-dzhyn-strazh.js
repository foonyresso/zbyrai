Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-dzhyn-strazh",
  name: "Піщаний джин-страж",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 324,
  lore: {
    description: "Дух.",
    behavior: "Зустрічається: пустельні храми.",
    abilities: ["піщані леза", "вихори", "короткочасна невразливість"],
  },
});
