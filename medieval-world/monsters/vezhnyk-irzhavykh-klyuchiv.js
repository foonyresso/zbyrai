Atlas.registerMonster({
  format: 2,
  id: "vezhnyk-irzhavykh-klyuchiv",
  name: "Вежник Іржавих Ключів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 854,
  lore: {
    description: "Гуманоїд із довгим тулубом, складеним із замків, засувів і залізних ключів.",
    behavior: "Охороняє покинутий замок, де кожна кімната має власний замок.",
    abilities: ["відмикає закриті двері просто під час бою, випускаючи з них пастки, леза або захисні механізми"],
  },
});
