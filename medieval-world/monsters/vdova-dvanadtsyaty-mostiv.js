Atlas.registerMonster({
  format: 2,
  id: "vdova-dvanadtsyaty-mostiv",
  name: "Вдова Дванадцяти Мостів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 748,
  lore: {
    description: "Висока істота під дерев’яною вуаллю, чиї дванадцять рук закінчуються гачками, рубанками та голками.",
    behavior: "Мешкає в проваллі з покинутими мостами.",
    abilities: ["перекроює мости під час бою, натягує між ними невидимі нитки й обвалює обрані переходи"],
  },
});
