Atlas.registerMonster({
  format: 2,
  id: "myslyvets-na-misyatsi",
  name: "Мисливець на місяці",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 473,
  lore: {
    description: "Стрункий звір із серпоподібними рогами.",
    behavior: "Нічні плато.",
    abilities: ["створює фальшиві місяці, які падають на арену як вибухові снаряди"],
  },
});
