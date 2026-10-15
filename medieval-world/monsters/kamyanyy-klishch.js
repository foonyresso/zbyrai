Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-klishch",
  name: "Кам'яний кліщ",
  kind: "monster",
  nature: "magic",
  variants: ["літаючий кам’яний кліщ", "малий кам’яний кліщ"],
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 408,
  lore: {
    description: "Магічна істота. Об'єднує схожих істот: літаючий кам’яний кліщ, малий кам’яний кліщ.",
    behavior: "Зустрічається: гірські руїни; гірські стежки.",
    abilities: ["коротко зависає в повітрі", "б’є кам’яними щелепами", "слабкий удар", "маскується під камінь"],
  },
});
