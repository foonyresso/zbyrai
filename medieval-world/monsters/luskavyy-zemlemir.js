Atlas.registerMonster({
  format: 2,
  id: "luskavyy-zemlemir",
  name: "Лускавий землемір",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["steppe", "hills", "mountain"], worlds: "all" },
  order: 502,
  lore: {
    description: "Довгий броньований рептилій із пластинами, схожими на геодезичні мітки.",
    behavior: "Степи тріснутої землі.",
    abilities: ["розмічає поле променями й обвалює позначені ділянки"],
  },
});
