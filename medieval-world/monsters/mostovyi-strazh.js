Atlas.registerMonster({
  "format": 2,
  "id": "mostovyi-strazh",
  "name": "Мостовий страж",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:cloud"
    ],
    "worlds": "all"
  },
  "order": 938,
  "lore": {
    "description": "Кам'яний гуманоїд-арка, що стоїть посеред вузького природного мосту.",
    "behavior": "Не пускає тих, хто не поклав дар на камінь, і скидає порушників у прірву.",
    "abilities": [
      "розширює себе й перекриває міст",
      "відштовхує ударною хвилею"
    ],
    "drops": [
      "мостовий камінь",
      "жила-ключ"
    ]
  }
});
