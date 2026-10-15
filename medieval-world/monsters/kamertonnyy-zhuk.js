Atlas.registerMonster({
  format: 2,
  id: "kamertonnyy-zhuk",
  name: "Камертонний Жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 885,
  lore: {
    description: "Великий жук із двома металевими рогами, що утворюють вилку.",
    behavior: "Живе у шахтах із покладами чорного заліза.",
    abilities: ["вдаряє рогами об каміння, викликаючи резонанс, який руйнує крихкі блоки та тимчасово дезорієнтує супротивників"],
  },
});
