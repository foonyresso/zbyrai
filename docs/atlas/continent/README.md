# Карта королівств: документація

Тип світу «Материк» проекту Атлас: [`medieval-world/worlds/continent/`](../../../medieval-world/worlds/continent/). Генератор фентезійної карти світу (орієнтир вигляду: Azgaar Fantasy Map Generator, але світ більш фентезійний, а міста видно одразу на карті, а не у віконці). Це **зразок механіки для гри на Godot C#**: сам файл у грі не використовується, вся механіка переноситься в код гри. Тому логіка генерації (`medieval-world/worlds/continent/core/`) відокремлена від малювання (`render/`) та інтерфейсу (`ui/`) і не залежить від DOM.

| Файл | Про що |
|---|---|
| [hierarchy.md](hierarchy.md) | Провінції, регіони, міста; розмір регіонів; ранги й стани поселень |
| [roads.md](roads.md) | Чотири типи доріг і п'ятий тип: морські шляхи; правила підключення |
| [places.md](places.md) | Точки інтересу (великі й дрібні), шахти, що веде куди |
| [monsters-mountain.md](monsters-mountain.md) | Гори: монстри, боси й міні-боси |
| [monsters-forest.md](monsters-forest.md) | Ліси: монстри, боси й міні-боси |
| [monsters-sea.md](monsters-sea.md) | Моря: монстри й боси, правила глибин |
| [algorithm.md](algorithm.md) | Конвеєр генерації, стадії, формат даних |
| [csharp-port.md](csharp-port.md) | Як переносити в Godot C#: відповідність файлів, структури, пастки |
| [themes.md](themes.md) | Теми оформлення світів: палітри й стилістика |
| [improvements.md](improvements.md) | Що додано понад запит і що можна додати далі |
| [gdd-mapping.md](gdd-mapping.md) | Відповідність кодам карток гри GodsDontDie |
