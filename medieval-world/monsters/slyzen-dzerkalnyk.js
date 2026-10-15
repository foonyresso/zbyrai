Atlas.registerMonster({
  format: 2,
  id: "slyzen-dzerkalnyk",
  name: "Слизень-дзеркальник",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 490,
  lore: {
    description: "Великий прозорий молюск із твердим дзеркальним куполом.",
    behavior: "Кришталеві заплави.",
    abilities: ["відбиває спрямовані на нього промені та маскується під водойму"],
  },
});
