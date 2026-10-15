Atlas.registerMonster({
  format: 2,
  id: "torfyanyy-vartovyy",
  name: "Торф’яний вартовий",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands", "swamp"], worlds: "all" },
  order: 512,
  lore: {
    description: "Людиноподібна грудка торфу з кореневими руками.",
    behavior: "Заболочені кургани.",
    abilities: ["розсипається на шматки, а потім збирається позаду ворога"],
  },
});
