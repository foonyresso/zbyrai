Atlas.registerMonster({
  format: 2,
  id: "sklyanyy-olen-khram",
  name: "Скляний Олень-Храм",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "crystal", "grass"], worlds: "all" },
  order: 761,
  lore: {
    description: "Величний чотириногий звір із вітражним корпусом, високими рогами-вікнами та прозорими ногами.",
    behavior: "Охороняє Заломлений собор у Скляному лісі.",
    abilities: ["розкладає сонячне проміння на кольорові промені, що активують небезпечні ділянки арени залежно від кольору"],
  },
});
