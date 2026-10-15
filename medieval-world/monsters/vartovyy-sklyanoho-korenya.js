Atlas.registerMonster({
  format: 2,
  id: "vartovyy-sklyanoho-korenya",
  name: "Вартовий Скляного Кореня",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 846,
  lore: {
    description: "Велика істота з прозорих кореневих жил і гранованих зелених пластин замість м'язів.",
    behavior: "Охороняє серце підземного лісу під руїнами друїдського храму.",
    abilities: ["втягує удари в коріння, а потім повертає накопичену силу через підлогу у вигляді гострих кристалічних пагонів"],
  },
});
