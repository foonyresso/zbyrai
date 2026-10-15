Atlas.registerMonster({
  format: 2,
  id: "khorovod-burevisnykh-vezh",
  name: "Хоровод Буревісних Веж",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 740,
  lore: {
    description: "Сім рухомих кам’яних стовпів із блискавичними жилами замість облич.",
    behavior: "Охороняють високогірне Плато Громових Кіл.",
    abilities: ["кружляють навколо цілі, передають електричні розряди між собою та раптово міняються місцями"],
  },
});
