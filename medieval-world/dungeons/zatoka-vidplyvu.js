Atlas.registerDungeon({
  "format": 2,
  "id": "zatoka-vidplyvu",
  "name": "Затока Контрабандистів",
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
    "крабі"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 783,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talmoriya"
    ]
  },
  "lore": {
    "description": "Печера, доступна лише під час відпливу."
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
