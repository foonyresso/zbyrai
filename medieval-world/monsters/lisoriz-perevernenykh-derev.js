Atlas.registerMonster({
  format: 2,
  id: "lisoriz-perevernenykh-derev",
  name: "Лісоріз Перевернених Дерев",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 759,
  lore: {
    description: "Чотиринога деревна істота, у якої стовбур утворює корпус, а крона стоїть унизу на коренях-ногах.",
    behavior: "Живе в лісі, де дерева ростуть кронами під землею.",
    abilities: ["вириває дерева догори корінням і розмахує ними, створюючи рухомі зони небезпеки"],
  },
});
