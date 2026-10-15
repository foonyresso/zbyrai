Atlas.registerMonster({
  format: 2,
  id: "hoblin-shaman",
  name: "Гоблін-шаман",
  kind: "mini-boss",
  nature: "magic",
  variants: ["крилатий гоблін-шаман", "гоблінський шаман-буревісник"],
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 317,
  lore: {
    description: "Магічний гуманоїд. Об'єднує схожих істот: крилатий гоблін-шаман, гоблінський шаман-буревісник.",
    behavior: "Зустрічається: гоблінські фортеці; пагорби й табори.",
    abilities: ["прокляті тотеми", "блискавки", "вітрові поштовхи", "тотеми"],
  },
});
