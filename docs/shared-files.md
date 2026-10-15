# Спільні файли

- `shared/theme.css`: єдина дизайн-система «Обсидіан і золото» (змінні, шапка `header.top`, `.top-actions`, `details.how`, кнопки, заголовки). Правте тільки тут.
- `<інструмент>/theme.css`: копії; не правити вручну. Оновлення: `node tools/sync-theme.mjs` (копіює в кожну папку з `index.html`, окрім `shared`, `assets`, `tools`).
- `<інструмент>/style.css`: акцент (`--accent` у `:root`) та специфіка інструмента.
- `index.html` + `assets/hub.css` + `assets/hub.js`: головна. Картка інструмента + клас кольору `.c-…` у `hub.css`.
- `tools/ui-rules.test.js`: перевіряє правила інтерфейсу (довідка, верхня панель, підказки, тема). Список `TOOLS` у файлі ведеться вручну: додавайте туди новий інструмент.
- `sitemap.xml`, `robots.txt`: SEO; адреса `https://zbyrai.pages.dev` також у `canonical`/`og:url` кожної сторінки.
- `README.md`: опис і команди тестів; `ROADMAP.md`: стан робіт і передача між діалогами.

Зв'язки: `shared/theme.css` → (sync-theme) → `*/theme.css` ← `index.html` інструмента; тести логіки: `node <папка>/test/<файл>`, інтерфейсні правила: `node tools/ui-rules.test.js`.
