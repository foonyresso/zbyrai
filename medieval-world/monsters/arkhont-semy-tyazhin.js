Atlas.registerMonster({
  format: 2,
  id: "arkhont-semy-tyazhin",
  name: "Архонт семи тяжінь",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 460,
  lore: {
    description: "Масивний чотирикрилий звір із металевими пластинами.",
    behavior: "Руїни небесної обсерваторії.",
    abilities: ["змінює силу тяжіння в окремих секторах арени"],
  },
});
