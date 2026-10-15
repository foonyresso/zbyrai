Atlas.registerMonster({
  format: 2,
  id: "zaliznyy-parazyt",
  name: "Залізний Паразит",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 903,
  lore: {
    description: "Плоска істота з чорних металевих лусочок і чотирьох гачків.",
    behavior: "Мешкає у покинутих залізних копальнях.",
    abilities: ["чіпляється до обладунків гравця, збільшуючи їхню вагу й знижуючи швидкість, доки його не скинуть ударом об стіну"],
  },
});
