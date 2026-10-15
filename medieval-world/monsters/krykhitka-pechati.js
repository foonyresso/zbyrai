Atlas.registerMonster({
  format: 2,
  id: "krykhitka-pechati",
  name: "Крихітка Печаті",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 807,
  lore: {
    description: "Дрібна квадратна личинка з гладкою панцирною спинкою й крихітними чорнильними лапками.",
    behavior: "Ховається в ущелинах старих підземель.",
    abilities: ["приклеює до предметів липкі печатки, що тимчасово блокують відкривання скринь або механізмів"],
  },
});
