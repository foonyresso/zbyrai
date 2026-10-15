Atlas.registerMonster({
  format: 2,
  id: "drakon-popelyastoyi-korony",
  name: "Дракон попелястої корони",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "mountain", "peaks"], worlds: "all" },
  order: 257,
  lore: {
    description: "Древній дракон.",
    behavior: "Зустрічається: чорні вулканічні гори.",
    abilities: ["попелясте полум’я", "сліпучі спалахи", "вогняні крила"],
  },
});
