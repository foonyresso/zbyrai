Atlas.registerMonster({
  format: 2,
  id: "zolotysta-ryba-likhtar",
  name: "Золотиста риба-ліхтар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 701,
  lore: {
    description: "Невелика риба з яскравим світлом на хвості.",
    behavior: "Темні лагуни.",
    abilities: ["створює фальшиві вогники, які відволікають від справжньої загрози"],
  },
});
