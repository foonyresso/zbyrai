Atlas.registerMonster({
  format: 2,
  id: "sobor-doshchovyk",
  name: "Собор-Дощовик",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 743,
  lore: {
    description: "Жива споруда на десятках кам’яних ніг, з дахом із перекритих плит і водостоками замість ребер.",
    behavior: "Мандрує Долиною Нескінченної Зливи.",
    abilities: ["пересуває стіни, створює потоки зливової води та затоплює низини арени"],
  },
});
