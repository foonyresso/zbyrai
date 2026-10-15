Atlas.registerMonster({
  format: 2,
  id: "rohach-kvitkovoho-popelu",
  name: "Рогач Квіткового Попелу",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 915,
  lore: {
    description: "Невеликий звір із чорним тілом і рогами, схожими на сухі квіткові стебла.",
    behavior: "Мешкає на полях після магічних пожеж.",
    abilities: ["розкидає попіл, що осідає на рослинах і змушує їх тимчасово закриватися, позбавляючи гравця природних укриттів"],
  },
});
