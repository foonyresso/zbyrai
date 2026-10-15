# Карта інструментів

Кожен інструмент самодостатній: папка з `index.html` + власна копія `theme.css`. Шаблон файлів: `index.html` (розмітка), `style.css` (акцент і стилі), `app.js` (інтерфейс), `*-core.js` (логіка без DOM, її тестують), `test/` (запуск `node <папка>/test/<файл>`), `README.md`.

| Інструмент | Папка | Логіка / дані | UI | Тести | Ключ LS |
|---|---|---|---|---|---|
| Кубик промптів | `prompt-dice/` | `pools.js`, `styles.js`, `types.js` | `app.js` | немає | `pd2_` |
| Генератор середньовічних міст | `medieval-world/` | `src/core/city-core.js`, `src/data/buildings.js`, `src/generation/{city,world}/` (вода: `city/coast-kinds.js` типи берега, `city/water.js` річка/море, `city/waterfront.js` причали, рибальські місця, маяк, млин) | `src/main.js`, `src/ui/`, `src/render/` | немає | |
| Конструктор візерунків | `pattern-maker/` | `pattern-core.js`, `pattern-fx.js` | `app.js` | `test/fold.test.js`, `test/fx.test.js` | `pm_` |
| Кузня луту | `loot-forge/` | `loot-core.js`, `gdd-core.js`, `gdd-data.js` | `app.js`, `loot-ui.js`, `gdd-ui.js` | `test/loot.test.js`, `test/gdd.test.js` | `lf_` |
| Лабораторія дерев скілів | `skill-tree/` | `tree-core.js` | `app.js` | `test/tree.test.js` | `st_` |
| Змішувач ідей | `idea-mixer/` | `mixer-core.js` | `app.js` | `test/mixer.test.js` | `im_` |
| Генератор персонажів | `character-roller/` | `char-core.js`, `srd-{data,classes,spells,names}.js` | `app.js` | `test/char.test.js` | `cr_` |
| Кузня планет | `planet-forge/` | `planet-core.js`, `planet-kinds.js` | `app.js` | `test/planet.test.js` | `pf_` |
| Воксельна лабораторія | `voxel-lab/` | `voxel-core.js` | `app.js` | `test/voxel.test.js` | `vx_` |
| Мозаїка | `tessera/` | `tessera-core.js` | `app.js` | `test/tessera.test.js` | `ts_` |
| Карта королівств | `realm-map/` | `core/*.js` (генерація без DOM), `data/*.js` (біоми, монстри, місця, назви) | `app.js`, `ui/`, `render/` | `test/{hierarchy,roads,monsters,sea,general}.test.js`, запуск `test/run-all.js` | `rm_` |
| Симуляція колонії (Симуляція колонії) | `colonist-foundry/` | `colonist-core.js` | `app.js` | `test/colonist.test.js` | `cf_` |
| Планувальник виробничих ланцюжків | `production-planner/` | `planner-core.js` | `app.js` | `test/planner.test.js` | `pp_` |
| Криві балансу й хвилі | `balance-curves/` | `curves-core.js` | `app.js` | `test/curves.test.js` | `bc_` |
| Чистильник спрайтів | `sprite-cleaner/` | `sprite-core.js` | `app.js` | `test/sprite.test.js` | `sc_` |

`tool-chrome.js` у кожній папці — копія `shared/tool-chrome.js` (не правити вручну).

Додатково: `loot-forge/sync/extract-gdd.py` витягує дані шару GodsDontDie. `taste/` (`data.js`, `app.js`) не інструмент: довідка за прямим посиланням, `noindex`, нова гра = один запис у `taste/data.js`.

Порожні клітинки: Кубик промптів без тестів, у Генератор середньовічних міст немає тестів і `app.js` (код у `src/`, стилі в `styles.css`). Пов'язано: README кожного інструмента описує його користувачу.
