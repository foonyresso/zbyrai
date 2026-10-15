// Види кімнат: тема «ruins». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "ruins-1",
  "name": "Завалений підвал",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [
   "rubble"
  ],
  "desc": "Балки провалились, але прохід ще можна знайти"
 },
 {
  "id": "ruins-2",
  "name": "Колишня крамниця",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Прилавки, ваги й чиїсь рахунки"
 },
 {
  "id": "ruins-3",
  "name": "Підземна вулиця",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Будинки з обох боків і закриті віконниці"
 },
 {
  "id": "ruins-4",
  "name": "Колишня таверна",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Столи, діжки й кілька кухлів"
 },
 {
  "id": "ruins-5",
  "name": "Підземний ринок",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Купа ятків, які давно ніхто не відвідує"
 },
 {
  "id": "ruins-6",
  "name": "Зал зборів",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Лави для сотні людей і помост"
 },
 {
  "id": "ruins-7",
  "name": "Будинок ремісника",
  "roles": [
   "room"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Інструменти й заготовки на верстаку"
 },
 {
  "id": "ruins-8",
  "name": "Площа підземного міста",
  "roles": [
   "hub"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Колодязь, кілька вулиць і склепіння над головою"
 },
 {
  "id": "ruins-9",
  "name": "Завалений льох",
  "roles": [
   "dead"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Ніхто не пам’ятає, що зберігали тут"
 },
 {
  "id": "ruins-10",
  "name": "Потаємна кімната власника",
  "roles": [
   "secret"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Господар ховав тут своє справжнє майно"
 },
 {
  "id": "ruins-11",
  "name": "Палац міського голови",
  "roles": [
   "boss"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Найкращий будинок підземного міста"
 },
 {
  "id": "ruins-12",
  "name": "Нижній вхід",
  "roles": [
   "start"
  ],
  "types": [
   "ruin-cellars",
   "village-cellar",
   "keep-cellars",
   "delve-city",
   "ancient-vault",
   "torn-castle-vaults"
  ],
  "tags": [],
  "desc": "Сходи, що ведуть у темряву під містом"
 }
]);
