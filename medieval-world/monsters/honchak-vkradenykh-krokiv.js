Atlas.registerMonster({
  format: 2,
  id: "honchak-vkradenykh-krokiv",
  name: "Гончак Вкрадених Кроків",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 852,
  lore: {
    description: "Хижак із чотирма задніми лапами та однією великою передньою кінцівкою, вкритий сірою повстю.",
    behavior: "Полює на стежках між безмовними соснами.",
    abilities: ["поглинає звуки пересування й прискорюється щоразу, коли гравець робить крок, але завмирає, якщо поблизу хтось нерухомий"],
  },
});
