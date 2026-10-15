// Види кімнат: тема «water». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "water-1",
  "name": "Затоплений тунель",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Вода по пояс, течія тягне до глибини"
 },
 {
  "id": "water-2",
  "name": "Шлюзова камера",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Іржаві колеса й ланцюги керують потоком"
 },
 {
  "id": "water-3",
  "name": "Насосна зала",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Поламані механізми гудуть від вологи"
 },
 {
  "id": "water-4",
  "name": "Басейн",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Широка вода, а берег вузький"
 },
 {
  "id": "water-5",
  "name": "Зала відстійників",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Смердючі чани з осадом"
 },
 {
  "id": "water-6",
  "name": "Рибний склад",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Діжки з давно протухлою рибою"
 },
 {
  "id": "water-7",
  "name": "Причал",
  "roles": [
   "room"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Дерев’яні мостини й прив’язані човни"
 },
 {
  "id": "water-8",
  "name": "Велика цистерна",
  "roles": [
   "hub"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Зі стін ллється вода, а лунають кроки здалеку"
 },
 {
  "id": "water-9",
  "name": "Перехрестя стоків",
  "roles": [
   "hub"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Чотири потоки сходяться в один"
 },
 {
  "id": "water-10",
  "name": "Сховок під ґратами",
  "roles": [
   "dead"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "За рештіткою заховано мішок із речами"
 },
 {
  "id": "water-11",
  "name": "Стік із кістками",
  "roles": [
   "dead"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Що тільки сюди не змивало"
 },
 {
  "id": "water-12",
  "name": "Секретний шлюз",
  "roles": [
   "secret"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Механізм відкриває прохід лише вчасно"
 },
 {
  "id": "water-13",
  "name": "Серце стоків",
  "roles": [
   "boss"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Місце, куди стікається все підземелля"
 },
 {
  "id": "water-14",
  "name": "Спуск до води",
  "roles": [
   "start"
  ],
  "types": [
   "sewer",
   "bog-grotto",
   "sunken-library",
   "smugglers-cove",
   "ruin-cellars",
   "village-cellar"
  ],
  "tags": [],
  "desc": "Східці занурюються в темну воду"
 }
]);
