// Види кімнат: тема «prison». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "prison-1",
  "name": "Камера",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "cells"
  ],
  "desc": "Грубі двері та солом’яне ліжко"
 },
 {
  "id": "prison-2",
  "name": "Допитна",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "cells",
   "blood"
  ],
  "desc": "Лава, кайдани й закривавлені ганчірки"
 },
 {
  "id": "prison-3",
  "name": "Камера смертників",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "cells"
  ],
  "desc": "Тут писали останні листи"
 },
 {
  "id": "prison-4",
  "name": "Тюремна кухня",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Каша в казані й черствий хліб"
 },
 {
  "id": "prison-5",
  "name": "Кімната наглядачів",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Ключі на цвяхах і гральні кістки"
 },
 {
  "id": "prison-6",
  "name": "Ешафот",
  "roles": [
   "room"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "blood"
  ],
  "desc": "Помост із темним плямами"
 },
 {
  "id": "prison-7",
  "name": "Центральний блок",
  "roles": [
   "hub"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "cells"
  ],
  "desc": "Ряди камер навколо вартового посту"
 },
 {
  "id": "prison-8",
  "name": "Одиночка",
  "roles": [
   "dead"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [
   "cells"
  ],
  "desc": "Тут тримали тих, кого боялись навіть наглядачі"
 },
 {
  "id": "prison-9",
  "name": "Карцер",
  "roles": [
   "dead"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Тіснота, темрява й холод"
 },
 {
  "id": "prison-10",
  "name": "Потайна камера",
  "roles": [
   "secret"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Про неї не знали навіть в’язні"
 },
 {
  "id": "prison-11",
  "name": "Кабінет наглядача",
  "roles": [
   "boss"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Гроші, ключі й наказ про страту"
 },
 {
  "id": "prison-12",
  "name": "Прохідна",
  "roles": [
   "start"
  ],
  "types": [
   "prison",
   "keep-cellars",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Решітка й журнал відвідувань"
 }
]);
