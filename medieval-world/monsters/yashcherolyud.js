Atlas.registerMonster({
  format: 2,
  id: "yashcherolyud",
  name: "Ящеролюд",
  kind: "monster",
  nature: "threat",
  variants: ["ящеролюд-воїн", "ящеролюд-метальник"],
  spawn: { biomes: ["deep", "sea", "jungle", "grass"], worlds: "all" },
  order: 358,
  lore: {
    description: "Звичайний рептилоїд. Об'єднує схожих істот: ящеролюд-воїн, ящеролюд-метальник.",
    behavior: "Зустрічається: болота, річкові береги; джунглі, зарості.",
    abilities: ["спис", "луската шкіра", "метальні списи", "засідки"],
  },
});
