Atlas.registerMonster({
  format: 2,
  id: "pantsyrnyk-midnoho-doshchu",
  name: "Панцирник Мідного Дощу",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 853,
  lore: {
    description: "Кремезний звір із мідних пластин, які під час руху відшаровуються й падають навколо нього.",
    behavior: "Живе на мідних схилах старих шахт.",
    abilities: ["притискається до землі, переживаючи атаки, а потім піднімає розкидані пластини магнітним полем і запускає їх дугами"],
  },
});
