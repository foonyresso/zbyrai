Atlas.registerMonster({
  format: 2,
  id: "pisochnyy-vuzlyar",
  name: "Пісочний Вузляр",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 913,
  lore: {
    description: "Маленька істота з чотирма довгими руками, зібрана з піщаних кубиків, що постійно розсипаються.",
    behavior: "Живе на краях рухомих дюн.",
    abilities: ["зв'язує піщинки в тимчасові вузли на ногах ворога, уповільнюючи його, а сам розпадається на окремі частинки, коли отримує удар"],
  },
});
