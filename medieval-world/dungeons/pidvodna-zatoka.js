Atlas.registerDungeon({
  "format": 2,
  "id": "pidvodna-zatoka",
  "name": "Підводна Затока",
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
    "контрабандисти-плавці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 784,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talassyr"
    ]
  },
  "lore": {
    "description": "Печерна затока з повітряними кишенями."
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
