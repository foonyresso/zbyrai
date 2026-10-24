# mechanics/: механіки сайту окремо від інструментів

Правила: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md). Кожна папка: `index.js` (інтерфейс), за потреби `data.js`, `test/` (тести лежать у інструментах-комбінаторах, напр. `zakladyny/test/`).

| Папка | Інтерфейс (глобал `Mech.*` / `require`) | Вхід → вихід |
|---|---|---|
| `rng/` | `Rng.stream(seed,name)`, `fbm`, `noise2` | зерно → випадкові числа, шум |
| `world-lite/` | `WorldLite.generate(seed)`, `routePath`, `around` | зерно → материк: `biome`, `S` (поселення), `routes`, `lairs` |
| `trade/` | `Trade.initMarkets`, `price`, `quote`, `tick`, `dispatch`, `advance` | світ → ринки; караван крок за кроком із подіями |
| `building/` | `Building.create/restore/serialize`, `canPlace`, `place`, `demolish`, `produceDay` | світ + дії → ділянка з будівлями, дорогами, виробництвом |
| `settlers/` | `Settlers.create`, `maybeArrive`, `settle`, `assignJobs`, `dayTick` | стан + ділянка → поселенці й події (використовує `colonist-foundry/colonist-core.js`) |
| `threats/` | `Threats.threatsFor`, `raid` | світ + оборона → результат набігу |

Усе детерміноване від зерна й JSON-серіалізоване (крім похідних масивів, що відновлюються).
