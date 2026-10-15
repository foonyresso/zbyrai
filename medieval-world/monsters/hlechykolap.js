Atlas.registerMonster({
  format: 2,
  id: "hlechykolap",
  name: "Глечиколап",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 789,
  lore: {
    description: "Панцирне створіння з тулубом у формі глиняного глечика й лапами, схожими на розбитий посуд.",
    behavior: "Ховається серед руїн гончарного села.",
    abilities: ["тупотить і створює навколо себе рухомі глиняні уламки, які відволікають і ранять ворога"],
  },
});
