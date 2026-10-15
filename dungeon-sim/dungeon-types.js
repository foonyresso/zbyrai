/* Автоматично: node tools/build-dungeon-types.mjs з medieval-world/dungeons/*.js. Не правити вручну. */
(function (g) { g.DungeonTypes = [
 {
  "id": "sewer",
  "name": "Каналізація",
  "anchor": "city",
  "rooms": [
   10,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2500
  ],
  "area": [
   800,
   4000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 1,
  "inhabitants": [
   "щури-мутанти",
   "контрабандисти",
   "болотяні примари"
  ],
  "desc": "Тунелі під вулицями з кільцевою каналізацією; у місті цьому відповідає шар «Підземелля» в детальному вигляді.",
  "sim": null
 },
 {
  "id": "catacombs",
  "name": "Катакомби",
  "anchor": "city",
  "rooms": [
   20,
   60
  ],
  "levels": [
   2,
   3
  ],
  "length": [
   1200,
   4000
  ],
  "area": [
   2500,
   9000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "скелети",
   "упирі",
   "культисти"
  ],
  "desc": "Склепи й ходи під старими кварталами та цвинтарем.",
  "sim": null
 },
 {
  "id": "thieves-lair",
  "name": "Лігво гільдії злодіїв",
  "anchor": "city",
  "rooms": [
   12,
   25
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   500,
   1800
  ],
  "area": [
   900,
   3000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "злодії",
   "душогуби",
   "контрабандисти"
  ],
  "desc": "Потайні кімнати під ринком чи портом.",
  "sim": null
 },
 {
  "id": "royal-vault",
  "name": "Підземна скарбниця",
  "anchor": "city",
  "rooms": [
   15,
   40
  ],
  "levels": [
   2,
   3
  ],
  "length": [
   800,
   3000
  ],
  "area": [
   1800,
   6000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "вартові",
   "пастки",
   "привиди скарбників"
  ],
  "desc": "Скарбниця й тюрма під палацом столиці.",
  "sim": null
 },
 {
  "id": "ruin-cellars",
  "name": "Підвали зруйнованого поселення",
  "anchor": "settlement",
  "rooms": [
   3,
   9
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   80,
   300
  ],
  "area": [
   150,
   600
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 1,
  "inhabitants": [
   "щури",
   "безхатченки",
   "привиди колишніх мешканців"
  ],
  "desc": "Підвали й льохи, що вціліли під руїнами.",
  "sim": null
 },
 {
  "id": "crypt",
  "name": "Склеп",
  "anchor": "settlement",
  "rooms": [
   4,
   12
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   100,
   400
  ],
  "area": [
   200,
   800
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "скелети",
   "привиди"
  ],
  "desc": "Родинний склеп біля покинутого храму чи цвинтаря.",
  "sim": null
 },
 {
  "id": "occupied-warren",
  "name": "Лігво загарбників",
  "anchor": "settlement",
  "rooms": [
   5,
   14
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   150,
   500
  ],
  "area": [
   300,
   1000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "монстри-загарбники",
   "їхній виводок"
  ],
  "desc": "Підвали й тунелі під захопленим монстрами поселенням.",
  "sim": null
 },
 {
  "id": "village-cellar",
  "name": "Старий льох",
  "anchor": "settlement",
  "rooms": [
   2,
   5
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   40,
   140
  ],
  "area": [
   80,
   300
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 1,
  "inhabitants": [
   "щури",
   "контрабандисти"
  ],
  "desc": "Старий льох під поселенням, про який мало хто знає.",
  "sim": null
 },
 {
  "id": "ancient-vault",
  "name": "Давнє підземелля",
  "anchor": "poi",
  "rooms": [
   15,
   45
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   900,
   3500
  ],
  "area": [
   2000,
   8000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "давні вартові",
   "нежить",
   "грабіжники"
  ],
  "desc": "Підземні поверхи під старими руїнами.",
  "sim": null
 },
 {
  "id": "keep-cellars",
  "name": "Підвали зруйнованого замку",
  "anchor": "poi",
  "rooms": [
   10,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   500,
   2000
  ],
  "area": [
   1500,
   5000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "привиди гарнізону",
   "бандити",
   "щури-гіганти"
  ],
  "desc": "Склади, в'язниці й казарми замку, що провалився під землю.",
  "sim": null
 },
 {
  "id": "temple-undercroft",
  "name": "Підземний монастир",
  "anchor": "poi",
  "rooms": [
   8,
   25
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   400,
   1600
  ],
  "area": [
   1200,
   4000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "ченці-привиди",
   "культисти",
   "реліквійні вартові"
  ],
  "desc": "Крипта, келії й сховище реліквій під храмом.",
  "sim": null
 },
 {
  "id": "mage-cellar",
  "name": "Лабораторія під вежею мага",
  "anchor": "poi",
  "rooms": [
   8,
   20
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   300,
   1200
  ],
  "area": [
   900,
   3000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "створені магом істоти",
   "големи",
   "елементалі"
  ],
  "desc": "Лабораторії й клітки під вежею.",
  "sim": null
 },
 {
  "id": "mine",
  "name": "Покинута шахта",
  "anchor": "poi",
  "rooms": [
   8,
   30
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   500,
   3000
  ],
  "area": [
   1000,
   6000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "гномі привиди",
   "печерні тварі",
   "бандити"
  ],
  "desc": "Старі штреки, що обвалилися чи наткнулися на печерну систему.",
  "sim": null
 },
 {
  "id": "mountain-cave",
  "name": "Печерна система",
  "anchor": "poi",
  "rooms": [
   6,
   25
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   400,
   2500
  ],
  "area": [
   800,
   5000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "ведмеді",
   "печерні монстри"
  ],
  "desc": "Природні печери під горою; великі системи сполучаються зі шахтами.",
  "sim": null
 },
 {
  "id": "barrow",
  "name": "Курган-усипальня",
  "anchor": "poi",
  "rooms": [
   3,
   10
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   100,
   500
  ],
  "area": [
   150,
   700
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "нежить",
   "могильні варти"
  ],
  "desc": "Усипальня під давнім пам'ятником чи знаком.",
  "sim": null
 },
 {
  "id": "bandit-hideout",
  "name": "Сховок бандитів",
  "anchor": "poi",
  "rooms": [
   3,
   8
  ],
  "levels": [
   1,
   1
  ],
  "length": [
   100,
   400
  ],
  "area": [
   200,
   700
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 1,
  "inhabitants": [
   "бандити",
   "полонені"
  ],
  "desc": "Підземний схрон табору.",
  "sim": null
 },
 {
  "id": "star-cavern",
  "name": "Зоряна порожнина",
  "anchor": "poi",
  "rooms": [
   10,
   40
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   700,
   3000
  ],
  "area": [
   2000,
   8000
  ],
  "worlds": [
   "astrakor"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "панцирні коренегризи",
   "світні кристалічні істоти"
  ],
  "desc": "Велика печера всередині материка зі світними кристалами; ходи коренегризів зв'язують порожнини між собою.",
  "sim": null
 },
 {
  "id": "trunk-fortress",
  "name": "Фортеця всередині стовбура",
  "anchor": "poi",
  "rooms": [
   15,
   40
  ],
  "levels": [
   3,
   5
  ],
  "length": [
   500,
   2000
  ],
  "area": [
   1500,
   6000
  ],
  "worlds": [
   "astrakor"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "кореневі велети",
   "вартові племен"
  ],
  "desc": "Фортеця, вирізана всередині стовбура; сходи ведуть угору й униз до коренів.",
  "sim": null
 },
 {
  "id": "root-knot-depths",
  "name": "Підземелля Кореневого вузла",
  "anchor": "poi",
  "rooms": [
   30,
   80
  ],
  "levels": [
   3,
   6
  ],
  "length": [
   2000,
   6000
  ],
  "area": [
   6000,
   20000
  ],
  "worlds": [
   "astrakor"
  ],
  "monsterIds": [],
  "danger": 5,
  "inhabitants": [
   "Матір Коренів",
   "кореневі велети"
  ],
  "desc": "Храм у місці, де корені сходяться до одного вузла; нижче — лігво Матері Коренів.",
  "sim": null
 },
 {
  "id": "palace-cellar-mine",
  "name": "Шахта-підвал палацу",
  "anchor": "poi",
  "rooms": [
   15,
   40
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   800,
   3000
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "ostanky"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "уламкові големи",
   "збирачі решток"
  ],
  "desc": "Шахта, що переходить у підвал знищеного палацу.",
  "sim": null
 },
 {
  "id": "torn-castle-vaults",
  "name": "Підвали розірваного замку",
  "anchor": "settlement",
  "rooms": [
   10,
   35
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   600,
   2500
  ],
  "area": [
   1500,
   6000
  ],
  "worlds": [
   "ostanky"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "безликі лицарі",
   "хижаки руїн"
  ],
  "desc": "Три частини замку мають три різні підвали, що колись були одним.",
  "sim": null
 },
 {
  "id": "blood-well-shrine",
  "name": "Підземне святилище колодязя",
  "anchor": "poi",
  "rooms": [
   8,
   30
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   400,
   2000
  ],
  "area": [
   1200,
   5000
  ],
  "worlds": [
   "krovostep"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "кров'яні лицарі",
   "жерці крові"
  ],
  "desc": "Багаторівневі сходи колодязя ведуть до святилища давнього божества.",
  "sim": null
 },
 {
  "id": "scorpion-burrows",
  "name": "Нори червоних скорпіонів",
  "anchor": "poi",
  "rooms": [
   6,
   20
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   300,
   1500
  ],
  "area": [
   800,
   3500
  ],
  "worlds": [
   "krovostep"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "червоні скорпіони",
   "Королева Червоних Скорпіонів"
  ],
  "desc": "Нори й камери з виводком під сухими судинами.",
  "sim": null
 },
 {
  "id": "skull-fortress-depths",
  "name": "Фортеця в черепі велетня",
  "anchor": "poi",
  "rooms": [
   20,
   60
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   1000,
   4000
  ],
  "area": [
   3000,
   12000
  ],
  "worlds": [
   "krovostep"
  ],
  "monsterIds": [],
  "danger": 5,
  "inhabitants": [
   "Безсердечний Король",
   "кров'яні лицарі"
  ],
  "desc": "Фортеця в черепі велетенського скелета: ребра слугують мостами, а під черепом ідуть підвали.",
  "sim": null
 },
 {
  "id": "trunk-temple",
  "name": "Храм у стовбурі",
  "anchor": "poi",
  "rooms": [
   10,
   30
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   400,
   1800
  ],
  "area": [
   1200,
   5000
  ],
  "worlds": [
   "vershynnytsia"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "деревні павуки",
   "дереволази-жерці"
  ],
  "desc": "Храм усередині стовбура, сходи ведуть до коренів і нагору до дупел.",
  "sim": null
 },
 {
  "id": "great-hollow",
  "name": "Велике дупло з підземними проходами",
  "anchor": "poi",
  "rooms": [
   12,
   40
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   800,
   3000
  ],
  "area": [
   2500,
   9000
  ],
  "worlds": [
   "vershynnytsia"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "павуки",
   "кореневі звірі"
  ],
  "desc": "Дупло, що веде в підземні проходи між корінням сусідніх дерев.",
  "sim": null
 },
 {
  "id": "blue-hollow-caves",
  "name": "Печери Блакитної порожнини",
  "anchor": "poi",
  "rooms": [
   8,
   25
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   500,
   2000
  ],
  "area": [
   1500,
   5000
  ],
  "worlds": [
   "neborid"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "туманні хижаки",
   "хмарні скати"
  ],
  "desc": "Печери між хмарними шарами; стелі й підлоги світяться паморозззю.",
  "sim": null
 },
 {
  "id": "cloud-monastery-crypt",
  "name": "Крипта гірського монастиря",
  "anchor": "poi",
  "rooms": [
   8,
   22
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   300,
   1400
  ],
  "area": [
   1000,
   4000
  ],
  "worlds": [
   "neborid"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "ченці-привиди",
   "вартові громовідводів"
  ],
  "desc": "Підземні келії й сховище під монастирем на вершині.",
  "sim": null
 },
 {
  "id": "nest-grottoes",
  "name": "Гроти порожніх гнізд",
  "anchor": "poi",
  "rooms": [
   5,
   18
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   300,
   1200
  ],
  "area": [
   800,
   3000
  ],
  "worlds": [
   "midnokryl"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "скельні хижаки",
   "агресивні птахи"
  ],
  "desc": "Печери за покинутими гніздами, в які оселилися хижаки.",
  "sim": null
 },
 {
  "id": "prison",
  "name": "Каземат",
  "anchor": "city",
  "rooms": [
   8,
   24
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   500,
   1800
  ],
  "area": [
   700,
   3000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "наглядачі",
   "в'язні-бунтівники",
   "привиди страчених"
  ],
  "desc": "Тюрма під містом: камери, допитні й похмурі коридори.",
  "sim": {
   "tags": {
    "cells": 60,
    "blood": 15,
    "rubble": 10
   },
   "corr": 30,
   "cave": false
  }
 },
 {
  "id": "dragon-lair",
  "name": "Лігво дракона",
  "anchor": "poi",
  "rooms": [
   6,
   16
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   800,
   2500
  ],
  "area": [
   2000,
   8000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 5,
  "inhabitants": [
   "дракон",
   "кобольди-прислужники",
   "скарбошукачі"
  ],
  "desc": "Величезна печера зі скарбами та кістками тих, хто прийшов по них.",
  "sim": {
   "tags": {
    "cache": 70,
    "rubble": 30,
    "crystals": 20
   },
   "corr": 5,
   "cave": true
  }
 },
 {
  "id": "frost-cave",
  "name": "Крижана печера",
  "anchor": "poi",
  "rooms": [
   8,
   26
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2200
  ],
  "area": [
   1500,
   6000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "крижані вовки",
   "сніжні примари",
   "льодяні големи"
  ],
  "desc": "Печери, скуті кригою, з промерзлими озерцями й крижаними залами.",
  "sim": {
   "tags": {
    "crystals": 50,
    "flooded": 20,
    "nests": 25
   },
   "corr": 5,
   "cave": true
  }
 },
 {
  "id": "ember-tunnels",
  "name": "Вогняні тунелі",
  "anchor": "poi",
  "rooms": [
   10,
   30
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   900,
   3000
  ],
  "area": [
   1500,
   6000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "вогняні елементалі",
   "попелясті тварі",
   "магмові слизи"
  ],
  "desc": "Розпечені тунелі біля вулканічних жил, де повітря тремтить від жару.",
  "sim": {
   "tags": {
    "rubble": 40,
    "ore": 30,
    "blood": 15
   },
   "corr": 10,
   "cave": true
  }
 },
 {
  "id": "sunken-library",
  "name": "Затоплена бібліотека",
  "anchor": "poi",
  "rooms": [
   10,
   28
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   700,
   2400
  ],
  "area": [
   1200,
   5000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "книжкові привиди",
   "хранителі сувоїв",
   "болотні слизи"
  ],
  "desc": "Колись велика бібліотека, нині напівзатоплена, з розмоклими фоліантами.",
  "sim": {
   "tags": {
    "library": 65,
    "flooded": 40,
    "webs": 20
   },
   "corr": 8,
   "cave": false
  }
 },
 {
  "id": "sand-tomb",
  "name": "Піщана гробниця",
  "anchor": "poi",
  "rooms": [
   12,
   36
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   900,
   3000
  ],
  "area": [
   1500,
   6500
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "мумії",
   "скарабеї-стражі",
   "жерці-вартові"
  ],
  "desc": "Гробниця правителя, засипана піском, із пастками й похованнями слуг.",
  "sim": {
   "tags": {
    "tombs": 55,
    "cache": 35,
    "webs": 15
   },
   "corr": 10,
   "cave": false
  }
 },
 {
  "id": "delve-city",
  "name": "Покинуте підземне місто",
  "anchor": "poi",
  "rooms": [
   25,
   80
  ],
  "levels": [
   2,
   4
  ],
  "length": [
   2500,
   9000
  ],
  "area": [
   4000,
   16000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "духи мешканців",
   "глибинні мисливці",
   "бандити-мародери"
  ],
  "desc": "Ціла підземна вулиця з будинками, майстернями й залами зборів, давно покинута.",
  "sim": {
   "tags": {
    "rubble": 35,
    "ore": 20,
    "cache": 25
   },
   "corr": 15,
   "cave": false
  }
 },
 {
  "id": "bog-grotto",
  "name": "Болотна печера",
  "anchor": "poi",
  "rooms": [
   6,
   20
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   500,
   1800
  ],
  "area": [
   800,
   3500
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "болотні відьми",
   "трясинні тварі",
   "мерзенні жаби"
  ],
  "desc": "Сирі печери під болотом, де вода доходить до кісточок, а подекуди й до пояса.",
  "sim": {
   "tags": {
    "flooded": 65,
    "webs": 20,
    "nests": 25
   },
   "corr": 8,
   "cave": true
  }
 },
 {
  "id": "fungus-caverns",
  "name": "Грибні печери",
  "anchor": "poi",
  "rooms": [
   10,
   34
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   700,
   2800
  ],
  "area": [
   1500,
   6000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "грибні велети",
   "спорові тварі",
   "гноми-збирачі"
  ],
  "desc": "Печери, поросли світними грибами, спори яких змінюють тих, хто довго тут дихає.",
  "sim": {
   "tags": {
    "nests": 30,
    "crystals": 25,
    "webs": 25
   },
   "corr": 5,
   "cave": true
  }
 },
 {
  "id": "smugglers-cove",
  "name": "Печера контрабандистів",
  "anchor": "poi",
  "rooms": [
   6,
   18
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   400,
   1500
  ],
  "area": [
   700,
   3000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "контрабандисти",
   "вартові-найманці",
   "дресировані звірі"
  ],
  "desc": "Прихований порт і склади в підземеллі, куди заходять човни без вогнів.",
  "sim": {
   "tags": {
    "cache": 55,
    "flooded": 30,
    "cells": 10
   },
   "corr": 25,
   "cave": false
  }
 },
 {
  "id": "arena-depths",
  "name": "Підземна арена",
  "anchor": "city",
  "rooms": [
   8,
   22
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   500,
   1800
  ],
  "area": [
   1000,
   4000
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "гладіатори",
   "звірі арени",
   "організатори боїв"
  ],
  "desc": "Нелегальна арена під містом: клітки, трибуни й комори зі зброєю.",
  "sim": {
   "tags": {
    "cells": 40,
    "blood": 35,
    "cache": 15
   },
   "corr": 20,
   "cave": false
  }
 },
 {
  "id": "alchemist-vault",
  "name": "Лабораторія алхіміків",
  "anchor": "poi",
  "rooms": [
   8,
   24
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2200
  ],
  "area": [
   1000,
   4500
  ],
  "worlds": "all",
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "алхіміки-відлюдники",
   "трансмутовані істоти",
   "живі слизи"
  ],
  "desc": "Підземні лабораторії, де експерименти давно вийшли з-під контролю.",
  "sim": {
   "tags": {
    "lab": 60,
    "library": 25,
    "cache": 15
   },
   "corr": 10,
   "cave": false
  }
 }
]; if (typeof module !== 'undefined') module.exports = g.DungeonTypes; })(typeof globalThis !== 'undefined' ? globalThis : this);
