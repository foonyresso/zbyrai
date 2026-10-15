Atlas.registerMonster({
  format: 2,
  id: "malyy-drakonchyk",
  name: "Малий дракончик",
  kind: "monster",
  nature: "threat",
  variants: ["крихітний дракончик-крадій", "малий річковий дракончик"],
  spawn: { biomes: ["mountain", "hills", "lake"], worlds: "all" },
  order: 407,
  lore: {
    description: "Малий дракон. Об'єднує схожих істот: крихітний дракончик-крадій, малий річковий дракончик.",
    behavior: "Зустрічається: драконячі гнізда; гірські струмки, водоспади.",
    abilities: ["хапає блискучі предмети", "випускає іскри", "бризки води", "короткий стрибок", "укус"],
  },
});
