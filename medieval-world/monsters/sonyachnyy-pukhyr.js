Atlas.registerMonster({
  format: 2,
  id: "sonyachnyy-pukhyr",
  name: "Сонячний Пухир",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 925,
  lore: {
    description: "Крихітна літаюча кулька з жовтого світла та тонкою оболонкою, схожою на скло.",
    behavior: "Літає над сонячними галявинами та кам'яними колами.",
    abilities: ["збирає сонячні промені й випускає їх короткими спалахами, освітлюючи темні проходи, але засліплюючи всіх поблизу"],
  },
});
