Atlas.registerMonster({
  format: 2,
  id: "hihantska-murakha",
  name: "Гігантська мураха",
  kind: "monster",
  nature: "threat",
  variants: ["бойова мураха", "мураха-кислотник", "звичайна гігантська мураха"],
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 389,
  lore: {
    description: "Комаха. Об'єднує схожих істот: бойова мураха, мураха-кислотник, звичайна гігантська мураха.",
    behavior: "Зустрічається: лісова підстилка; підземні мурашники.",
    abilities: ["укуси", "атаки колонією", "кислотні бризки", "роз’їдання слабкої броні", "напади невеликими групами"],
  },
});
