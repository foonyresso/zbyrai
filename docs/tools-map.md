# Карта інструментів

Кожен інструмент самодостатній: папка з `index.html` + власна копія `theme.css`. Шаблон файлів: `index.html` (розмітка), `style.css` (акцент і стилі), `app.js` (інтерфейс), `*-core.js` (логіка без DOM, її тестують), `test/` (запуск `node <папка>/test/<файл>`), `README.md`.

| Інструмент | Папка | Логіка / дані | UI | Тести | Ключ LS |
|---|---|---|---|---|---|
| Кубик промптів | `prompt-dice/` | `pools.js`, `styles.js`, `types.js`, `flux-words.js` + `flux-grammar.js` (Flux живою мовою); манекен: `mk-shapes.js` (фігура, ділянки, групи), `mk-data-body/head/scene/extra.js` (категорії), `mk-slots.js` (слоти й підключення до типів) | `menu-tree.js` (категорії й підгрупи меню), `app.js`, `ui-menu.js` (дерево, пошук), `ui-workspace.js` + `ui-cards.js` (групи й картки), `ui-mannequin.js` (SVG-манекен), `ui-dialogs.js` (історія, пресети, налаштування) | `test/flux.test.js`, `test/mannequin.test.js`, `test/menu.test.js` | `pd2_` |
| Колаж фото | `photo-collage/` | `collage-core.js` (режими розкладки, зум і зсув кадру) | `app.js` | `test/collage.test.js` | `pc_` |
| Конвертер зображень | `image-converter/` | `convert-core.js` (формати, пропорції, розмір, кадр, імена), `zip-core.js` (ZIP без стиснення), `convert-render.js` (малювання й кодування), `convert-worker.js` + `convert-pool.js` (Web Worker-и з запасним варіантом на головному потоці) | `app.js` | `test/convert.test.js` | `ic_` |
| Атлас 2.0 (новий генератор світу) | `atlas2/` | `core/` (етапи генерації без DOM) | `ui/app.js`, `ui/steps.js` (демонстрація «Як працює»), `render/` | `atlas2/test/run-all.js` | немає (у посиланні `#p=`) |
| Проект Атлас (генератор світів) | `medieval-world/` | `worlds/continent/` (тип світу «Материк»: `core/` генерація без DOM, `data/`, `render/`, `ui/`; відкривається в iframe з `?embed=1`), `src/core/city-core.js`, `src/data/buildings.js`, `src/generation/{city,world}/` (вода: `city/coast-kinds.js` типи берега, `city/water.js` річка/море, `city/waterfront.js` причали, рибальські місця, маяк, млин) | `src/main.js`, `src/ui/` (`world-kinds.js`: меню світів з реєстру), `src/core/atlas.js` (реєстр), `src/generation/world/{realm-objects,sea-routes}.js` і `src/render/world/realm-layers.js` (лігва, боси, місця, стани, морські шляхи), `src/data/realm/` (спільні дані), `worlds/<id>/world.js`, `biomes/<id>.js`, `monsters/<id>.js` (один файл на монстра), `dungeons/<id>.js` (один файл на тип підземелля), `src/generation/world/world-dungeons.js` (підземелля як локації світу), `src/render/` | `tools/atlas-registry.test.js`; тести материка: `worlds/continent/test/run-all.js`) | `atlas_world` |
| Конструктор візерунків | `pattern-maker/` | `pattern-core.js`, `pattern-fx.js` | `app.js` | `test/fold.test.js`, `test/fx.test.js` | `pm_` |
| Кузня луту | `loot-forge/` | `loot-core.js`, `gdd-core.js`, `gdd-data.js` | `app.js`, `loot-ui.js`, `gdd-ui.js` | `test/loot.test.js`, `test/gdd.test.js` | `lf_` |
| Лабораторія дерев скілів | `skill-tree/` | `tree-core.js` | `app.js` | `test/tree.test.js` | `st_` |
| Конструктор скілів | `skill-forge/` | `forge-core.js` (реєстр, дерево, формат), `bricks/{delivery,modifiers,effects,triggers}.js` (цеглинки даними), `forge-eval.js` (оцінка, опис), `presets.js` (приклади, випадковий скіл) | `app.js`, `forge-preview.js` (прев'ю на полотні) | `test/forge.test.js` | `sf_` |
| Змішувач ідей | `idea-mixer/` | `mixer-core.js` | `app.js` | `test/mixer.test.js` | `im_` |
| Генератор персонажів | `character-roller/` | `char-core.js`, `srd-{data,classes,spells,names}.js` | `app.js` | `test/char.test.js` | `cr_` |
| Кузня планет | `planet-forge/` | `planet-core.js`, `planet-kinds.js`, `planet-kinds-worlds.js`, `planet-kinds-sky.js`, `planet-bg.js`, `planet-system.js`, `planet-sky.js` | `app.js`, `system-ui.js`, `planet-system-view.js`, `slab-ui.js`, `planet-sky-view.js` | `test/planet.test.js` | `pf_` |
| Воксельна лабораторія | `voxel-lab/` | `voxel-core.js` | `app.js` | `test/voxel.test.js` | `vx_` |
| Мозаїка | `tessera/` | `tessera-core.js` | `app.js` | `test/tessera.test.js` | `ts_` |
| Симулятор підземель | `dungeon-sim/` | `dungeon-core.js`, `dungeon-monsters.js` (читає medieval-world/monsters/*.js і dungeons/*.js за реєстром та room-kinds/*.js), `room-kinds/` (види кімнат, по файлу на тему), `dungeon-types.js` (генерується з `medieval-world/dungeons/` скриптом `tools/build-dungeon-types.mjs`) | `app.js`, `dungeon-render.js` | `test/dungeon.test.js` | `dg_` |
| Симуляція колонії | `colonist-foundry/` | `colonist-core.js` (генерація), `colony-data.js`, `colony-grammar.js`, `colony-world.js`, `colony-events.js`, `colony-sim.js` (покроковий рушій) | `app.js` (стан, час), `ui-common.js`, `ui-portrait.js`, `ui-setup.js`, `ui-detail.js`, `ui-views.js` | `test/colonist.test.js`, `test/sim.test.js` | `cf_` |
| Симуляція поселення | `settlement-sim/` | `layout.js`, `mechanics/{needs,schedule,combat,spawner,pathgrid}` | `app.js`, `render.js`, `routine.js`, `social.js`, `defend.js` | `test/*.test.js` | — (без збережень) |
| Закладини (гра) | `zakladyny/` | `zk-game.js` (порядок доби, дії гравця), `zk-save.js` (формат v1); логіка в `mechanics/` | `app.js`, `zk-render.js` (canvas), `zk-panels.js` | `test/game.test.js` | `zk_` |
| Планувальник виробничих ланцюжків | `production-planner/` | `planner-core.js` | `app.js` | `test/planner.test.js` | `pp_` |
| Криві балансу й хвилі | `balance-curves/` | `curves-core.js`, `formula.js` (парсер власних формул), `formula-presets.js` (бібліотека) | `app.js`, `formula-ui.js` | `test/curves.test.js`, `test/formula.test.js` | `bc_` |
| Чистильник спрайтів | `sprite-cleaner/` | `sprite-core.js` | `app.js` | `test/sprite.test.js` | `sc_` |

`tool-chrome.js` у кожній папці — копія `shared/tool-chrome.js` (не правити вручну).

Додатково: `loot-forge/sync/extract-gdd.py` витягує дані шару GodsDontDie. `taste/` (`data.js`, `app.js`) не інструмент: довідка за прямим посиланням, `noindex`, нова гра = один запис у `taste/data.js`.

Порожні клітинки: Кубик промптів без тестів, у Генератор середньовічних міст немає тестів і `app.js` (код у `src/`, стилі в `styles.css`). Пов'язано: README кожного інструмента описує його користувачу.
