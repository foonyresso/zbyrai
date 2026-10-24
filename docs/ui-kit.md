# UI-кіт (інтерфейс як в Атласі 2.0)

Що тут: спільний вигляд усіх інструментів. Джерело: `shared/ui/zb-ui.css` + `shared/ui/zb-ui.js`; копії в папках інструментів (підключених до кіта) робить `node tools/sync-theme.mjs`, вручну не правити. Перевірка: `node tools/ui-rules.test.js` (список `KIT_TOOLS`).

Принцип: велетенське полотно на весь екран, усе інше поверх нього. Старі сайдбари, форми, великі кнопки, `details.how` і `tool-chrome.js` в інструментах на кіті не використовуються.

## Розмітка
```html
<link rel="stylesheet" href="./theme.css"><link rel="stylesheet" href="./zb-ui.css"><link rel="stylesheet" href="./style.css">
<header class="top" id="top">                       <!-- плаваюча мінімальна верхня панель -->
  <a class="hub-back" href="../index.html" title="…" hidden><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg><span>Zbyr<b>AI</b></span></a>
  <div class="brand">Назва <span>2.0</span></div>
  <button id="btnHelp" class="info-btn" title="Що це, для чого, як користуватися">i</button>
  <div class="top-actions"><button id="btnImport" title="…">Імпорт</button> … </div>   <!-- збереження, імпорт, експорт, обмін, друк -->
</header>
<dialog id="help" class="help">…<h3>Що це</h3>…<h3>Для чого</h3>…<h3>Як користуватися</h3>…</dialog>
<main class="stage"> полотно(а) </main>                 <!-- .stage > canvas розтягується на весь екран -->
<nav class="rail" id="rail"><button data-panel="x" title="…"><svg/><span>Назва</span></button> …</nav>
<aside class="drawer" id="drawer" data-store="<ключ>" data-default="x" hidden>
  <button class="x" id="drawerX" title="Закрити меню">×</button>
  <section data-panel="x"><h2>…</h2><details class="sub" open><summary><svg/><span>Підменю</span></summary> … </details></section>
</aside>
<div class="bar">…</div>                              <!-- нижня панель дій (рандом, замки, скидання); за потреби -->
<script src="./zb-ui.js"></script>
```
- Збереження й обмін: лише в `.top-actions`. Редагування й рандом: у панелях і `.bar`.
- Клас `.zb-card` — картка поверх полотна (дані під курсором, підсумки); `.toast` — спливаюче повідомлення.
- Кожна кнопка й параметр мають `title`, увесь текст українською.
- `zb-ui.js` сам: відкриває/закриває панель (клік по іконці, ×), пам'ятає її (`data-store`, інакше `zb.<папка>.panel`; `data-default` — початкова), відкриває довідку «i», показує посилання на головну. Для коду інструмента: `ZB.showPanel(id)`, `ZB.panel`, `ZB.onPanel = fn`.
- Специфіка інструмента (акцент `--accent`, полотно, вміст панелей) лишається в його `style.css`; тло полотна: `--stage-bg`.

## Як перевести інструмент
1. Шапка → `.top` (назва, «i», `.top-actions` з тими самими id кнопок), `details.how` → `dialog#help`.
2. Робочу зону → `main.stage` із полотном; форми й списки → секції `.drawer` з іконками в `.rail`; кнопки дій → `.bar`.
3. Видалити старий CSS (шапка, сайдбари, кнопки, `.how`) і JS перемикання панелей; підключити кіт; `node tools/sync-theme.mjs`.
4. Додати інструмент у `KIT_TOOLS`, пройти `node tools/ui-rules.test.js` і тести логіки.
5. Не ламати збережені дані й id елементів, на які спирається `app.js`.

Інструменти на кіті: Атлас 2.0 (`atlas2/`), Мозаїка (`tessera/`, зразок). Черга решти: [ui-migration.md](ui-migration.md), Конструктор візерунків (`pattern-maker/`), Колаж фото (`photo-collage/`), Воксельна лабораторія (`voxel-lab/`), Кузня планет (`planet-forge/`), Симулятор підземель (`dungeon-sim/`), Конвертер зображень (`image-converter/`), Дерева скілів (`skill-tree/`), Конструктор скілів (`skill-forge/`), Чистильник спрайтів (`sprite-cleaner/`), Криві балансу (`balance-curves/`), Криві балансу (`balance-curves/`), Кузня луту (`loot-forge/`), Планувальник ланцюжків (`production-planner/`), Змішувач ідей (`idea-mixer/`), Генератор персонажів (`character-roller/`), Генератор персонажів (`character-roller/`), Кубик промптів (`prompt-dice/`).
