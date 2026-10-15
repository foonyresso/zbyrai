Atlas.registerMonster({
  format: 2,
  id: "sontsehryz",
  name: "Сонцегриз",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "wasteland"], worlds: "all" },
  order: 844,
  lore: {
    description: "Гігантська істота з золотих шестикутних лусок і порожньої пащі, що нагадує розкриту браму.",
    behavior: "З'являється на вершинах гірських храмів під час сонячних затемнень.",
    abilities: ["затуляє сонце своїм тілом, поступово охолоджуючи арену, а потім випускає накопичене світло вузькими променями"],
  },
});
