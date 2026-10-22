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
 },
 {
  "id": "starodavni-shakhty-velariumu",
  "name": "Стародавні шахти Веларіуму",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "velarium"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "крилаті шахтарі-варуни",
   "кореневі хижаки",
   "гравітаційні скати"
  ],
  "desc": "Шахти під перевернутими материками, де відкриваються портали й гравітаційні колодязі.",
  "sim": null
 },
 {
  "id": "mekhanizmy-kamyanykh-hodynnykiv",
  "name": "Механізми кам'яних годинників",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "noktalis"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "часові двійники",
   "хроножуки",
   "старі воїни"
  ],
  "desc": "Годинникові вузли між часовими пластами: кожен перехід веде в іншу епоху.",
  "sim": null
 },
 {
  "id": "nervovi-vuzly-ormy",
  "name": "Нервові вузли Орми",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "ormaval"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "паразити-пожирачі",
   "імунні колоси",
   "симбіотичні жуки"
  ],
  "desc": "Храмові печери навколо нервових вузлів велета, що реагують на його думки.",
  "sim": null
 },
 {
  "id": "zatopleni-pryplyvni-khramy",
  "name": "Затоплені припливні храми",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "solemor"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "глибоководні королі",
   "небесні скати",
   "соляні істоти"
  ],
  "desc": "Старі храми, затоплені догори дном, у шарах води над материками.",
  "sim": null
 },
 {
  "id": "zaly-pershotvortsiv",
  "name": "Зали Першотворців",
  "anchor": "poi",
  "rooms": [
   21,
   51
  ],
  "levels": [
   1,
   4
  ],
  "length": [
   900,
   3500
  ],
  "area": [
   2300,
   8000
  ],
  "worlds": [
   "kaldras"
  ],
  "monsterIds": [],
  "danger": 5,
  "inhabitants": [
   "автономні сторожі",
   "механічні хижаки",
   "ордени заводчиків"
  ],
  "desc": "Глибини під центральним маятником, де механізм світу досі вдосконалює сам себе.",
  "sim": null
 },
 {
  "id": "chorni-providni-pechery",
  "name": "Чорні провідні печери",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "eshkariya"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "заряджені хижаки",
   "кристалічні бізони",
   "племена провідників"
  ],
  "desc": "Підземні тунелі з чорного магнітного базальту, що проводять блискавки.",
  "sim": null
 },
 {
  "id": "khram-zvorotnykh-dverey",
  "name": "Храм зворотних дверей",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "mirrahon"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "двійники гравця",
   "скляні мисливці",
   "ордени відблисків"
  ],
  "desc": "Храм на межі відображень, двері якого відчиняються лише з іншого боку.",
  "sim": null
 },
 {
  "id": "tuneli-povilnykh-khvyl",
  "name": "Тунелі повільних хвиль",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "drumbor"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "пластинчасті звірі",
   "кам'яні мореплавці",
   "рухомі скельні звірі"
  ],
  "desc": "Глибокі ходи під поверхнею з текучої породи, що змінюють форму за місячними циклами.",
  "sim": null
 },
 {
  "id": "pidzemni-sonyachni-koreni",
  "name": "Підземні сонячні корені",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "aurelit"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "тіньові звірі",
   "світлопожирачі",
   "розщеплені тіні"
  ],
  "desc": "Печери, де сонячні корені з'єднують континенти світлових плато.",
  "sim": null
 },
 {
  "id": "pidzemni-tsarstva-pid-cherepamy",
  "name": "Підземні царства під черепами",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "morgalis"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "хранителі останніх молитов",
   "некромантські ордени",
   "безіменні істоти"
  ],
  "desc": "Царства під черепами божеств, повні молитов і незавершених бажань.",
  "sim": null
 },
 {
  "id": "pidvaly-promenevykh-vezh",
  "name": "Підвали променевих веж",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "vespern"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "сонцесторожі",
   "нічні мисливці",
   "тіньові велети"
  ],
  "desc": "Підземні сховища веж, де зберігаються втрачені променеві ключі.",
  "sim": null
 },
 {
  "id": "pidvisheni-mahnitni-shakhty",
  "name": "Підвішені магнітні шахти",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "ferroks"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "залізні жуки",
   "ковалі-полюсники",
   "метеорні звірі"
  ],
  "desc": "Шахти, що висять між магнітними полюсами: вага спорядження тут змінюється.",
  "sim": null
 },
 {
  "id": "korenevi-zaly-illariyi",
  "name": "Кореневі зали Ілларії",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "illariya"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "кореневі велети",
   "пелюсткові духи",
   "спорові мисливці"
  ],
  "desc": "Підземні зали з коренів і живих сходів під соборними дібровами.",
  "sim": null
 },
 {
  "id": "pidzemni-mista-pid-dyunamy",
  "name": "Підземні міста під дюнами",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "varhess"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "пилові двійники",
   "вітряні жерці",
   "попеляні кочівники"
  ],
  "desc": "Скам'янілі цивілізації, що ховаються під попелястими дюнами.",
  "sim": null
 },
 {
  "id": "porozhni-arkhivy-neverionu",
  "name": "Порожні архіви Неверіону",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "neverion"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "порожнинні мисливці",
   "бездомні титани",
   "шляхотворці"
  ],
  "desc": "Архіви на окремих платформах над порожнечею, куди веде лише вигаданий шлях.",
  "sim": null
 },
 {
  "id": "svitlovi-pechery-pid-pusteleyu",
  "name": "Світлові печери під пустелею",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "heliontar"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "світлові скорпіони",
   "піщані левіафани",
   "жерці сонця"
  ],
  "desc": "Глибокі шахти до підземних сонячних морів і світлових печер.",
  "sim": null
 },
 {
  "id": "pechery-khranyteliv-tyshi",
  "name": "Печери хранителів тиші",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "runhar"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "хранителі тиші",
   "звукові хижаки",
   "гулкі големи"
  ],
  "desc": "Найдавніші печери світу, де абсолютна тиша послаблює простір.",
  "sim": null
 },
 {
  "id": "korenevi-pechery-pid-ostrovamy",
  "name": "Кореневі печери під островами",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "litarkh"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "хижаки-мандрівники",
   "мисливці на корені",
   "острівні плавці"
  ],
  "desc": "Порожнини між кореневими плавцями живих островів, що мігрують морем.",
  "sim": null
 },
 {
  "id": "pidzemni-observatoriyi",
  "name": "Підземні обсерваторії",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "skarveld"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "підземні астрономи",
   "хмарні хижаки",
   "небесні раси"
  ],
  "desc": "Обсерваторії всередині скель із похованими небосхилами над головою.",
  "sim": null
 },
 {
  "id": "khram-minlyvykh-zaliv",
  "name": "Храм мінливих залів",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "kernalis"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "істоти страху",
   "мінливі копії гравця",
   "маскарі"
  ],
  "desc": "Храм, у якому кожен зал відображає інший характер світу.",
  "sim": null
 },
 {
  "id": "kovalski-pechery-embergardu",
  "name": "Ковальські печери Емберґарду",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "embergard"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "ковальські големи",
   "лавові звірі",
   "жарові жерці"
  ],
  "desc": "Ковальські печери й рудні канали навколо розпеченого ядра світу.",
  "sim": null
 },
 {
  "id": "kistyani-pechery-oskariumu",
  "name": "Кістяні печери Оскаріуму",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "oskarium"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "кістяні акули",
   "рифові велети",
   "збирачі фрагментів"
  ],
  "desc": "Печери зі спресованих останків під кістяними морями.",
  "sim": null
 },
 {
  "id": "shary-starykh-form",
  "name": "Шари старих форм",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "eydoliya"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "мінливі хижаки",
   "нестабільні големи",
   "дикі мутанти"
  ],
  "desc": "Кам'яні пласти зі старими формами, що стають на шляху нових.",
  "sim": null
 },
 {
  "id": "zatoplena-katedra-talassyru",
  "name": "Затоплена катедра Талассиру",
  "anchor": "poi",
  "rooms": [
   21,
   51
  ],
  "levels": [
   1,
   4
  ],
  "length": [
   900,
   3500
  ],
  "area": [
   2300,
   8000
  ],
  "worlds": [
   "talassyr"
  ],
  "monsterIds": [],
  "danger": 5,
  "inhabitants": [
   "печерні левіафани",
   "хижаки проток",
   "глибинні клани"
  ],
  "desc": "Підводна катедра в системі печер, де повітряні озера можуть перевернутися.",
  "sim": null
 },
 {
  "id": "burshtynovi-kamery",
  "name": "Бурштинові камери",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "rakhmir"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "смоляні хижаки",
   "бурштинові големи",
   "застиглі істоти"
  ],
  "desc": "Підземні камери з істотами, що застигли в бурштині на останньому русі.",
  "sim": null
 },
 {
  "id": "pechery-hlybokykh-spohadiv",
  "name": "Печери глибоких спогадів",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "umbralit"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "страхітливі двійники",
   "хижаки забуття",
   "хранителі снів"
  ],
  "desc": "Підземелля, що ведуть до найглибших спогадів і кошмарів зниклої цивілізації.",
  "sim": null
 },
 {
  "id": "arkhiv-pershoho-zerna",
  "name": "Архів Першого Зерна",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "arkhelor"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "паразити зародків",
   "насіннєві велети",
   "садівники буття"
  ],
  "desc": "Сховище незароджених світів під поверхнею первісного ґрунту.",
  "sim": null
 },
 {
  "id": "hnizda-fortetsi-valdrenu",
  "name": "Гнізда-фортеці Вальдрену",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "valdren"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "повітряні змії",
   "гірські розбійники",
   "крилаті хижаки"
  ],
  "desc": "Руїни стародавніх фортець, що колись були гніздами велетенських птахів.",
  "sim": null
 },
 {
  "id": "pryplyvni-svyatyni",
  "name": "Припливні святині",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "talmoriya"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "краби-руйнівники",
   "затоплені лицарі",
   "Хранителі Води"
  ],
  "desc": "Затоплені святині, що відкриваються лише під час відпливу.",
  "sim": null
 },
 {
  "id": "pidzemne-misto-kurhaniv",
  "name": "Підземне місто курганів",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "grondar"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "тунельні жуки",
   "заснулі вартові",
   "кротолюди"
  ],
  "desc": "Багаторівневе місто під пагорбом із самотнім деревом: зали, кузні й поховані фортеці.",
  "sim": null
 },
 {
  "id": "porozhnysti-svyatylyshcha",
  "name": "Порожнисті святилища",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "lyumenvild"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "совині хижаки",
   "сутінкові коти",
   "спороносні велети"
  ],
  "desc": "Святилища всередині порожнистих стовбурів, освітлені світними грибами.",
  "sim": null
 },
 {
  "id": "alkhimichni-pohreby-sadiv",
  "name": "Алхімічні погреби садів",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "orchardum"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "отруйні кабани",
   "кореневі охоронці",
   "глиняні помічники"
  ],
  "desc": "Погреби перших алхіміків, де зберігаються рідкісні сорти й рецепти.",
  "sim": null
 },
 {
  "id": "pidzemellya-starykh-krateriv",
  "name": "Підземелля старих кратерів",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "asterfell"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "метеорні жуки",
   "розжарені големи",
   "гірські клановики"
  ],
  "desc": "Шахти й тріщини під кратерами, де осіли уламки небесного заліза.",
  "sim": null
 },
 {
  "id": "korenevi-khody-ternaviyi",
  "name": "Кореневі ходи Тернавії",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "ternaviya"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "колючі хижаки",
   "зарослі големи",
   "броньовані комахи"
  ],
  "desc": "Підземні ходи, прошиті хижими коренями під колючими хащами.",
  "sim": null
 },
 {
  "id": "hazovi-pechery",
  "name": "Газові печери",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "nokserra"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "трясовинні хижаки",
   "вогняні духи",
   "болотні мисливці"
  ],
  "desc": "Печери з газовими тріщинами й мінеральними наростами, де горить синє полум'я.",
  "sim": null
 },
 {
  "id": "pidzemni-halereyi-skulptoriv",
  "name": "Підземні галереї скульпторів",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "kamyanorod"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "статуї-вартові",
   "кам'яні гончі",
   "скульптори-кочівники"
  ],
  "desc": "Галереї покинутих кар'єрів зі статуями, що оживають вночі.",
  "sim": null
 },
 {
  "id": "pechery-vykopnykh-kistok",
  "name": "Печери викопних кісток",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "veletraviya"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "степові засідники",
   "хижі степові коти",
   "мисливські клани"
  ],
  "desc": "Печери в м'якому пісковику зі слідами викопних велетів.",
  "sim": null
 },
 {
  "id": "pechery-skhovyshcha-hlynyanykh-mist",
  "name": "Печери-сховища глиняних міст",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "hlynyshche"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "глиняні сторожі",
   "піщані черви",
   "уламкові жуки"
  ],
  "desc": "Печери-сховища й підземні випалювальні комплекси, що пережили розпад держави.",
  "sim": null
 },
 {
  "id": "smolyani-pechery",
  "name": "Смоляні печери",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "smolyar"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "смоляні павуки",
   "деревні вартові",
   "комахи-хижаки"
  ],
  "desc": "Природні печери під смоляними озерами з законсервованими мешканцями.",
  "sim": null
 },
 {
  "id": "chorni-zaly-pechatok",
  "name": "Чорні зали печаток",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "runozem"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "рунні вартові",
   "тіньові звірі",
   "каменярі-рунотворці"
  ],
  "desc": "Підземні зали, де печатки найслабші, а стародавні чудовиська ближче до свободи.",
  "sim": null
 },
 {
  "id": "pidzemellya-chotyrokh-svyatyn",
  "name": "Підземелля чотирьох святинь",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "sezonariy"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "листяні големи",
   "крижані вовки",
   "хранителі сезонів"
  ],
  "desc": "Сезонні підземелля під святинями весни, літа, осені й зими.",
  "sim": null
 },
 {
  "id": "pidvodni-khramy-fossaru",
  "name": "Підводні храми Фоссару",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "fossar"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "панцирні хижаки",
   "крабові големи",
   "печерні скорпіони"
  ],
  "desc": "Храми, що вціліли в підземних водоймах під сухим морським дном.",
  "sim": null
 },
 {
  "id": "zanedbani-kuzni-rzhavaru",
  "name": "Занедбані кузні Ржавару",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "rzhavar"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "залізні хижаки",
   "рудні вартові",
   "металеві жуки"
  ],
  "desc": "Покинуті кузні в гірських стінах, поглинуті металевими коренями.",
  "sim": null
 },
 {
  "id": "zamerzli-mista",
  "name": "Замерзлі міста",
  "anchor": "poi",
  "rooms": [
   18,
   44
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   800,
   3100
  ],
  "area": [
   2000,
   7000
  ],
  "worlds": [
   "frostheym"
  ],
  "monsterIds": [],
  "danger": 4,
  "inhabitants": [
   "крижані тролі",
   "льодові павуки",
   "підлідні жуки"
  ],
  "desc": "Давні міста під льодовими пластами, куди ведуть крижані печери.",
  "sim": null
 },
 {
  "id": "skarbnytsi-vertykalnykh-pecher",
  "name": "Скарбниці вертикальних печер",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "hlybokray"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "кам'яні гончі",
   "крилаті мисливці",
   "мостові грабіжники"
  ],
  "desc": "Печери й шахти у стінах каньйонів, відкриті старими підйомниками.",
  "sim": null
 },
 {
  "id": "temni-sharovi-pechery",
  "name": "Темні шарові печери",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "paperon"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "пластинчасті жуки",
   "порідні големи",
   "гірські птахи"
  ],
  "desc": "Кишені й печери між шарами породи, відкриті руйнуванням тонких пластів.",
  "sim": null
 },
 {
  "id": "pidzemni-mineralni-dzherela",
  "name": "Підземні мінеральні джерела",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "kaltseron"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "водяні хижаки",
   "карстові големи",
   "панцирні амфібії"
  ],
  "desc": "Тепла карстова система під чашами басейнів, де мінеральна вода будує нові блоки.",
  "sim": null
 },
 {
  "id": "vuhilni-shakhty-vuhlerodu",
  "name": "Вугільні шахти Вуглероду",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "vuhlerod"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "вугільні големи",
   "попелясті вовки",
   "шахтарі"
  ],
  "desc": "Шахти у вугільних жилах під чорними соснами й попелястими галявинами.",
  "sim": null
 },
 {
  "id": "parovi-tuneli-termalisa",
  "name": "Парові тунелі Термаліса",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "termalis"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "парові хижаки",
   "лавові жуки",
   "теплокровні звірі"
  ],
  "desc": "Печери з паровими каналами під геотермальними долинами.",
  "sim": null
 },
 {
  "id": "svyatylyshcha-pid-zolotym-tumanom",
  "name": "Святилища під золотим туманом",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "aurokhm"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "туманні хижаки",
   "руїнні големи",
   "руїнні вартові"
  ],
  "desc": "Затоплені святилища й скарбниці, приховані золотим туманом.",
  "sim": null
 },
 {
  "id": "arsenaly-trykoronu",
  "name": "Арсенали Трикорону",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "trykoron"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "лицарі-відступники",
   "облогові големи",
   "гоблінські загони"
  ],
  "desc": "Підземні арсенали трьох кілець мурів, що ведуть до королівської цитаделі.",
  "sim": null
 },
 {
  "id": "pokhovani-porty",
  "name": "Поховані порти",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "vitroparus"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "піщані хижаки",
   "рейдерські каравани",
   "мисливці за кораблями"
  ],
  "desc": "Напівзасипані доки й корабельні, поховані піском разом із флотом.",
  "sim": null
 },
 {
  "id": "pidzemni-medovi-skhovyshcha",
  "name": "Підземні медові сховища",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "medokray"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "охоронці матки",
   "шершні-берсерки",
   "бджоли-воїни"
  ],
  "desc": "Підземні камери для зберігання меду й воску в незалежних гніздах.",
  "sim": null
 },
 {
  "id": "pidzemni-tsysterny-akvedoru",
  "name": "Підземні цистерни Акведору",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "akvedor"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "канальні мародери",
   "водяні големи",
   "річкові ящери"
  ],
  "desc": "Підземні резервуари під водоводами, до яких ведуть механічні перемикачі.",
  "sim": null
 },
 {
  "id": "pechery-staroyi-shkiry",
  "name": "Печери Старої Шкіри",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "luskariya"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "скельні ящери",
   "панцирні големи",
   "шкіряники"
  ],
  "desc": "Печери під панциром скам'янілого змія, що охороняє приховані входи.",
  "sim": null
 },
 {
  "id": "chornylni-pechery",
  "name": "Чорнильні печери",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "malvar"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "фарбовані големи",
   "охоронці галерей",
   "статуї-вартові"
  ],
  "desc": "Печерні галереї з розписами, що відкривають приховані двері й кімнати.",
  "sim": null
 },
 {
  "id": "svyatylyshcha-vseredyni-heod",
  "name": "Святилища всередині геод",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "skeltsvit"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "кристалічні жуки",
   "кам'яні сторожі",
   "збирачі самоцвітів"
  ],
  "desc": "Святилища й гнізда істот у великих мінеральних утвореннях.",
  "sim": null
 },
 {
  "id": "pidzemni-zernoskhovyshcha",
  "name": "Підземні зерносховища",
  "anchor": "poi",
  "rooms": [
   12,
   30
  ],
  "levels": [
   1,
   2
  ],
  "length": [
   600,
   2300
  ],
  "area": [
   1400,
   5000
  ],
  "worlds": [
   "zhornoverkh"
  ],
  "monsterIds": [],
  "danger": 2,
  "inhabitants": [
   "зерноїдні чудовиська",
   "млинові големи",
   "вітряні големи"
  ],
  "desc": "Глибокі зерносховища під млиновими комплексами, закриті воротами-механізмами.",
  "sim": null
 },
 {
  "id": "shakhty-rudozoru",
  "name": "Шахти Рудозору",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "rudozir"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "рудні жуки",
   "големи-шахтарі",
   "мінеральні жуки"
  ],
  "desc": "Покинуті шахти, заповнені дикими істотами після зникнення гірничих кланів.",
  "sim": null
 },
 {
  "id": "zatopleni-kvartaly-doshchohradu",
  "name": "Затоплені квартали Дощограду",
  "anchor": "poi",
  "rooms": [
   15,
   37
  ],
  "levels": [
   1,
   3
  ],
  "length": [
   700,
   2700
  ],
  "area": [
   1700,
   6000
  ],
  "worlds": [
   "doshchohrad"
  ],
  "monsterIds": [],
  "danger": 3,
  "inhabitants": [
   "каналові хижаки",
   "дахові грабіжники",
   "човнярі"
  ],
  "desc": "Затоплені нижні квартали зі сховищами під старими будинками.",
  "sim": null
 }
]; if (typeof module !== 'undefined') module.exports = g.DungeonTypes; })(typeof globalThis !== 'undefined' ? globalThis : this);
