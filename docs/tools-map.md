# Карта інструментів

Кожен інструмент самодостатній: папка з `index.html` + власна копія `theme.css`. Шаблон файлів: `index.html` (розмітка), `style.css` (акцент і стилі), `app.js` (інтерфейс), `*-core.js` (логіка без DOM, її тестують), `test/` (запуск `node <папка>/test/<файл>`), `README.md`.

| Інструмент | Папка | Логіка / дані | UI | Тести | Ключ LS |
|---|---|---|---|---|---|
| Prompt Dice | `prompt-dice/` | `pools.js`, `styles.js`, `types.js` | `app.js` | немає | `pd2_` |
| Medieval World | `medieval-world/` | `src/core/city-core.js`, `src/data/buildings.js`, `src/generation/{city,world}/` | `src/main.js`, `src/ui/`, `src/render/` | немає | |
| Pattern Maker | `pattern-maker/` | `pattern-core.js`, `pattern-fx.js` | `app.js` | `test/fold.test.js`, `test/fx.test.js` | `pm_` |
| Loot Forge | `loot-forge/` | `loot-core.js`, `gdd-core.js`, `gdd-data.js` | `app.js`, `loot-ui.js`, `gdd-ui.js` | `test/loot.test.js`, `test/gdd.test.js` | `lf_` |
| Skill Tree Lab | `skill-tree/` | `tree-core.js` | `app.js` | `test/tree.test.js` | `st_` |
| Idea Mixer | `idea-mixer/` | `mixer-core.js` | `app.js` | `test/mixer.test.js` | `im_` |
| Character Roller | `character-roller/` | `char-core.js`, `srd-{data,classes,spells,names}.js` | `app.js` | `test/char.test.js` | `cr_` |
| Planet Forge | `planet-forge/` | `planet-core.js`, `planet-kinds.js` | `app.js` | `test/planet.test.js` | `pf_` |
| Voxel World Lab | `voxel-lab/` | `voxel-core.js` | `app.js` | `test/voxel.test.js` | `vx_` |
| Tessera | `tessera/` | `tessera-core.js` | `app.js` | `test/tessera.test.js` | `ts_` |
| Симуляція колонії (Colonist Foundry) | `colonist-foundry/` | `colonist-core.js` | `app.js` | `test/colonist.test.js` | `cf_` |
| Production Chain Planner | `production-planner/` | `planner-core.js` | `app.js` | `test/planner.test.js` | `pp_` |
| Wave & Balance Curves | `balance-curves/` | `curves-core.js` | `app.js` | `test/curves.test.js` | `bc_` |
| Sprite Sheet Cleaner | `sprite-cleaner/` | `sprite-core.js` | `app.js` | `test/sprite.test.js` | `sc_` |

`tool-chrome.js` у кожній папці — копія `shared/tool-chrome.js` (не правити вручну).

Додатково: `loot-forge/sync/extract-gdd.py` витягує дані шару GodsDontDie. `taste/` (`data.js`, `app.js`) не інструмент: довідка за прямим посиланням, `noindex`, нова гра = один запис у `taste/data.js`.

Порожні клітинки: Prompt Dice без тестів, у Medieval World немає тестів і `app.js` (код у `src/`, стилі в `styles.css`). Пов'язано: README кожного інструмента описує його користувачу.
