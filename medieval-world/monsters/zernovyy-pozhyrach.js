Atlas.registerMonster({
  format: 2,
  id: "zernovyy-pozhyrach",
  name: "Зерновий Пожирач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills"], worlds: "all" },
  order: 774,
  lore: {
    description: "Кремезна істота з тулубом-бочкою, солом’яними батогами замість рук і обертовим жорном замість голови.",
    behavior: "Живе в покинутому зерносховищі на вітряних пагорбах.",
    abilities: ["ковтає зерно, а потім видихає хмари дрібного пилу, що засліплюють та засипають проходи"],
  },
});
