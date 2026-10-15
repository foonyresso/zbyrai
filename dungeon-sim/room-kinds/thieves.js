// Види кімнат: тема «thieves». Кожен запис: id, name, roles (start|boss|hub|room|dead|secret), types (id підземель з Атласу або «*»), tags (особливості, до яких тяжіє), desc. Додати новий вид = новий запис або новий файл у цій папці, потім node tools/build-dungeon-types.mjs.
DungeonRooms.register([
 {
  "id": "thieves-1",
  "name": "Гральня",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Столи з кістками й картами та кілька дрібних монет"
 },
 {
  "id": "thieves-2",
  "name": "Кімната перекупника",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Чужі речі розкладено за цінами"
 },
 {
  "id": "thieves-3",
  "name": "Зал нарад",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Довгий стіл, схеми міста й карти"
 },
 {
  "id": "thieves-4",
  "name": "Спальня шахраїв",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Брудні ліжка й кілька схованок"
 },
 {
  "id": "thieves-5",
  "name": "Майстерня відмичок",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Тонкі інструменти для будь-яких замків"
 },
 {
  "id": "thieves-6",
  "name": "Кімната допиту",
  "roles": [
   "room"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [
   "cells",
   "blood"
  ],
  "desc": "Лава, кайдани й закривавлені ганчірки"
 },
 {
  "id": "thieves-7",
  "name": "Гільдійна зала",
  "roles": [
   "hub"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Тут вирішуються суперечки й діляться здобичі"
 },
 {
  "id": "thieves-8",
  "name": "Базар злодіїв",
  "roles": [
   "hub"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Підпільна торгівля без питань"
 },
 {
  "id": "thieves-9",
  "name": "Загальна скарбниця",
  "roles": [
   "dead"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Мішки з викупом і краденим"
 },
 {
  "id": "thieves-10",
  "name": "Особиста схованка ватажка",
  "roles": [
   "dead"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Тут він зберігає те, чим не ділиться"
 },
 {
  "id": "thieves-11",
  "name": "Потайний хід ватажка",
  "roles": [
   "secret"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Прохід у стіні для швидкої втечі"
 },
 {
  "id": "thieves-12",
  "name": "Кабінет ватажка",
  "roles": [
   "boss"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Стіл, мапа й гострі речі на стіні"
 },
 {
  "id": "thieves-13",
  "name": "Лігво ватажка",
  "roles": [
   "boss"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Тут він спить, сидить і вирішує долю інших"
 },
 {
  "id": "thieves-14",
  "name": "Караульний пост",
  "roles": [
   "start"
  ],
  "types": [
   "thieves-lair",
   "bandit-hideout",
   "smugglers-cove",
   "arena-depths",
   "prison"
  ],
  "tags": [],
  "desc": "Двоє на варті, один дрімає"
 }
]);
