# Як додати новий інструмент

1. Створіть папку `my-tool/` з `index.html`, `style.css`, `app.js`, `my-core.js` (логіка без DOM), `README.md`, `test/`. Шляхів поза папкою не використовувати.
2. `node tools/sync-theme.mjs` створить `theme.css`; підключіть `./theme.css` та `style.css`; задайте `--accent`.
3. Інтерфейс нового інструмента робити одразу на UI-кіті (як Атлас 2.0): див. [ui-kit.md](ui-kit.md) (розмітка, `shared/ui/`, `KIT_TOOLS` у `tools/ui-rules.test.js`). Правила нижче діють так само, але «довідка» = значок «i» + `dialog#help`, а не `details.how`:
   - збереження й обмін (копіювати JSON, імпорт, експорт, завантажити, поділитися, друк) у `header.top > .top-actions`; редагування й рандом у робочій зоні;
   - на початку згорнутий `<details class="how">` «Що це, для чого, як користуватися»;
   - `title` на кожній кнопці й параметрі;
   - увесь інтерфейс українською;
   - єдиний стиль заголовків (з `theme.css`).
4. Додайте картку в `index.html`, клас `.c-…` у `assets/hub.css`, запис у `sitemap.xml`.
5. Додайте папку в `TOOLS` у `tools/ui-rules.test.js`, тести логіки в `test/`, префікс localStorage (`xx_`).
6. Оновіть `README.md` (таблиця, команда тесту), `docs/tools-map.md`, `ROADMAP.md`.
7. Розмір: див. [file-rules.md](file-rules.md); не пхайте все в один файл.
