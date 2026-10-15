Atlas.registerMonster({
  format: 2,
  id: "murakhoyid",
  name: "Мурахоїд",
  kind: "weak",
  nature: "threat",
  variants: ["гігантський мурахоїд", "золотоспинний мурахоїд"],
  spawn: { biomes: ["jungle", "forest", "taiga", "grass"], worlds: "all" },
  order: 388,
  lore: {
    description: "Звір. Об'єднує схожих істот: гігантський мурахоїд, золотоспинний мурахоїд.",
    behavior: "Зустрічається: тропічні ліси; Теплі лісові галявини.",
    abilities: ["довгий язик", "сильні кігті", "золотоспинний мурахоїд: витягує довгий язик, що прилипає до цілі"],
  },
});
