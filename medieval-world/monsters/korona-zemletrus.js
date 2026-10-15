Atlas.registerMonster({
  format: 2,
  id: "korona-zemletrus",
  name: "Корона-Землетрус",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 737,
  lore: {
    description: "Велетенська шестинога гора з базальтовими терасами, моховими садами й кам’яною короною.",
    behavior: "Блукає давніми королівськими трактами й кам’яними рівнинами.",
    abilities: ["кожен крок зсуває пагорби, розколює землю та змінює рельєф арени"],
  },
});
