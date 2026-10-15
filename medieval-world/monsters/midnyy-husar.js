Atlas.registerMonster({
  format: 2,
  id: "midnyy-husar",
  name: "Мідний Гусар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 775,
  lore: {
    description: "Двоногий дуелянт у мідних пластинах, із порожнистим списом, що нагадує водостічну трубу.",
    behavior: "Патрулює старий лицарський плац.",
    abilities: ["перед атакою креслить на землі прямі лінії, після чого мчить ними без можливості різко повернути"],
  },
});
