Atlas.registerMonster({
  format: 2,
  id: "korol-porozhnikh-vulykiv",
  name: "Король Порожніх Вуликів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 749,
  lore: {
    description: "Шестигранний монарх із тілом, складеним із велетенських порожніх стільників, і шістьма масками замість облич.",
    behavior: "Править покинутими пасіками Крейдяних Круч.",
    abilities: ["налаштовує комірки на різні звукові частоти, руйнуючи заклинання та дезорієнтуючи ворогів резонансом"],
  },
});
