Atlas.registerMonster({
  format: 2,
  id: "dzerkalnyy-tsvyntarnyk",
  name: "Дзеркальний Цвинтарник",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 750,
  lore: {
    description: "Сутула істота з тонкими металевими кінцівками й головою з уламків полірованих надгробків.",
    behavior: "Доглядає соляне Місто Відображень.",
    abilities: ["виставляє дзеркальні плити, що змінюють напрямок атак, а потім складає з них лабіринт навколо супротивника"],
  },
});
