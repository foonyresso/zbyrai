Atlas.registerMonster({
  format: 2,
  id: "feniks-vichnoho-popelu",
  name: "Фенікс вічного попелу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 264,
  lore: {
    description: "Вогняний птах.",
    behavior: "Зустрічається: руїни храмів у вулканічних долинах.",
    abilities: ["воскресає з попелу", "створює вогняні вихори"],
  },
});
