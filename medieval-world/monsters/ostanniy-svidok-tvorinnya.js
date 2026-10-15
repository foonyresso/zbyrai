Atlas.registerMonster({
  format: 2,
  id: "ostanniy-svidok-tvorinnya",
  name: "Останній свідок творіння",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 461,
  lore: {
    description: "Давня істота, складена з піску, кісток, льоду, коренів і лави.",
    behavior: "Первісний кратер, де зійшлися всі стихії.",
    abilities: ["у кожній фазі перебудовує себе під стихію арени"],
  },
});
