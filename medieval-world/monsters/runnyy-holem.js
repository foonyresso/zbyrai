Atlas.registerMonster({
  format: 2,
  id: "runnyy-holem",
  name: "Рунний голем",
  kind: "mini-boss",
  nature: "magic",
  variants: ["рунний голем", "рунний бойовий голем"],
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 305,
  lore: {
    description: "Магічний конструкт. Об'єднує схожих істот: рунний голем, рунний бойовий голем.",
    behavior: "Зустрічається: руїни храмів; стародавні руїни.",
    abilities: ["рунні вибухи", "кам’яні кулаки", "магічні удари", "короткий захисний бар’єр"],
  },
});
