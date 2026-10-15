Atlas.registerMonster({
  format: 2,
  id: "vodyanyy-horshchyk",
  name: "Водяний горщик",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 503,
  lore: {
    description: "Круглотілий амфібій із твердою керамічною шкірою.",
    behavior: "Глиняні джерела.",
    abilities: ["накопичує воду в тілі й випускає її струменями, що збивають із ніг"],
  },
});
