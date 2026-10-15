Atlas.registerMonster({
  format: 2,
  id: "koroleva-krystalichnoho-royu",
  name: "Королева кристалічного рою",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["crystal", "desert", "wasteland", "hills"], worlds: "all" },
  order: 253,
  lore: {
    description: "Кристалічна матка.",
    behavior: "Зустрічається: кришталеві пустки, підземні геоди.",
    abilities: ["створює нескінченні хвилі кристалічних істот", "відрощує броню"],
  },
});
