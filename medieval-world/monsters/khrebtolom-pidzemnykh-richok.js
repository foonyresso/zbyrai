Atlas.registerMonster({
  format: 2,
  id: "khrebtolom-pidzemnykh-richok",
  name: "Хребтолом Підземних Річок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 765,
  lore: {
    description: "Довге низьке чудовисько з десятків вапнякових хребців, лапами, схожими на кирки, і порожнім тулубом, крізь який проходить вода.",
    behavior: "Ховається в каньйонах підземних річок.",
    abilities: ["викривляє підземні русла, перетворюючи потоки на вертикальні водоспади, що зносять усе на своєму шляху"],
  },
});
