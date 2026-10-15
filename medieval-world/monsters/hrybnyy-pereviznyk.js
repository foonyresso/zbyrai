Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-pereviznyk",
  name: "Грибний Перевізник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 877,
  lore: {
    description: "Велика шестинога істота з округлою шапкою гриба замість спини та ногами з переплетеного коріння.",
    behavior: "Мешкає в підземних грибних садах.",
    abilities: ["перевозить дрібні гриби на власному тілі, а під час загрози скидає їх, утворюючи слизький килим"],
  },
});
