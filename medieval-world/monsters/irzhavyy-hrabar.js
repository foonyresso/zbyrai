Atlas.registerMonster({
  format: 2,
  id: "irzhavyy-hrabar",
  name: "Іржавий грабар",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 531,
  lore: {
    description: "Невисока істота з металевими лопатями замість рук.",
    behavior: "Покинуті фортифікації.",
    abilities: ["викопує ями й ховається у виритих ходах"],
  },
});
