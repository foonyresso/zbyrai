Atlas.registerMonster({
  format: 2,
  id: "rektor-hrybnoho-doshchu",
  name: "Ректор Грибного Дощу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 762,
  lore: {
    description: "Довготелесий грибний чаклун із широким капелюхом-парасолею, ніжками-руками та поясом із порожніх спорних коробочок.",
    behavior: "Мешкає в Обсерваторії Спор.",
    abilities: ["викликає зливу квадратних грибів, які перетворюються на тимчасові платформи або вибухають звуковими хвилями при наступанні"],
  },
});
