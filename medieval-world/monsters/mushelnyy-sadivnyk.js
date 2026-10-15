Atlas.registerMonster({
  format: 2,
  id: "mushelnyy-sadivnyk",
  name: "Мушельний Садівник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 894,
  lore: {
    description: "Повільний морський гуманоїд із панциром, складеним із багатьох мушель різного розміру.",
    behavior: "Живе в затонулих садах.",
    abilities: ["прикріплює мушлі до каменів, створюючи живі укриття, а в бою закривається ними, поки гравець не знищить зовнішній шар"],
  },
});
