Atlas.registerMonster({
  format: 2,
  id: "ostanniy-svitlyachok",
  name: "Останній Світлячок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland", "grass"], worlds: "all" },
  order: 935,
  lore: {
    description: "Крихітна істота з прозорим черевцем і довгими тонкими ніжками.",
    behavior: "Зустрічається в темних садах, старих тунелях і забутих святилищах.",
    abilities: ["блимає лише тоді, коли поруч є прихований прохід, а при спробі зловити його перелітає за найближчу перешкоду"],
  },
});
