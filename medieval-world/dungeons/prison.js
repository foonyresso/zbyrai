Atlas.registerDungeon({
  "format": 2,
  "id": "prison",
  "name": "Каземат",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "наглядачі",
    "в'язні-бунтівники",
    "привиди страчених"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 300,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Тюрма під містом: камери, допитні й похмурі коридори."
  },
  "sim": {
    "tags": {
      "cells": 60,
      "blood": 15,
      "rubble": 10
    },
    "corr": 30,
    "cave": false
  }
});
