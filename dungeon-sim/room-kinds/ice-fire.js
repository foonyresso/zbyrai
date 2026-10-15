// Види кімнат: тема «ice-fire». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "ice-fire-1",
  "name": "Крижана галерея",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [
   "crystals"
  ],
  "desc": "Стіни з прозорого льоду, скрізь віддзеркалення"
 },
 {
  "id": "ice-fire-2",
  "name": "Замерзле озеро",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Лід під ногами тріщить"
 },
 {
  "id": "ice-fire-3",
  "name": "Снігова камера",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Сніг на підлозі, а в ньому сліди"
 },
 {
  "id": "ice-fire-4",
  "name": "Крижаний міст",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Вузький міст над прірвою"
 },
 {
  "id": "ice-fire-5",
  "name": "Лавова зала",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [
   "rubble"
  ],
  "desc": "Тріщини світяться червоним"
 },
 {
  "id": "ice-fire-6",
  "name": "Попелище",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Попіл по коліна і ледь теплі камені"
 },
 {
  "id": "ice-fire-7",
  "name": "Кузня вогню",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [
   "ore"
  ],
  "desc": "Горни живляться вулканічним жаром"
 },
 {
  "id": "ice-fire-8",
  "name": "Жаровня",
  "roles": [
   "room"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Куполи жару, що не гаснуть"
 },
 {
  "id": "ice-fire-9",
  "name": "Зала холоду",
  "roles": [
   "hub"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Крижані колони підпирають склепіння"
 },
 {
  "id": "ice-fire-10",
  "name": "Зала вогню",
  "roles": [
   "hub"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Лава тече по каналах у підлозі"
 },
 {
  "id": "ice-fire-11",
  "name": "Крижана ніша",
  "roles": [
   "dead"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Лід зберігає речі такими, якими вони були"
 },
 {
  "id": "ice-fire-12",
  "name": "Обпалена ніша",
  "roles": [
   "dead"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Те, що уціліло після спеки"
 },
 {
  "id": "ice-fire-13",
  "name": "Серце морозу",
  "roles": [
   "boss"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Холод тут пронизує навіть крізь одяг"
 },
 {
  "id": "ice-fire-14",
  "name": "Серце жару",
  "roles": [
   "boss"
  ],
  "types": [
   "frost-cave",
   "ember-tunnels"
  ],
  "tags": [],
  "desc": "Тут усе червоніє й тріщить"
 }
]);
