Atlas.registerMonster({
  format: 2,
  id: "shovkotkach",
  name: "Шовкоткач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 771,
  lore: {
    description: "Стрункий шестирукий мисливець із головою нічного метелика та довгими пальцями-прядками.",
    behavior: "Охороняє руїни Королівської ткацької майстерні.",
    abilities: ["натягує між колонами пружні шовкові нитки, що ловлять ворога або катапультують його в іншу частину зали"],
  },
});
