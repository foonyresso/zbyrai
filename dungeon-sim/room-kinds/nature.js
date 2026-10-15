// Види кімнат: тема «nature». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "nature-1",
  "name": "Печерна зала",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Склепіння спадає зі стелі гострими зубами"
 },
 {
  "id": "nature-2",
  "name": "Зала сталактитів",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Крапає вода, а лунає кожен крок"
 },
 {
  "id": "nature-3",
  "name": "Підземне озеро",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Чорна вода й вузький берег"
 },
 {
  "id": "nature-4",
  "name": "Грот зі струмком",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "flooded"
  ],
  "desc": "Тихий струмок дзюрчить у темряві"
 },
 {
  "id": "nature-5",
  "name": "Лігво звіра",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Кістки й роздерті шкури на підлозі"
 },
 {
  "id": "nature-6",
  "name": "Нора",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Тісний лаз веде до кількох ніш"
 },
 {
  "id": "nature-7",
  "name": "Грибний садок",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "webs"
  ],
  "desc": "Світні гриби розкидані по стінах"
 },
 {
  "id": "nature-8",
  "name": "Гніздова камера",
  "roles": [
   "room"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Гнізда з гілок, кісток і чужої здобичі"
 },
 {
  "id": "nature-9",
  "name": "Велика печера",
  "roles": [
   "hub"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Склепіння губиться десь вгорі"
 },
 {
  "id": "nature-10",
  "name": "Печерний вузол",
  "roles": [
   "hub"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Десятки ходів розходяться в усі боки"
 },
 {
  "id": "nature-11",
  "name": "Кістяний тупик",
  "roles": [
   "dead"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Купа кісток, залишок недавніх бенкетів"
 },
 {
  "id": "nature-12",
  "name": "Кришталева ніша",
  "roles": [
   "dead"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "crystals"
  ],
  "desc": "Кристали спалахують під вогнем факела"
 },
 {
  "id": "nature-13",
  "name": "Прихована порожнина",
  "roles": [
   "secret"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Вхід закриває валун і ледь помітна щілина"
 },
 {
  "id": "nature-14",
  "name": "Лігво володаря",
  "roles": [
   "boss"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Сліди таких розмірів, що важко повірити"
 },
 {
  "id": "nature-15",
  "name": "Гніздо матері",
  "roles": [
   "boss"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [
   "nests"
  ],
  "desc": "Усі інші лише охороняють її виводок"
 },
 {
  "id": "nature-16",
  "name": "Печерний вхід",
  "roles": [
   "start"
  ],
  "types": [
   "mountain-cave",
   "blue-hollow-caves",
   "nest-grottoes",
   "occupied-warren",
   "scorpion-burrows",
   "star-cavern",
   "great-hollow",
   "root-knot-depths",
   "trunk-fortress",
   "trunk-temple",
   "fungus-caverns",
   "frost-cave",
   "bog-grotto",
   "dragon-lair",
   "ember-tunnels",
   "mine"
  ],
  "tags": [],
  "desc": "Холодний вітер із глибини"
 }
]);
