Atlas.registerMonster({
  format: 2,
  id: "hospodar-zvorotnoho-polumya",
  name: "Господар зворотного полум’я",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["ashlands"], worlds: "all" },
  order: 475,
  lore: {
    description: "Істота з попелястим панциром і блакитним полум’ям усередині.",
    behavior: "Попелясті терми.",
    abilities: ["відновлює здоров’я, коли отримує вогняні атаки, і поглинає жар арени"],
  },
});
