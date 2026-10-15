Atlas.registerMonster({
  format: 2,
  id: "toy-khto-perevertaye-svitanok",
  name: "Той, хто перевертає світанок",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 457,
  lore: {
    description: "Крилата істота з обличчям, схожим на сонячний годинник.",
    behavior: "Край світла, де день постійно змінює напрямок.",
    abilities: ["міняє місцями світло й тінь, роблячи безпечні зони смертельними"],
  },
});
