Atlas.registerMonster({
  format: 2,
  id: "mandrivnyy-tron",
  name: "Мандрівний Трон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 753,
  lore: {
    description: "Королівський трон на восьми коренеподібних ногах, навантажений уламками власного замку.",
    behavior: "Блукає руїнами забутих столиць.",
    abilities: ["захоплює двері й ворота навколо арени, змінюючи проходи та перетворюючи стіни на рухомі барикади"],
  },
});
