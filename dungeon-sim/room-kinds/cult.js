// Види кімнат: тема «cult». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "cult-1",
  "name": "Молитовня",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar"
  ],
  "desc": "Свічки в нішах і кілька лав"
 },
 {
  "id": "cult-2",
  "name": "Покої жерців",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Прості ліжка, священні книги й замкнені скрині"
 },
 {
  "id": "cult-3",
  "name": "Зала ритуалів",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar",
   "blood"
  ],
  "desc": "Знаки на підлозі й вогонь у чашах"
 },
 {
  "id": "cult-4",
  "name": "Кімната жертв",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "blood"
  ],
  "desc": "Кам’яний стіл і ланцюги"
 },
 {
  "id": "cult-5",
  "name": "Скарбниця приношень",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar"
  ],
  "desc": "Дари вірян і дещо не зовсім чисте"
 },
 {
  "id": "cult-6",
  "name": "Дзвіниця",
  "roles": [
   "room"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Дзвони й мотузки, що тягнуться вгору"
 },
 {
  "id": "cult-7",
  "name": "Святилище",
  "roles": [
   "hub"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar"
  ],
  "desc": "Вівтар, лави й високе склепіння"
 },
 {
  "id": "cult-8",
  "name": "Реліквійна ніша",
  "roles": [
   "dead"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar"
  ],
  "desc": "Невелика скриня й сяйво над нею"
 },
 {
  "id": "cult-9",
  "name": "Потайний вівтар",
  "roles": [
   "secret"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Тут моляться ті, хто ховається від своїх же"
 },
 {
  "id": "cult-10",
  "name": "Головний вівтар",
  "roles": [
   "boss"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [
   "altar",
   "blood"
  ],
  "desc": "Центр усього культу"
 },
 {
  "id": "cult-11",
  "name": "Вхід у храм",
  "roles": [
   "start"
  ],
  "types": [
   "blood-well-shrine",
   "temple-undercroft",
   "trunk-temple",
   "cloud-monastery-crypt",
   "skull-fortress-depths",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Сходи вниз і кам’яні двері"
 }
]);
