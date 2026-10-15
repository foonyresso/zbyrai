Atlas.registerMonster({
  format: 2,
  id: "zhertovnyy-maskaron",
  name: "Жертовний Маскарон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 755,
  lore: {
    description: "Величезна кам’яна театральна маска з рухомою нижньою щелепою та кількома змінними обличчями на потилиці.",
    behavior: "Охороняє амфітеатр у Руїнах Тисячі Ролей.",
    abilities: ["кожна маска змінює правила арени: трагедія провалює підлогу, гнів здіймає шипи, а сміх змушує плити пружно відкидати всіх угору"],
  },
});
