/* Character Roller: закляття SRD 5.1.
   Рядок: рівень|школа|класи|назва українською|оригінал
   Школи: A відхилення, C виклик, D віщування, E зачарування, V евокація, I ілюзія, N некромантія, T трансмутація.
   Класи: B бард, C клірик, D друїд, P паладин, R рейнджер, S чародій, L чаклун, W чарівник. */
(function (root) {
  'use strict';
  const RAW = `
0|C|SW|Кислотний бризок|Acid Splash
0|N|SLW|Крижаний дотик|Chill Touch
0|V|BSW|Танцювальні вогники|Dancing Lights
0|T|D|Друїдизм|Druidcraft
0|V|L|Містичний промінь|Eldritch Blast
0|V|SW|Вогняний снаряд|Fire Bolt
0|D|CD|Настанова|Guidance
0|V|BCSW|Світло|Light
0|C|BSLW|Рука мага|Mage Hand
0|T|BCDSW|Лагодження|Mending
0|T|BSW|Послання|Message
0|I|BSLW|Мала ілюзія|Minor Illusion
0|C|DSLW|Отруйний бризок|Poison Spray
0|T|BSLW|Фокуси|Prestidigitation
0|C|D|Створення полум’я|Produce Flame
0|V|SW|Промінь холоду|Ray of Frost
0|A|CD|Опір|Resistance
0|V|C|Священне полум’я|Sacred Flame
0|T|D|Дубина|Shillelagh
0|V|SW|Вражаючий дотик|Shocking Grasp
0|N|C|Порятунок вмираючого|Spare the Dying
0|T|C|Чудотворство|Thaumaturgy
0|D|BSLW|Влучний удар|True Strike
0|E|B|Злісна насмішка|Vicious Mockery
1|A|RW|Сигналізація|Alarm
1|E|BDR|Дружба з тваринами|Animal Friendship
1|E|BC|Прокляття|Bane
1|E|CP|Благословення|Bless
1|V|SW|Палаючі руки|Burning Hands
1|E|BDSLW|Зачарування особи|Charm Person
1|I|SW|Кольоровий бризок|Color Spray
1|E|CP|Наказ|Command
1|D|BSLW|Розуміння мов|Comprehend Languages
1|T|CD|Створення чи знищення води|Create or Destroy Water
1|V|BCDPR|Лікування ран|Cure Wounds
1|D|CP|Виявлення добра і зла|Detect Evil and Good
1|D|BCDPRSW|Виявлення магії|Detect Magic
1|D|CDPR|Виявлення отрут і хвороб|Detect Poison and Disease
1|I|BSW|Зміна вигляду|Disguise Self
1|V|P|Божественна ласка|Divine Favor
1|C|D|Заплутування|Entangle
1|T|SLW|Швидке відступлення|Expeditious Retreat
1|V|BD|Чарівне полум’я|Faerie Fire
1|N|SW|Фальшиве життя|False Life
1|T|BSW|Падіння пір’їнкою|Feather Fall
1|C|W|Пошук фамільяра|Find Familiar
1|C|DRSW|Хмара туману|Fog Cloud
1|T|DR|Чарівна ягода|Goodberry
1|C|W|Мастило|Grease
1|V|C|Напутній промінь|Guiding Bolt
1|V|BCD|Цілюще слово|Healing Word
1|V|L|Пекельна відсіч|Hellish Rebuke
1|E|BP|Героїзм|Heroism
1|E|BW|Жахливий сміх|Hideous Laughter
1|D|R|Мітка мисливця|Hunter’s Mark
1|D|BW|Розпізнавання|Identify
1|I|BLW|Ілюзорне письмо|Illusory Script
1|N|C|Завдання ран|Inflict Wounds
1|T|DRSW|Стрибок|Jump
1|T|BDRW|Довгоходець|Longstrider
1|A|SW|Магічна броня|Mage Armor
1|V|SW|Магічна стріла|Magic Missile
1|A|CPLW|Захист від добра і зла|Protection from Evil and Good
1|T|CDP|Очищення їжі й напоїв|Purify Food and Drink
1|A|C|Святилище|Sanctuary
1|A|SW|Щит|Shield
1|A|CP|Щит віри|Shield of Faith
1|I|BSW|Безмовний образ|Silent Image
1|E|BSW|Сон|Sleep
1|D|BDR|Розмова з тваринами|Speak with Animals
1|V|BDSW|Хвиля грому|Thunderwave
1|C|BLW|Невидимий слуга|Unseen Servant
1|A|L|Обладунок Агатіса|Armor of Agathys
1|C|L|Руки Хадара|Arms of Hadar
1|E|L|Порча|Hex
1|V|SLW|Відьомський промінь|Witch Bolt
1|C|W|Плавучий диск Тензера|Tenser’s Floating Disk
1|N|SW|Промінь хвороби|Ray of Sickness
2|V|W|Кислотна стріла Мелфа|Melf’s Acid Arrow
2|A|CP|Допомога|Aid
2|T|SW|Зміна форми|Alter Self
2|D|BDR|Тваринний посланець|Animal Messenger
2|A|W|Магічний замок|Arcane Lock
2|D|C|Ворожіння|Augury
2|T|DR|Кора дерева|Barkskin
2|N|BCSW|Сліпота/глухота|Blindness/Deafness
2|I|SW|Розмиття|Blur
2|E|BC|Заспокоєння емоцій|Calm Emotions
2|V|CW|Вічне полум’я|Continual Flame
2|E|BSLW|Божевілля корони|Crown of Madness
2|E|SLW|Темрява|Darkness
2|T|DRSW|Темний зір|Darkvision
2|D|BSW|Виявлення думок|Detect Thoughts
2|T|BCDS|Посилення здібності|Enhance Ability
2|T|BSW|Збільшення/зменшення|Enlarge/Reduce
2|E|BL|Зачарування слухачів|Enthrall
2|D|CDR|Пошук пасток|Find Traps
2|V|D|Полум’яний клинок|Flame Blade
2|C|DW|Полум’яна куля|Flaming Sphere
2|N|CW|М’який спокій|Gentle Repose
2|V|DSW|Порив вітру|Gust of Wind
2|T|BD|Нагрівання металу|Heat Metal
2|E|BCDSLW|Утримання особи|Hold Person
2|I|BLSW|Невидимість|Invisibility
2|T|BSW|Відмикання|Knock
2|A|BCDPR|Мале відновлення|Lesser Restoration
2|T|SW|Левітація|Levitate
2|D|BDR|Пошук тварин чи рослин|Locate Animals or Plants
2|D|BCDPRW|Пошук предмета|Locate Object
2|I|BW|Магічні вуста|Magic Mouth
2|T|PW|Магічна зброя|Magic Weapon
2|I|SLW|Дзеркальний образ|Mirror Image
2|C|SLW|Туманний крок|Misty Step
2|V|D|Місячний промінь|Moonbeam
2|T|DR|Прохід без сліду|Pass without Trace
2|I|BSW|Примарна сила|Phantasmal Force
2|V|C|Молитва зцілення|Prayer of Healing
2|A|CDPR|Захист від отрути|Protection from Poison
2|N|LW|Промінь знесилення|Ray of Enfeeblement
2|T|W|Чарівна мотузка|Rope Trick
2|V|SW|Палаючий промінь|Scorching Ray
2|D|BSW|Бачення невидимого|See Invisibility
2|V|BSLW|Розбиття|Shatter
2|I|BCR|Тиша|Silence
2|T|SLW|Лазіння павуком|Spider Climb
2|T|DR|Колючий ріст|Spike Growth
2|V|C|Духовна зброя|Spiritual Weapon
2|E|BSLW|Навіювання|Suggestion
2|A|C|Захисний зв’язок|Warding Bond
2|C|SW|Павутиння|Web
2|E|BCP|Зона правди|Zone of Truth
3|N|CW|Оживлення мертвих|Animate Dead
3|A|C|Маяк надії|Beacon of Hope
3|N|BCW|Накладення прокляття|Bestow Curse
3|C|SW|Мигання|Blink
3|C|D|Виклик блискавки|Call Lightning
3|D|BCSW|Ясновидіння|Clairvoyance
3|C|DR|Виклик тварин|Conjure Animals
3|A|SLW|Контрзаклинання|Counterspell
3|C|CP|Створення їжі та води|Create Food and Water
3|V|CDPRS|Денне світло|Daylight
3|A|BCDPSLW|Розсіювання магії|Dispel Magic
3|N|BCDW|Удавана смерть|Feign Death
3|I|BSLW|Страх|Fear
3|V|SW|Вогненна куля|Fireball
3|T|SLW|Політ|Fly
3|T|SLW|Газоподібна форма|Gaseous Form
3|A|BCW|Охоронний символ|Glyph of Warding
3|T|SW|Поспіх|Haste
3|I|BSLW|Гіпнотичний візерунок|Hypnotic Pattern
3|C|L|Голод Хадара|Hunger of Hadar
3|V|SW|Блискавка|Lightning Bolt
3|A|CPLW|Магічне коло|Magic Circle
3|I|BSLW|Велика ілюзія|Major Image
3|V|C|Масове цілюще слово|Mass Healing Word
3|T|CD|Злиття з каменем|Meld into Stone
3|A|BRW|Приховування від виявлення|Nondetection
3|C|W|Фантомний скакун|Phantom Steed
3|T|BDR|Ріст рослин|Plant Growth
3|A|CDRSW|Захист від енергії|Protection from Energy
3|A|CPLW|Зняття прокляття|Remove Curse
3|N|CP|Воскресіння з мертвих|Revivify
3|E|BCW|Послання здалеку|Sending
3|C|DSW|Крижана буря|Sleet Storm
3|T|SW|Уповільнення|Slow
3|N|BC|Розмова з мертвими|Speak with Dead
3|T|BDR|Розмова з рослинами|Speak with Plants
3|C|C|Духовні охоронці|Spirit Guardians
3|C|BSW|Смердюча хмара|Stinking Cloud
3|C|BW|Хатина Леомунда|Leomund’s Tiny Hut
3|T|BCSLW|Мови|Tongues
3|N|LW|Вампірський дотик|Vampiric Touch
3|T|DRSW|Дихання під водою|Water Breathing
3|T|CDRS|Ходіння по воді|Water Walk
3|V|DR|Стіна вітру|Wind Wall
4|D|W|Магічне око|Arcane Eye
4|A|CPSLW|Вигнання|Banishment
4|N|DSLW|Всихання|Blight
4|E|B|Примус|Compulsion
4|E|BDSW|Сум’яття|Confusion
4|C|DW|Виклик малих елементалів|Conjure Minor Elementals
4|C|DR|Виклик лісових істот|Conjure Woodland Beings
4|T|CDW|Керування водою|Control Water
4|A|CP|Захист від смерті|Death Ward
4|C|BSLW|Двері вимірів|Dimension Door
4|D|CDW|Віщування|Divination
4|E|DS|Підпорядкування звіра|Dominate Beast
4|C|W|Чорні щупальця Еварда|Evard’s Black Tentacles
4|T|W|Виготовлення|Fabricate
4|V|W|Вогняний щит|Fire Shield
4|A|BCDR|Свобода пересування|Freedom of Movement
4|C|D|Гігантські комахи|Giant Insect
4|I|BSW|Вища невидимість|Greater Invisibility
4|C|C|Страж віри|Guardian of Faith
4|I|BDLW|Ілюзорний рельєф|Hallucinatory Terrain
4|V|DSW|Град|Ice Storm
4|D|BCDPRW|Пошук істоти|Locate Creature
4|A|W|Священне місце Морденкайнена|Mordenkainen’s Private Sanctum
4|A|W|Вірний пес Морденкайнена|Mordenkainen’s Faithful Hound
4|A|W|Магічна аура Арканіста|Arcanist’s Magic Aura
4|V|W|Стійка сфера Отілюка|Otiluke’s Resilient Sphere
4|I|W|Примарний убивця|Phantasmal Killer
4|T|BDSW|Перетворення|Polymorph
4|T|CDW|Формування каменю|Stone Shape
4|T|DRSW|Кам’яна шкіра|Stoneskin
4|V|DSW|Стіна вогню|Wall of Fire
4|T|W|Таємна скриня Леомунда|Leomund’s Secret Chest
5|T|BSW|Оживлення предметів|Animate Objects
5|A|D|Антижиттєва оболонка|Antilife Shell
5|T|BD|Пробудження|Awaken
5|C|SW|Смертельна хмара|Cloudkill
5|D|C|Спілкування|Commune
5|D|DR|Спілкування з природою|Commune with Nature
5|V|SW|Конус холоду|Cone of Cold
5|C|DW|Виклик елементаля|Conjure Elemental
5|D|LW|Контакт з іншим планом|Contact Other Plane
5|N|CD|Зараза|Contagion
5|T|SW|Створення|Creation
5|A|CP|Розвіяння добра і зла|Dispel Evil and Good
5|E|BSW|Підпорядкування особи|Dominate Person
5|I|BLW|Сон-видіння|Dream
5|V|C|Вогняний стовп|Flame Strike
5|E|BCDPW|Заклятття|Geas
5|A|BCD|Велике відновлення|Greater Restoration
5|A|C|Освячення|Hallow
5|E|BSLW|Утримання чудовиська|Hold Monster
5|C|CDS|Чума комах|Insect Plague
5|D|BCW|Знання легенд|Legend Lore
5|V|BCD|Масове лікування ран|Mass Cure Wounds
5|I|BW|Омана|Mislead
5|E|BW|Зміна пам’яті|Modify Memory
5|T|W|Прохід крізь стіну|Passwall
5|A|BCDW|Планарне зв’язування|Planar Binding
5|N|BCP|Підняти мертвого|Raise Dead
5|N|D|Реінкарнація|Reincarnate
5|D|BCDLW|Ясновидіння з відстані|Scrying
5|I|BSW|Личина|Seeming
5|T|SW|Телекінез|Telekinesis
5|T|BW|Телепатичний зв’язок Рарі|Rary’s Telepathic Bond
5|C|BSW|Коло телепортації|Teleportation Circle
5|C|DR|Крок крізь дерева|Tree Stride
5|V|W|Силова стіна|Wall of Force
5|V|DSW|Кам’яна стіна|Wall of Stone
6|A|C|Лезова завіса|Blade Barrier
6|V|SW|Ланцюгова блискавка|Chain Lightning
6|N|SLW|Коло смерті|Circle of Death
6|C|DL|Виклик феї|Conjure Fey
6|A|W|Непередбачуваність|Contingency
6|N|CLW|Створення нежиті|Create Undead
6|T|SW|Дезінтеграція|Disintegrate
6|N|BSLW|Прокляте око|Eyebite
6|D|BCD|Пошук шляху|Find the Path
6|T|LW|Камінь замість плоті|Flesh to Stone
6|A|C|Заборона|Forbiddance
6|V|W|Заморожена сфера Отілюка|Freezing Sphere of Otiluke
6|A|SW|Куля непроникності|Globe of Invulnerability
6|A|BW|Охоронні чари|Guards and Wards
6|N|C|Шкода|Harm
6|V|CD|Зцілення|Heal
6|C|BCD|Бенкет героїв|Heroes’ Feast
6|N|W|Магічний сосуд|Magic Jar
6|E|BSLW|Масове навіювання|Mass Suggestion
6|T|DSW|Переміщення землі|Move Earth
6|E|BW|Нестримний танець Отто|Otto’s Irresistible Dance
6|I|BW|Запрограмована ілюзія|Programmed Illusion
6|V|DSW|Сонячний промінь|Sunbeam
6|D|BCSLW|Істинне бачення|True Seeing
6|T|D|Подорож рослинами|Transport via Plants
6|V|W|Крижана стіна|Wall of Ice
6|C|D|Стіна шипів|Wall of Thorns
6|C|C|Слово повернення|Word of Recall
7|C|C|Виклик небожителя|Conjure Celestial
7|V|SW|Відкладена вогненна куля|Delayed Blast Fireball
7|V|C|Божественне слово|Divine Word
7|T|BCSLW|Ефірність|Etherealness
7|N|SLW|Палець смерті|Finger of Death
7|V|CDS|Вогняна буря|Fire Storm
7|V|BLW|Силова клітка|Forcecage
7|I|BDW|Міраж|Mirage Arcane
7|C|BW|Чудовий особняк Морденкайнена|Mordenkainen’s Magnificent Mansion
7|V|BW|Меч Морденкайнена|Mordenkainen’s Sword
7|C|CDSLW|Зміна площини|Plane Shift
7|E|BSW|Призматичний промінь|Prismatic Spray
7|I|BW|Проєкція образу|Project Image
7|T|BCD|Регенерація|Regenerate
7|N|BC|Воскресіння|Resurrection
7|T|DSW|Зворотна гравітація|Reverse Gravity
7|T|W|Ізоляція|Sequester
7|I|W|Симулякр|Simulacrum
7|A|BCDW|Символ|Symbol
7|C|BSW|Телепортація|Teleport
8|T|D|Тваринні форми|Animal Shapes
8|A|CW|Антимагічне поле|Antimagic Field
8|E|BDW|Антипатія/симпатія|Antipathy/Sympathy
8|N|W|Клон|Clone
8|T|CDW|Керування погодою|Control Weather
8|C|SLW|Окреме виміряння|Demiplane
8|E|BSLW|Підпорядкування чудовиська|Dominate Monster
8|T|CDS|Землетрус|Earthquake
8|E|BDLW|Дурість|Feeblemind
8|E|BL|Красномовство|Glibness
8|A|C|Свята аура|Holy Aura
8|C|DSW|Вогняна хмара|Incendiary Cloud
8|A|W|Лабіринт|Maze
8|A|BW|Порожній розум|Mind Blank
8|E|BSLW|Слово сили: приголомшення|Power Word Stun
8|V|DSW|Сонячний спалах|Sunburst
8|D|W|Телепатія|Telepathy
8|A|LW|Пастка для душі|Trap the Soul
8|C|D|Цунамі|Tsunami
9|D|CLW|Астральна проєкція|Astral Projection
9|D|BDLW|Передбачення|Foresight
9|C|CSW|Врата|Gate
9|A|LW|Ув’язнення|Imprisonment
9|N|C|Масове зцілення|Mass Heal
9|V|SW|Метеоритний дощ|Meteor Swarm
9|V|BC|Слово сили: зцілення|Power Word Heal
9|E|BSLW|Слово сили: смерть|Power Word Kill
9|A|W|Призматична стіна|Prismatic Wall
9|T|DW|Перевтілення|Shapechange
9|C|D|Буря помсти|Storm of Vengeance
9|T|SW|Зупинка часу|Time Stop
9|T|BLW|Істинне перетворення|True Polymorph
9|N|CD|Істинне воскресіння|True Resurrection
9|I|W|Жах|Weird
9|C|SW|Бажання|Wish
`;
  const SCHOOLS = { A: 'відхилення', C: 'виклик', D: 'віщування', E: 'зачарування', V: 'евокація', I: 'ілюзія', N: 'некромантія', T: 'трансмутація' };
  const CLASS_KEY = { B: 'bard', C: 'cleric', D: 'druid', P: 'paladin', R: 'ranger', S: 'sorcerer', L: 'warlock', W: 'wizard' };
  const list = [];
  for (const line of RAW.split('\n')) {
    const p = line.trim().split('|');
    if (p.length < 5) continue;
    const lvl = Number(p[0]);
    const slug = p[4].toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
    list.push({ id: slug, lvl, school: SCHOOLS[p[1]], classes: [...p[2]].map(c => CLASS_KEY[c]), name: p[3], en: p[4] });
  }
  const byId = {};
  for (const s of list) byId[s.id] = s;
  const S = root.SRD = root.SRD || {};
  S.spells = { list, byId };
  if (typeof module !== 'undefined' && module.exports) module.exports = S.spells;
})(typeof globalThis !== 'undefined' ? globalThis : this);
