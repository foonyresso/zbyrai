Atlas.registerMonster({
  format: 2,
  id: "shestyholka",
  name: "Шестиголка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 869,
  lore: {
    description: "Комаха розміром із собаку, вкрита чорними пластинами, з шістьма довгими голками вздовж спини.",
    behavior: "Ховається у щілинах стін стародавніх фортець.",
    abilities: ["по черзі піднімає голки, утворюючи рухомий бар'єр, а потім прокочується крізь вузькі проходи"],
  },
});
