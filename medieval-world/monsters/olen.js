Atlas.registerMonster({
  format: 2,
  id: "olen",
  name: "Олень",
  kind: "monster",
  nature: "magic",
  variants: ["великий олень", "чорний рогатий олень", "лісовий лось"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 373,
  lore: {
    description: "Звір. Об'єднує схожих істот: великий олень, чорний рогатий олень, лісовий лось.",
    behavior: "Зустрічається: ліси, луки; прокляті гаї; заболочені ліси.",
    abilities: ["удари копитами", "захист рогами", "нічні ривки", "короткочасна невидимість", "таран рогами"],
  },
});
