Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-veselkovykh-mostiv",
  name: "Пожирач веселкових мостів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 468,
  lore: {
    description: "Крилатий хижак із довгим дзьобом.",
    behavior: "Небесні провалля.",
    abilities: ["перекушує магічні переправи й кидає гравця на нижні рівні арени"],
  },
});
