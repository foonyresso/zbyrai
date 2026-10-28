# Навігатор репозиторію Zbyrai

Головна точка входу для тих, хто шукає, що де лежить. Документація розбита за темами в `docs/`:

| Файл | Про що |
|---|---|
| [../mechanics/README.md](../mechanics/README.md) | Механіки: інтерфейси й формати |
| [zakladyny.md](zakladyny.md) | Закладини: правила гри, баланс |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Головна ідея сайту: механіки окремо (`mechanics/`), інструменти їх комбінують; перелік механік |
| [tools-map.md](tools-map.md) | Кожен інструмент: папка, код, тести, ключ localStorage |
| [shared-files.md](shared-files.md) | Спільні файли: тема, хаб, sitemap, скрипти в `tools/` |
| [settlement-sim.md](settlement-sim.md) | Симуляція поселення: карта файлів, порядок скриптів, як влаштовані жителі, бій і місто |
| [new-tool-guide.md](new-tool-guide.md) | Як додати новий інструмент за правилами сайту |
| [prompt-dice-map.md](prompt-dice-map.md) | Кубик промптів: карта файлів, порядок скриптів, де що змінювати |
| [file-rules.md](file-rules.md) | Правила розбиття файлів і документації, роботи з великими текстами |
| [large-files.md](large-files.md) | Файли, що завеликі або близькі до межі (кандидати на розбиття) |
| [atlas/world-files.md](atlas/world-files.md), [atlas/biome-files.md](atlas/biome-files.md), [atlas/monster-files.md](atlas/monster-files.md), [atlas/dungeon-files.md](atlas/dungeon-files.md), [atlas/monster-batch-2.md](atlas/monster-batch-2.md), [atlas/monster-batch-3.md](atlas/monster-batch-3.md), [atlas/biomes-import.md](atlas/biomes-import.md), [atlas/race-files.md](atlas/race-files.md), [atlas/infinite-world-features.md](atlas/infinite-world-features.md), [plans/world-generator-queue.md](plans/world-generator-queue.md) | Формат файлів світів, біомів, монстрів (версії 1 і 2, поле lore) і підземель (версія 2), рас (версія 2), шаблони, вибір біомів, відстані монстрів від поселень, прив'язка підземель |
| [atlas/continent/README.md](atlas/continent/README.md) | Атлас, світ «Материк» (колишня карта королівств): ієрархія, дороги, монстри гір/лісів/морів, алгоритм, перенесення в Godot C#, покращення |
| [atlas2/DESIGN.md](atlas2/DESIGN.md) | Атлас 2.0: дизайн нового генератора світу (ландшафт, води, міста, провінції, дороги), етапи, чанки |
| [atlas2/castles.md](atlas2/castles.md) | Атлас 2.0: замки в містах: ділянка з плану вулиць, мур, види, програма споруд, дороги до воріт, формат `city.keep`, файли й тест |
| [data-versions.md](data-versions.md) | Версії форматів збережень і що в них змінилось |
| [ui-kit.md](ui-kit.md), [ui-migration.md](ui-migration.md) | UI-кіт (інтерфейс як Атлас 2.0: `shared/ui/`), розмітка, як перевести інструмент; черга міграції й питання |
| [plans/ui-rollout-queue.md](plans/ui-rollout-queue.md) | Черга: єдиний стиль інструментів (полотно + іконки) і доробки, статуси |
| [plans/dungeon-sim-queue.md](plans/dungeon-sim-queue.md) | Черга задач симулятора підземель |
| [plans/album-builder-queue.md](plans/album-builder-queue.md) | Черга закритого «Макетника альбомів» (`album-builder/`, не лінкується з хабу) |
| [plans/skill-forge-queue.md](plans/skill-forge-queue.md) | Черга задач Конструктора скілів |
| [plans/README.md](plans/README.md) | Плани: принцип «полотно + іконки», перелік інструментів, злиття карти королівств у Атлас, рішення автора, пріоритети, питання про суперечності |
| [skill-forge-format.md](skill-forge-format.md) | Конструктор скілів: формат `zbyrai.skill` (версія 1), види цеглинок, як додати цеглинку, зв'язок з деревом скілів, перенесення в Godot C# |
| [edits/00-index.md](edits/00-index.md), [edits/16-status.md](edits/16-status.md) | Стиснуті правки автора («новий 3.txt») по інструментах: що просив, суперечності, що зроблено |

