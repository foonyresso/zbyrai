// Види кімнат: тема «undead». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "undead-1",
  "name": "Родинний склеп",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Ніші з табличками давно вимерлих родів"
 },
 {
  "id": "undead-2",
  "name": "Ніша поховань",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Вузькі ніші в стінах з рештками небіжчиків"
 },
 {
  "id": "undead-3",
  "name": "Зала оплакування",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Тут колись проводили обряди прощання"
 },
 {
  "id": "undead-4",
  "name": "Костниця",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Стіни складені з черепів і кісток"
 },
 {
  "id": "undead-5",
  "name": "Кімната бальзамування",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "lab"
  ],
  "desc": "Столи, глеки зі смолами й бинти"
 },
 {
  "id": "undead-6",
  "name": "Зала саркофагів",
  "roles": [
   "room"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Ряди кам’яних саркофагів, не всі закриті"
 },
 {
  "id": "undead-7",
  "name": "Зала предків",
  "roles": [
   "hub"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "altar"
  ],
  "desc": "Статуї предків стежать за кожним кроком"
 },
 {
  "id": "undead-8",
  "name": "Кругла усипальниця",
  "roles": [
   "hub"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Саркофаги по колу, а в центрі підвищення"
 },
 {
  "id": "undead-9",
  "name": "Усипальниця знаті",
  "roles": [
   "dead"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Багато оздоблений саркофаг і дорогі дари"
 },
 {
  "id": "undead-10",
  "name": "Забута могила",
  "roles": [
   "dead"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Простий камінь і прикраси, що ніхто не забрав"
 },
 {
  "id": "undead-11",
  "name": "Потайний склеп",
  "roles": [
   "secret"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Ховали того, про кого не мали права говорити"
 },
 {
  "id": "undead-12",
  "name": "Гробниця володаря",
  "roles": [
   "boss"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [
   "tombs"
  ],
  "desc": "Тут спочиває той, кого не варто будити"
 },
 {
  "id": "undead-13",
  "name": "Трон мерців",
  "roles": [
   "boss"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Нежить підкоряється тому, хто сидить на цьому троні"
 },
 {
  "id": "undead-14",
  "name": "Передсклепна",
  "roles": [
   "start"
  ],
  "types": [
   "catacombs",
   "crypt",
   "barrow",
   "cloud-monastery-crypt",
   "temple-undercroft",
   "sand-tomb",
   "skull-fortress-depths",
   "blood-well-shrine",
   "ancient-vault"
  ],
  "tags": [],
  "desc": "Холодне повітря й тиша після вхідних дверей"
 }
]);
