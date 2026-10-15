// Види кімнат: тема «fortress». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "fortress-1",
  "name": "Зброярня",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Стійки зі зброєю, дещо ще придатне"
 },
 {
  "id": "fortress-2",
  "name": "Карцер",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Вузька кімната без вікон"
 },
 {
  "id": "fortress-3",
  "name": "Кордегардія",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Вартова кімната з гральними кістками на столі"
 },
 {
  "id": "fortress-4",
  "name": "Льох із вином",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [
   "webs"
  ],
  "desc": "Діжки й пляшки в павутинні"
 },
 {
  "id": "fortress-5",
  "name": "Склад провіанту",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Все, що не встигло зіпсуватись"
 },
 {
  "id": "fortress-6",
  "name": "Кімната вартових",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Ліжка, шафи й нічого зайвого"
 },
 {
  "id": "fortress-7",
  "name": "Лазарет",
  "roles": [
   "room"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Бинти, трави й прострочені мікстури"
 },
 {
  "id": "fortress-8",
  "name": "Зала гарнізону",
  "roles": [
   "hub"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Тут збиралась вся варта"
 },
 {
  "id": "fortress-9",
  "name": "Двір підвалу",
  "roles": [
   "hub"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Склепіння над відкритим колодязем світла"
 },
 {
  "id": "fortress-10",
  "name": "Скарбниця коменданта",
  "roles": [
   "dead"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Скриня під замком і гострий кинджал на стінці"
 },
 {
  "id": "fortress-11",
  "name": "Забутий льох",
  "roles": [
   "dead"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Сюди давно ніхто не заходив"
 },
 {
  "id": "fortress-12",
  "name": "Потайний хід",
  "roles": [
   "secret"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Прохід на випадок облоги"
 },
 {
  "id": "fortress-13",
  "name": "Командний пост",
  "roles": [
   "boss"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Мапи, наказ і застиглий кубок"
 },
 {
  "id": "fortress-14",
  "name": "Зала лорда",
  "roles": [
   "boss"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Місце, звідки правили й засуджували"
 },
 {
  "id": "fortress-15",
  "name": "Бічна брама",
  "roles": [
   "start"
  ],
  "types": [
   "keep-cellars",
   "torn-castle-vaults",
   "trunk-fortress",
   "skull-fortress-depths",
   "palace-cellar-mine",
   "royal-vault",
   "prison",
   "arena-depths"
  ],
  "tags": [],
  "desc": "Решітка піднята лише наполовину"
 }
]);
