Atlas.registerMonster({
  format: 2,
  id: "kashlyayuchyy-hrybok",
  name: "Кашляючий грибок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "steppe"], worlds: "all" },
  order: 611,
  lore: {
    description: "Крихітний грибний монстр із товстою ніжкою.",
    behavior: "Темні грибні зарості.",
    abilities: ["випускає спори короткими порціями, коли його наближаються"],
  },
});
