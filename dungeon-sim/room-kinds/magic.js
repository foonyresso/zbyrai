// Види кімнат: тема «magic». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "magic-1",
  "name": "Алхімічна лабораторія",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [
   "lab"
  ],
  "desc": "Колби, реторти й дивні запахи"
 },
 {
  "id": "magic-2",
  "name": "Зал дослідів",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [
   "lab"
  ],
  "desc": "Підопічні клітки й сліди невдалих дослідів"
 },
 {
  "id": "magic-3",
  "name": "Склад реагентів",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [
   "lab"
  ],
  "desc": "Скляні банки з трунками й порошками"
 },
 {
  "id": "magic-4",
  "name": "Кімната виклику",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Круг на підлозі й пропалені стіни"
 },
 {
  "id": "magic-5",
  "name": "Оранжерея",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Чудернацькі рослини в діжках з магічним світлом"
 },
 {
  "id": "magic-6",
  "name": "Читальня",
  "roles": [
   "room"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [
   "library"
  ],
  "desc": "Стелажі з книгами і єдиний стіл"
 },
 {
  "id": "magic-7",
  "name": "Зала порталів",
  "roles": [
   "hub"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Кілька арок із мерехтінням у проходах"
 },
 {
  "id": "magic-8",
  "name": "Круг сили",
  "roles": [
   "hub"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Сяйво піднімається від підлоги"
 },
 {
  "id": "magic-9",
  "name": "Сейф артефактів",
  "roles": [
   "dead"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Замки, закляті сильніше за решту"
 },
 {
  "id": "magic-10",
  "name": "Прихована лабораторія",
  "roles": [
   "secret"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Тут шукали те, що заборонено шукати"
 },
 {
  "id": "magic-11",
  "name": "Серце експерименту",
  "roles": [
   "boss"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Тут щось набагато більше за очікуване"
 },
 {
  "id": "magic-12",
  "name": "Кабінет мага",
  "roles": [
   "boss"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Магія тут густа як туман"
 },
 {
  "id": "magic-13",
  "name": "Передпокій із печатками",
  "roles": [
   "start"
  ],
  "types": [
   "mage-cellar",
   "alchemist-vault",
   "sunken-library",
   "ancient-vault",
   "temple-undercroft"
  ],
  "tags": [],
  "desc": "Охоронні знаки на кожній стіні"
 }
]);
