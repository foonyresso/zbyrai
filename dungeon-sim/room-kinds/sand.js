// Види кімнат: тема «sand». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "sand-1",
  "name": "Зала мумій",
  "roles": [
   "room"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Мумії в нішах, не всі лежать спокійно"
 },
 {
  "id": "sand-2",
  "name": "Кімната слуг",
  "roles": [
   "room"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Поховання слуг, що мали служити й за гробом"
 },
 {
  "id": "sand-3",
  "name": "Коридор пасток",
  "roles": [
   "room"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [],
  "desc": "Плити під ногами не завжди тримають"
 },
 {
  "id": "sand-4",
  "name": "Зала писань",
  "roles": [
   "room"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [
   "library"
  ],
  "desc": "Стіни вкриті зображеннями"
 },
 {
  "id": "sand-5",
  "name": "Зала колон",
  "roles": [
   "hub"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [],
  "desc": "Піщані колони підпирають стелю"
 },
 {
  "id": "sand-6",
  "name": "Скарбова гробниці",
  "roles": [
   "dead"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [
   "cache"
  ],
  "desc": "Дорогі дари, відібрані в живих"
 },
 {
  "id": "sand-7",
  "name": "Прихована камера",
  "roles": [
   "secret"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [],
  "desc": "Ховали тих, чиє ім’я стерли"
 },
 {
  "id": "sand-8",
  "name": "Похоронна камера володаря",
  "roles": [
   "boss"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Золота труна й вартові поруч"
 },
 {
  "id": "sand-9",
  "name": "Піщаний вхід",
  "roles": [
   "start"
  ],
  "types": [
   "sand-tomb"
  ],
  "tags": [],
  "desc": "Пісок під ногами й кам’яні двері"
 }
]);
