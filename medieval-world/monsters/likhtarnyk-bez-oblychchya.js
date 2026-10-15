Atlas.registerMonster({
  format: 2,
  id: "likhtarnyk-bez-oblychchya",
  name: "Ліхтарник без обличчя",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 776,
  lore: {
    description: "Худорлява істота в довгому темному плащі, усередині якого висять зелені ліхтарі.",
    behavior: "Полює на туманних мостах.",
    abilities: ["відчіплює вогники й змушує їх блукати окремими маршрутами, а сам рухається лише між ділянками світла"],
  },
});
