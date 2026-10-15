Atlas.registerMonster({
  format: 2,
  id: "mushlyastyy-zemlekop",
  name: "Мушлястий землекоп",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 530,
  lore: {
    description: "Коротколапий підземний звір із мушлею, схожою на бур.",
    behavior: "Піщані печери.",
    abilities: ["вилазить під ногами й розкидає грудки ґрунту"],
  },
});
