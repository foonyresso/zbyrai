Atlas.registerDungeon({
  "format": 2,
  "id": "hirska-viaznytsia",
  "name": "Гірська В'язниця Птахів",
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
    "сторожі",
    "крилаті звірі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 785,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "midnokryl"
    ]
  },
  "lore": {
    "description": "В'язниця в скелі, що охороняється приручені птахами."
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
