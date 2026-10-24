# mechanics/: механіки сайту окремо від інструментів

Правила: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md). Кожна папка: `index.js` (інтерфейс), за потреби `data.js`, `test/` (тести лежать у інструментах-комбінаторах, напр. `zakladyny/test/`).

| Папка | Інтерфейс (глобал `Mech.*` / `require`) | Вхід → вихід |
|---|---|---|
| `rng/` | `Rng.stream(seed,name)`, `fbm`, `noise2` | зерно → випадкові числа, шум |
| `atlas-map/` | `AtlasMap.wrap(світ Atlas2)`, `townEnv`, `routePath`, `lairs`, `pickStart`, камера, адаптер міста | фасад над світом Atlas 2.0: ту саму карту малює рушій Atlas, механіки читають її через фасад |
| `trade/` | `Trade.initMarkets`, `price`, `quote`, `tick`, `dispatch`, `advance` | світ → ринки; караван крок за кроком із подіями |
| `building/` | `Building.create/restore/serialize`, `canPlace`, `place`, `demolish`, `produceDay` | світ + дії → ділянка з будівлями, дорогами, виробництвом |
| `settlers/` | `Settlers.create`, `maybeArrive`, `settle`, `assignJobs`, `dayTick` | стан + ділянка → поселенці й події (використовує `colonist-foundry/colonist-core.js`) |
| `threats/` | `Threats.threatsFor`, `raid` | світ + оборона → результат набігу |

Усе детерміноване від зерна й JSON-серіалізоване (крім похідних масивів, що відновлюються).
