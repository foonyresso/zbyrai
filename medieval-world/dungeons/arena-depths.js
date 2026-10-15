Atlas.registerDungeon({
  "format": 2,
  "id": "arena-depths",
  "name": "Підземна арена",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      8,
      22
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      1000,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "гладіатори",
    "звірі арени",
    "організатори боїв"
  ],
  "chance": 0.25,
  "danger": 3,
  "order": 310,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Нелегальна арена під містом: клітки, трибуни й комори зі зброєю."
  },
  "sim": {
    "tags": {
      "cells": 40,
      "blood": 35,
      "cache": 15
    },
    "corr": 20,
    "cave": false
  }
});
