Atlas.registerMonster({
  format: 2,
  id: "tkach-burshtynovykh-kokoniv",
  name: "Ткач бурштинових коконів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 476,
  lore: {
    description: "Величезна багатонога істота з бурштиновими щупальцями.",
    behavior: "Бурштинові печери.",
    abilities: ["запечатує цілі ділянки арени в застиглих коконах, що вибухають при руйнуванні"],
  },
});
