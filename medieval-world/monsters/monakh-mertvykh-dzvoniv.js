Atlas.registerMonster({
  format: 2,
  id: "monakh-mertvykh-dzvoniv",
  name: "Монах Мертвих Дзвонів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 767,
  lore: {
    description: "Висока фігура в багатошаровому полотняному одязі, з порожнистою бронзовою головою-дзвоном і руками, складеними як для молитви.",
    behavior: "Бродить дзвіницею підземних катакомб.",
    abilities: ["поглинає звуки навколо, зупиняючи звукові атаки й послаблюючи заклинання, а потім вивільняє накопичену тишу ударною хвилею"],
  },
});
