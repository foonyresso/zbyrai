# Файли біомів (формат 1)

Кожен біом лежить в окремому файлі `medieval-world/biomes/<id>.js` і сам себе реєструє. Які біоми дозволені якому світу, визначає **файл світу** за правилами нижче; біом нічого не знає про світи. Новий біом з відповідними тегами підхоплюється світами без правок світу чи ядра. Після додавання файлу: `node tools/build-atlas-registry.mjs`, потім `node tools/atlas-registry.test.js`.

## Шаблон

```js
Atlas.registerBiome({
  format: 1,                         // версія формату (обов'язково)
  id: "my-biome",                    // = назві файлу; латиниця, цифри, дефіс
  name: "Мій біом",                  // назва в інтерфейсі
  color: "#8aa05a",                  // колір на карті
  tags: ["land", "temperate", "wet"],// теги для вибору біомів світом
  move: 1.5,                         // вартість кроку для доріг (необов'язково)
  speed: 14,                         // км/добу пішки поза дорогою (необов'язково)
  monsters: "forest",                // вид монстрів: "forest" | "mountain" (необов'язково)
  water: false,                      // true для води (необов'язково)
  fantasy: false,                    // true для фентезійних (необов'язково)
});
```

## Теги

Теги вільні, але краще вживати наявні: `land`, `water`, `sea`, `deep`, `fresh` (вода); `cold`, `temperate`, `hot` (клімат); `wet`, `dry` (вологість); `plain`, `highland`, `mountain`, `forest`, `swamp`, `farmland` (рельєф і рослинність); `fantasy`.

## Як світ обирає біоми

У файлі світу поле `biomes`:

```js
biomes: {
  allow: ["grass", "tag:mountain", "tag:cold+forest"], // або "all" (за замовчуванням)
  deny:  ["tag:water"],                                // необов'язково
  weights: { grass: 3, "tag:cold": 0.5 },              // необов'язково: множник частоти
}
```

Селектор: `"all"`, `"<id>"`, `"tag:a"` або `"tag:a+b"` (усі теги разом). Біом потрапляє у світ, якщо збігається з `allow` і не збігається з `deny`; його вага = добуток усіх `weights`, що збіглися (0 вимикає). Результат повертає `Atlas.resolveBiomes(world)`: список `{ biome, weight }`.

## Стан підключення

Реєстр, формат і вибір біомів працюють і перевіряються тестом. Рушій «Материк» поки що має власний список біомів у `worlds/continent/data/biomes.js` (з нього створено файли в `biomes/`); перехід рушіїв на читання `Atlas.resolveBiomes` робимо, коли автор надішле свій список біомів.

## Наявні біоми

Зі старого списку материка: `deep`, `sea`, `lake`, `grass`, `steppe`, `forest`, `taiga`, `enchanted`, `swamp`, `desert`, `tundra`, `wasteland`, `hills`, `mountain`, `peaks`; для нескінченного світу: `snow`; зразки: `savanna`, `jungle`, `volcanic`, `crystal`, `ashlands`.
