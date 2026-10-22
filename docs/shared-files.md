# Спільні файли

- `shared/theme.css`: єдина дизайн-система «Обсидіан і золото» (змінні, шапка `header.top`, `.top-actions`, `details.how`, кнопки, заголовки). Правте тільки тут.
- `shared/tool-chrome.js`: спільна «обв'язка»: кнопка «Інфо» після назви (спливаюче вікно з довідки `details.how`/`details.about`), якір «назад» (`../index.html#t-<папка>`), гарячі клавіші без залежності від розкладки (`window.zbKey`, за `e.code`). Копіюється у кожен інструмент тією ж `sync-theme.mjs`; підключається в кінці `index.html`.
- `<інструмент>/theme.css`: копії; не правити вручну. Оновлення: `node tools/sync-theme.mjs` (копіює в кожну папку з `index.html`, окрім `shared`, `assets`, `tools`).
- `<інструмент>/style.css`: акцент (`--accent` у `:root`) та специфіка інструмента.
- `index.html` + `assets/hub.css` + `assets/hub.js`: головна. Картка інструмента + клас кольору `.c-…` у `hub.css`.
- `tools/ui-rules.test.js`: перевіряє правила інтерфейсу (довідка, верхня панель, підказки, тема). Список `TOOLS` у файлі ведеться вручну: додавайте туди новий інструмент.
- `tools/build-atlas-registry.mjs`: збирає `medieval-world/registry.js` зі списку файлів `worlds/*/world.js`, `biomes/*.js` і `monsters/*.js` і `dungeons/*.js` (а також генерує `src/data/realm/monsters-{mountain,forest,sea}.js`, їх не правити вручну; формат — docs/atlas/monster-files.md); `tools/atlas-registry.test.js` перевіряє формат і актуальність реєстру; `tools/world-oceans.test.js` перевіряє океани й острови основного світу. `tools/world-borders.test.js` (повільний, лише з BORDERS=1) шукає розриви меж провінцій по воді. Після додавання світу, біому чи монстра: запустити перший, потім другий.
- `tools/build-dungeon-types.mjs`: збирає `dungeon-sim/dungeon-types.js` з `medieval-world/dungeons/*.js` (типи підземель для Симулятора підземель). Після зміни чи додавання типу підземелля запустити його; `dungeon-sim/test/dungeon.test.js` перевіряє актуальність.
- `sitemap.xml`, `robots.txt`: SEO; адреса `https://zbyrai.pages.dev` також у `canonical`/`og:url` кожної сторінки.
- `README.md`: опис і команди тестів; `ROADMAP.md`: стан робіт і передача між діалогами.

Зв'язки: `shared/theme.css` → (sync-theme) → `*/theme.css` ← `index.html` інструмента; картки хабу мають `id="t-<папка>"` (якір для повернення); тести логіки: `node <папка>/test/<файл>`, інтерфейсні правила: `node tools/ui-rules.test.js`.

## Бестіарій вимірів (`medieval-world/src/ui/bestiary*.{js,css}`)
Накладка з довідником вимірів. `bestiary-gen.js` — зерно → унікальний опис світу (без DOM); `bestiary.js` — інтерфейс, читає `Atlas.*` (лор, біоми, монстри, підземелля, раси); `bestiary.css` — стилі. З основним кодом пов'язаний лише кнопкою `#btnBestiary` у шапці `medieval-world/index.html` і трьома тегами підключення.
