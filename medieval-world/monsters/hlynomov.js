Atlas.registerMonster({
  format: 2,
  id: "hlynomov",
  name: "Глиномов",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 757,
  lore: {
    description: "Приземкуватий велет із гончарним кругом у животі, глиняною головою-глечиком і важкими руками-лопатами.",
    behavior: "Ховається в Лабіринті Недопеченої Цегли.",
    abilities: ["виліплює з навколишньої землі стіни, ями та рухомі статуї, постійно перебудовуючи арену"],
  },
});
