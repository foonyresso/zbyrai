# Навігатор репозиторію Zbyrai

Головна точка входу для тих, хто шукає, що де лежить. Документація розбита за темами в `docs/`:

| Файл | Про що |
|---|---|
| [tools-map.md](tools-map.md) | Кожен інструмент: папка, код, тести, ключ localStorage |
| [shared-files.md](shared-files.md) | Спільні файли: тема, хаб, sitemap, скрипти в `tools/` |
| [new-tool-guide.md](new-tool-guide.md) | Як додати новий інструмент за правилами сайту |
| [file-rules.md](file-rules.md) | Правила розбиття файлів і документації, роботи з великими текстами |
| [large-files.md](large-files.md) | Файли, що завеликі або близькі до межі (кандидати на розбиття) |
| [atlas/world-files.md](atlas/world-files.md), [atlas/biome-files.md](atlas/biome-files.md), [atlas/monster-files.md](atlas/monster-files.md), [atlas/dungeon-files.md](atlas/dungeon-files.md), [atlas/monster-batch-2.md](atlas/monster-batch-2.md), [atlas/biomes-import.md](atlas/biomes-import.md), [atlas/people-files.md](atlas/people-files.md), [atlas/race-files.md](atlas/race-files.md), [atlas/infinite-world-features.md](atlas/infinite-world-features.md), [plans/world-generator-queue.md](plans/world-generator-queue.md) | Формат файлів світів, біомів, монстрів (версії 1 і 2, поле lore) і підземель (версія 2), народів і рас (версія 2), шаблони, вибір біомів, відстані монстрів від поселень, прив'язка підземель |
| [atlas/continent/README.md](atlas/continent/README.md) | Атлас, світ «Материк» (колишня карта королівств): ієрархія, дороги, монстри гір/лісів/морів, алгоритм, перенесення в Godot C#, покращення |
| [data-versions.md](data-versions.md) | Версії форматів збережень і що в них змінилось |
| [plans/ui-rollout-queue.md](plans/ui-rollout-queue.md) | Черга: єдиний стиль інструментів (полотно + іконки) і доробки, статуси |
| [plans/dungeon-sim-queue.md](plans/dungeon-sim-queue.md) | Черга задач симулятора підземель |
| [plans/album-builder-queue.md](plans/album-builder-queue.md) | Черга закритого «Макетника альбомів» (`album-builder/`, не лінкується з хабу) |
| [plans/skill-forge-queue.md](plans/skill-forge-queue.md) | Черга задач Конструктора скілів |
| [plans/README.md](plans/README.md) | Плани: принцип «полотно + іконки», перелік інструментів, злиття карти королівств у Атлас, рішення автора, пріоритети, питання про суперечності |
| [skill-forge-format.md](skill-forge-format.md) | Конструктор скілів: формат `zbyrai.skill` (версія 1), види цеглинок, як додати цеглинку, зв'язок з деревом скілів, перенесення в Godot C# |
| [edits/00-index.md](edits/00-index.md), [edits/16-status.md](edits/16-status.md) | Стиснуті правки автора («новий 3.txt») по інструментах: що просив, суперечності, що зроблено |

## Карта верхнього рівня

```
index.html, assets/      головна сторінка (хаб) і її стилі/скрипт
shared/theme.css        єдина тема (джерело); shared/tool-chrome.js: кнопка «Інфо», якір, клавіші (джерело)
tools/                   sync-theme.mjs, ui-rules.test.js, build-atlas-registry.mjs (оновлює medieval-world/registry.js), atlas-registry.test.js
<інструмент>/            index.html, app.js, *-core.js, style.css, theme.css, README.md, test/
medieval-world/          «Проект Атлас»: src/ (нескінченний світ, місто, core/atlas.js реєстр), worlds/<id>/world.js (по світу на файл; continent/ має власний код), biomes/<id>.js (по біому на файл), monsters/<id>.js (по монстру), dungeons/<id>.js (по типу підземелля), registry.js (генерується)
taste/                   закрита довідка про смаки автора (не інструмент)
docs/                    ця документація; docs/edits/ — стиснуті правки автора по інструментах; docs/plans/ — плани розвитку; docs/atlas/ — документація Атласу
README.md, ROADMAP.md    опис для людей; план і передача роботи між діалогами
robots.txt, sitemap.xml  SEO
```

## Правило оновлення

Змінилась структура (новий файл, папка, інструмент, перенесення)? Оновіть відповідний файл у `docs/` у тому ж коміті.
