Atlas.registerMonster({
  format: 2,
  id: "lytsar-perevernutoho-pylu",
  name: "Лицар Перевернутого Пилу",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 851,
  lore: {
    description: "Елітний воїн у панцирі з багряних піщаникових кубів, із плащем, що тече вертикально вгору.",
    behavior: "Охороняє гробниці в каньйоні з перевернутими скелями.",
    abilities: ["піднімає пил із землі й формує з нього тимчасові щити, а під час випадів ковзає крізь піщані шари"],
  },
});
