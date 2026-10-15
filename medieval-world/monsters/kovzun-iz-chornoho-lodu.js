Atlas.registerMonster({
  format: 2,
  id: "kovzun-iz-chornoho-lodu",
  name: "Ковзун із чорного льоду",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 525,
  lore: {
    description: "Плоский хижак, що пересувається без ніг.",
    behavior: "Темні льодовики.",
    abilities: ["створює під собою крижану доріжку й різко змінює напрямок"],
  },
});
