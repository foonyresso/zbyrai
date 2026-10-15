Atlas.registerMonster({
  format: 2,
  id: "svitlyanyy-pastushok",
  name: "Світляний Пастушок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 880,
  lore: {
    description: "Крихітний круглий дух із трьома золотими очима та ніжками з тонких світлових ниток.",
    behavior: "Живе у світних заростях підземних озер.",
    abilities: ["збирає розкидані світляки в рухомі сфери, які засліплюють ворогів лише тоді, коли ті дивляться прямо на них"],
  },
});
