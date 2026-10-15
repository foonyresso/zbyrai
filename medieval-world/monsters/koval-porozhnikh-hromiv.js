Atlas.registerMonster({
  format: 2,
  id: "koval-porozhnikh-hromiv",
  name: "Коваль Порожніх Громів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "volcanic"], worlds: "all" },
  order: 850,
  lore: {
    description: "Широкоплечий гуманоїд із темного заліза, у грудях якого обертається порожнє колесо.",
    behavior: "Мешкає в кузні на скелі, що зависла серед грозових хмар.",
    abilities: ["кує блискавки ударами молота об власні ребра, а відкинуті громові згустки залишають на землі заряджені металеві уламки"],
  },
});
