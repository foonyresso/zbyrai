Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-kalihraf",
  name: "Кістяний Каліграф",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 769,
  lore: {
    description: "Видовжене кістяне створіння з хвостом-пером, черепом без нижньої щелепи та рухливими ребрами, що нагадують сторінки.",
    behavior: "Блукає скрипторієм у крипті старої бібліотеки.",
    abilities: ["пише у повітрі руни, які на короткий час перетворюються на фізичні пастки, стіни чи леза"],
  },
});
