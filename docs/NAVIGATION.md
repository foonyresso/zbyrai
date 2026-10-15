# Навігатор репозиторію Zbyrai

Головна точка входу для тих, хто шукає, що де лежить. Документація розбита за темами в `docs/`:

| Файл | Про що |
|---|---|
| [tools-map.md](tools-map.md) | Кожен інструмент: папка, код, тести, ключ localStorage |
| [shared-files.md](shared-files.md) | Спільні файли: тема, хаб, sitemap, скрипти в `tools/` |
| [new-tool-guide.md](new-tool-guide.md) | Як додати новий інструмент за правилами сайту |
| [file-rules.md](file-rules.md) | Правила розбиття файлів і документації, роботи з великими текстами |
| [large-files.md](large-files.md) | Файли, що завеликі або близькі до межі (кандидати на розбиття) |
| [realm-map/README.md](realm-map/README.md) | Карта королівств: ієрархія, дороги, монстри гір/лісів/морів, алгоритм, перенесення в Godot C#, покращення |
| [edits/00-index.md](edits/00-index.md), [edits/16-status.md](edits/16-status.md) | Стиснуті правки автора («новий 3.txt») по інструментах: що просив, суперечності, що зроблено |

## Карта верхнього рівня

```
index.html, assets/      головна сторінка (хаб) і її стилі/скрипт
shared/theme.css        єдина тема (джерело); shared/tool-chrome.js: кнопка «Інфо», якір, клавіші (джерело)
tools/                   sync-theme.mjs, ui-rules.test.js
<інструмент>/            index.html, app.js, *-core.js, style.css, theme.css, README.md, test/
realm-map/               core/ (генерація без DOM), data/ (дані), render/ (canvas), ui/ (панелі), app.js, test/
taste/                   закрита довідка про смаки автора (не інструмент)
docs/                    ця документація; docs/edits/ — стиснуті правки автора по інструментах
README.md, ROADMAP.md    опис для людей; план і передача роботи між діалогами
robots.txt, sitemap.xml  SEO
```

## Правило оновлення

Змінилась структура (новий файл, папка, інструмент, перенесення)? Оновіть відповідний файл у `docs/` у тому ж коміті.
