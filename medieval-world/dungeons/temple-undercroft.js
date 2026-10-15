Atlas.registerDungeon({
  "format": 2,
  "id": "temple-undercroft",
  "name": "Підземний монастир",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple"
    ]
  },
  "size": {
    "rooms": [
      8,
      25
    ],
    "length": [
      400,
      1600
    ],
    "area": [
      1200,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "ченці-привиди",
    "культисти",
    "реліквійні вартові"
  ],
  "chance": 0.6,
  "danger": 2,
  "order": 32,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Крипта, келії й сховище реліквій під храмом."
  }
});
