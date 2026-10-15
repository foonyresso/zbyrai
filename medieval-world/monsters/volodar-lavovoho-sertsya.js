Atlas.registerMonster({
  format: 2,
  id: "volodar-lavovoho-sertsya",
  name: "Володар лавового серця",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 248,
  lore: {
    description: "Вогняний титан.",
    behavior: "Зустрічається: серце вулкану.",
    abilities: ["виверження лави", "вогняні хвилі", "розколювання скель"],
  },
});
