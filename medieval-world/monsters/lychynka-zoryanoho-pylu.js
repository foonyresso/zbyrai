Atlas.registerMonster({
  format: 2,
  id: "lychynka-zoryanoho-pylu",
  name: "Личинка Зоряного Пилу",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass", "hills", "mountain", "peaks"], worlds: "all" },
  order: 829,
  lore: {
    description: "Срібляста гусениця з кубічними сегментами, що блимають, наче далекі зорі.",
    behavior: "Повзає в метеоритних садах на краю високогір’я.",
    abilities: ["залишає на камінні світний пил, який тимчасово підсвічує невидимі стежки та приховані написи"],
  },
});
