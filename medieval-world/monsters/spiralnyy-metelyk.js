Atlas.registerMonster({
  format: 2,
  id: "spiralnyy-metelyk",
  name: "Спіральний метелик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 671,
  lore: {
    description: "Нічний метелик із закрученими крильцями.",
    behavior: "Сутінкові хащі.",
    abilities: ["летить спіраллю й залишає за собою плутану світну стежку"],
  },
});
