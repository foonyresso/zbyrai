Atlas.registerDungeon({
  "format": 2,
  "id": "cloud-monastery-crypt",
  "name": "Крипта гірського монастиря",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain-monastery"
    ]
  },
  "size": {
    "rooms": [
      8,
      22
    ],
    "length": [
      300,
      1400
    ],
    "area": [
      1000,
      4000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "ченці-привиди",
    "вартові громовідводів"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 241,
  "spawn": {
    "biomes": [
      "mineral-crowns",
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "lore": {
    "description": "Підземні келії й сховище під монастирем на вершині."
  }
});
