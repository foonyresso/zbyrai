Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-lavovyy-zhuk",
  name: "Крихітний Лавовий Жук",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 922,
  lore: {
    description: "Маленький чорний жук із помаранчевими тріщинами на панцирі.",
    behavior: "Живе біля теплих тріщин згаслих вулканів.",
    abilities: ["гріє каміння під собою, залишаючи гарячі квадрати, які змушують гравця змінювати маршрут"],
  },
});
