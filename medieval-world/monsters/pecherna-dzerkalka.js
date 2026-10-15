Atlas.registerMonster({
  format: 2,
  id: "pecherna-dzerkalka",
  name: "Печерна Дзеркалка",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 819,
  lore: {
    description: "Бліда саламандра з дзеркальною шкірою та короткими пальцями-присосками.",
    behavior: "Живе в печерах із кришталевими підземними озерами.",
    abilities: ["відображає світло від поверхні води, створюючи хибні контури проходів і відгалужень"],
  },
});
