// Види кімнат: тема «dragon». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "dragon-1",
  "name": "Скарбова зала",
  "roles": [
   "room"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [
   "cache"
  ],
  "desc": "Купи монет, кубків і зброї"
 },
 {
  "id": "dragon-2",
  "name": "Кістяний зал",
  "roles": [
   "room"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Кістки сотень шукачів пригод"
 },
 {
  "id": "dragon-3",
  "name": "Опалена камера",
  "roles": [
   "room"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Стіни й підлога почорніли від вогню"
 },
 {
  "id": "dragon-4",
  "name": "Гніздо яєць",
  "roles": [
   "room"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Тепло йде від каменів, між якими лежать яйця"
 },
 {
  "id": "dragon-5",
  "name": "Велика зала",
  "roles": [
   "hub"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Склепіння тут вище будь-якого собору"
 },
 {
  "id": "dragon-6",
  "name": "Купа монет",
  "roles": [
   "dead"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Золото аж до стелі, але хтось уже тут був"
 },
 {
  "id": "dragon-7",
  "name": "Схованка героїв",
  "roles": [
   "dead"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Мертві шукачі пригод залишили спорядження"
 },
 {
  "id": "dragon-8",
  "name": "Лігво дракона",
  "roles": [
   "boss"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Спить у гнізді з золота, поки не прокинеться"
 },
 {
  "id": "dragon-9",
  "name": "Вхід до лігва",
  "roles": [
   "start"
  ],
  "types": [
   "dragon-lair"
  ],
  "tags": [],
  "desc": "Печера з опаленими стінами"
 }
]);
