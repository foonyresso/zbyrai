// Види кімнат: тема «arena». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "arena-1",
  "name": "Піт гладіаторів",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Піщана яма з відкритою брамою"
 },
 {
  "id": "arena-2",
  "name": "Клітки звірів",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Ґрати, кістки й роздерті ковдри"
 },
 {
  "id": "arena-3",
  "name": "Комора зброї",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Мечі та щити, що чекають своєї черги"
 },
 {
  "id": "arena-4",
  "name": "Кімната лікаря",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Столи для зашивання ран і ящики з бинтами"
 },
 {
  "id": "arena-5",
  "name": "Трибуни",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Лави, що колись були місцем для сотень глядачів"
 },
 {
  "id": "arena-6",
  "name": "Зала ставок",
  "roles": [
   "room"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Тут приймали гроші на вирішальні бої"
 },
 {
  "id": "arena-7",
  "name": "Арена",
  "roles": [
   "hub"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Широка піщана арена з кількома виходами"
 },
 {
  "id": "arena-8",
  "name": "Каса арени",
  "roles": [
   "dead"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Мішки з виручкою й міцні замки"
 },
 {
  "id": "arena-9",
  "name": "Королівська ложа",
  "roles": [
   "boss"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Найкраще місце в залі й найбільша небезпека"
 },
 {
  "id": "arena-10",
  "name": "Вхід гладіаторів",
  "roles": [
   "start"
  ],
  "types": [
   "arena-depths"
  ],
  "tags": [],
  "desc": "Важкі ворота й коридор до арени"
 }
]);
