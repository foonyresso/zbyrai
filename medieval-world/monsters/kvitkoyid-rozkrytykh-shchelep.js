Atlas.registerMonster({
  format: 2,
  id: "kvitkoyid-rozkrytykh-shchelep",
  name: "Квіткоїд Розкритих Щелеп",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 878,
  lore: {
    description: "Рослинний хижак із товстим стеблом, чотирма пелюстками-щелепами й корінням, що ходить на кінчиках.",
    behavior: "Росте в садах покинутих алхіміків.",
    abilities: ["стуляє пелюстки навколо гравця, якщо той наступає на квіткові мітки, але відкривається після сильного удару по стеблу"],
  },
});
