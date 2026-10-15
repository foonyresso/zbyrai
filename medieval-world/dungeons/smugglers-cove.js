Atlas.registerDungeon({
  "format": 2,
  "id": "smugglers-cove",
  "name": "Печера контрабандистів",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      18
    ],
    "length": [
      400,
      1500
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
    "контрабандисти",
    "вартові-найманці",
    "дресировані звірі"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 309,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Прихований порт і склади в підземеллі, куди заходять човни без вогнів."
  },
  "sim": {
    "tags": {
      "cache": 55,
      "flooded": 30,
      "cells": 10
    },
    "corr": 25,
    "cave": false
  }
});
