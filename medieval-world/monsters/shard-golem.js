Atlas.registerMonster({
  "format": 2,
  "id": "shard-golem",
  "name": "Уламковий голем",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ownerless-garden",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 208,
  "lore": {
    "description": "Голем, складений із блоків різних матеріалів з різних загиблих світів.",
    "behavior": "Бродить по уламку; розсипається на блоки, що рухаються окремо.",
    "abilities": [
      "розсипання на частини",
      "кам'яний удар",
      "збирання"
    ],
    "drops": [
      "уламкова сталь",
      "камінь забутих міст"
    ]
  }
});
