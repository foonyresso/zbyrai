Atlas.registerMonster({
  format: 2,
  id: "knyaz-rozbytoyi-materiyi",
  name: "Князь розбитої матерії",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 458,
  lore: {
    description: "Багатогранний титан із плаваючих уламків.",
    behavior: "Пустеля уламкових монолітів.",
    abilities: ["розділяє своє тіло на небезпечні фрагменти, які атакують окремо, а потім зливаються знову"],
  },
});
