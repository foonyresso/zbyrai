Atlas.registerMonster({
  format: 2,
  id: "marmurova-kunytsya",
  name: "Мармурова Куниця",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 884,
  lore: {
    description: "Гнучкий чотириногий хижак із біло-сірими мармуровими смугами та хвостом із дрібних кубиків.",
    behavior: "Полює в палацових садах.",
    abilities: ["прослизає між декоративними статуями й відтворює їхню позу, перш ніж раптово атакувати з флангу"],
  },
});
