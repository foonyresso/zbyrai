Atlas.registerMonster({
  format: 2,
  id: "klyuchokist",
  name: "Ключокіст",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 770,
  lore: {
    description: "Довгонога істота з ребрами у формі замків і хребтом, уздовж якого ростуть зубчасті ключі.",
    behavior: "Мешкає в закинутому арсеналі фортеці.",
    abilities: ["замикає дотиком двері, брами й навіть рухомі частини обладунків, тимчасово блокуючи певні дії супротивника"],
  },
});