## Карта верхнього рівня

```
mechanics/               механіки окремо (rng, atlas-map, trade, building, settlers, threats, needs, schedule, combat, spawner, pathgrid): чиста логіка, без DOM; їх комбінують інструменти (див. ARCHITECTURE.md)
settlement-sim/          Симуляція поселення (20 жителів, день і ніч, бої): див. settlement-sim.md; спрайти кодом (px, biped, buildings…), layout.js, routine/social/defend.js
zakladyny/               гра «Закладини»: комбінує механіки; zk-game.js (доба), zk-save.js, zk-render.js, zk-panels.js, app.js
index.html, assets/      головна сторінка (хаб) і її стилі/скрипт
shared/ui/               UI-кіт: zb-ui.css + zb-ui.js (верхня панель, іконки-меню, панелі, довідка «i»); копії в інструментах на кіті (atlas2, tessera)
shared/theme.css        єдина тема (джерело); shared/tool-chrome.js: кнопка «Інфо», якір, клавіші (джерело)
tools/                   sync-theme.mjs, ui-rules.test.js, build-world-themes.mjs (теми вимірів із палітр lore), build-atlas-registry.mjs (оновлює medieval-world/registry.js), atlas-registry.test.js
image-converter/         Конвертер зображень (convert-core, zip-core, convert-render, воркер і пул, app.js)
<інструмент>/            index.html, app.js, *-core.js, style.css, theme.css, README.md, test/
prompt-dice/             Кубик промптів: pools/styles/types (параметри), flux-*.js (Flux), mk-*.js (манекен: фігура, категорії, слоти), menu-tree.js (дані меню: категорії → підгрупи), ui-menu.js (дерево й пошук), ui-workspace.js і ui-cards.js (центр: групи й картки), ui-mannequin.js (манекен), ui-dialogs.js (історія, пресети, налаштування), app.js (стан і збирання промптів)
medieval-world/          «Проект Атлас»: src/ (нескінченний світ, render/world/style.js — тема виміру, місто, core/atlas.js реєстр), worlds/<id>/world.js (по світу на файл; continent/ має власний код), src/generation/world/settle-water.js (місто стає на берег моря/озера/річки: пошук води, SE з реального берега, русло з річок світу), src/render/world/hover-region.js (підсвітка провінції/регіону при наведенні), biomes/<id>.js (по біому на файл), monsters/<id>.js (по монстру), dungeons/<id>.js (по типу підземелля), registry.js (генерується)
atlas2/                  Атлас 2.0 (виміри «Основний світ» і «Астракор»: core/astrakor.js, core/astrawall.js (стіна й фортеці-поселення), core/townfort.js (місто-фортеця), core/townmon.js + core/monorder.js (лад і споруди орди в окупованих містах), core/subbiomes.js + core/biomedata.js (генерує tools/build-atlas2-biomes.mjs), render/void.js, test/dimension.test.js; меню «Як працює» — покадрова демонстрація генерації світу й міста: ui/steps*.js, render/steps-*.js, core/citytrace.js; детальне місто: core/town*.js, render/town.js, ui/town.js; замки в містах: core/castle*.js, core/townkeep.js, render/townkeep.js (мур, башти, брами, двори, плашка) і render/townkeepb.js (споруди замку) (див. docs/atlas2/castles.md); підземелля: core/dungeon*.js, render/dungeon.js, ui/dungeon.js, dungeon.css; core/ логіка, render/, ui/, test/; README.md всередині; старий `medieval-world/` схований з хабу, відкривається за прямим посиланням)
taste/                   закрита довідка про смаки автора (не інструмент)
docs/                    ця документація; docs/edits/ — стиснуті правки автора по інструментах; docs/plans/ — плани розвитку; docs/atlas/ — документація Атласу
README.md, ROADMAP.md    опис для людей; план і передача роботи між діалогами
robots.txt, sitemap.xml  SEO
```

## Правило оновлення

Змінилась структура (новий файл, папка, інструмент, перенесення)? Оновіть відповідний файл у `docs/` у тому ж коміті.
