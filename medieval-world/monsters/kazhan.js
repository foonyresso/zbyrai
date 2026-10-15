Atlas.registerMonster({
  format: 2,
  id: "kazhan",
  name: "Кажан",
  kind: "monster",
  nature: "threat",
  variants: ["гірський кажан", "великий нічний кажан", "печерний кажан"],
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 378,
  lore: {
    description: "Літаючий звір. Об'єднує схожих істот: гірський кажан, великий нічний кажан, печерний кажан.",
    behavior: "Зустрічається: печери; старі вежі, печери.",
    abilities: ["укуси", "ехолокація", "зграєві атаки", "коротке оглушення", "дезорієнтувальний писк"],
  },
});
