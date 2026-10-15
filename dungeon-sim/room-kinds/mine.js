// Види кімнат: тема «mine». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "mine-1",
  "name": "Штольня",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [
   "rubble"
  ],
  "desc": "Підпорки скриплять під вагою каменю"
 },
 {
  "id": "mine-2",
  "name": "Зал вагонеток",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Рейки, поламані вагонетки й порожні бочки"
 },
 {
  "id": "mine-3",
  "name": "Кузня штейгера",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Горн, ковадло й залишки інструмента"
 },
 {
  "id": "mine-4",
  "name": "Склад руди",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [
   "ore"
  ],
  "desc": "Купи руди й мішки з породою"
 },
 {
  "id": "mine-5",
  "name": "Провалля",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [
   "rubble"
  ],
  "desc": "Ґрунт під ногами хитається над прірвою"
 },
 {
  "id": "mine-6",
  "name": "Підйомна шахта",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Колесо підйомника й обірваний канат"
 },
 {
  "id": "mine-7",
  "name": "Вентиляційна камера",
  "roles": [
   "room"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Повітря тут рідше, а стіни вологі"
 },
 {
  "id": "mine-8",
  "name": "Головний штрек",
  "roles": [
   "hub"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [
   "ore"
  ],
  "desc": "Тут сходяться всі галереї шахти"
 },
 {
  "id": "mine-9",
  "name": "Зал підйомника",
  "roles": [
   "hub"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Просторий зал із механізмом посередині"
 },
 {
  "id": "mine-10",
  "name": "Жила самоцвітів",
  "roles": [
   "dead"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [
   "ore"
  ],
  "desc": "Стіна виблискує вкрапленнями коштовностей"
 },
 {
  "id": "mine-11",
  "name": "Обвалений забій",
  "roles": [
   "dead"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Завал частково розчищено, за ним сховок"
 },
 {
  "id": "mine-12",
  "name": "Прихована виробка",
  "roles": [
   "secret"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Гірники вирили її в таємниці від хазяїв"
 },
 {
  "id": "mine-13",
  "name": "Серце шахти",
  "roles": [
   "boss"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Найглибша виробка, де щось прокинулось"
 },
 {
  "id": "mine-14",
  "name": "Верхній штрек",
  "roles": [
   "start"
  ],
  "types": [
   "mine",
   "palace-cellar-mine",
   "ember-tunnels",
   "delve-city",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Тут стоять візки й лежать залишки інструменту"
 }
]);
