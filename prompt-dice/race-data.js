// Окреме меню особливостей для кожної раси: що саме показувати в картці «Расові особливості», коли вибрано расу.
// Ключ — тег раси (`race`). Групи: [назва, 'тег|тег|…']. Усі теги мають бути в параметрі raceFeat (це перевіряє тест).
// Колір для крил, рогів, хвостів, вух тощо вибирається квадратиками під картками (colors.js).
// Нові раси звіролюдей: нейтральні за статтю теги (стать задається лише параметром «Стать»).
const RACE_NEW = 'catfolk|foxfolk|wolffolk|dogfolk|rabbitfolk|horsefolk|tigerfolk|dragonkin|snakefolk|birdfolk|spiderfolk|plantfolk|slimefolk|monster';
const RC = {
  hornsAll: 'horns|demon_horns|curled_horns|long_horns|goat_horns|ram horns|small horns|large_horns|tiny_horns|thin_horns|thick_horns|twisted_horns|straight_horns|backswept_horns|bull_horns|single_horn|broken_horn|glowing_horns|horns_through_hair',
  fangs: 'fangs|sharp_teeth',
  paws: 'paw_hands|claw_hands',
};
const RACE_MENU = {
  angel: [['Крила', 'angel_wings|feathered_wings|white_wings|black_wings|large_wings|small_wings|huge_wings|multiple_wings|six_wings|folded wings|spread wings|tattered wings|broken_wings|glowing_wings|mechanical_wings|head_wings'], ['Німб', 'halo|glowing_halo|double_halo|broken_halo|mechanical_halo'], ['Пір’я', 'feathers']],
  fallen_angel: [['Крила', 'black_wings|angel_wings|bat_wings|feathered_wings|large_wings|huge_wings|folded wings|spread wings|tattered wings|broken_wings|glowing_wings'], ['Німб', 'broken_halo|dark_halo|halo'], ['Роги', 'small horns|broken_horn|demon_horns']],
  valkyrie: [['Крила', 'feathered_wings|angel_wings|white_wings|large_wings|folded wings|spread wings'], ['Німб', 'halo|glowing_halo']],
  demon: [['Роги', RC.hornsAll], ['Крила', 'demon_wings|bat_wings|leathery_wings|small_wings|large_wings|huge_wings|tattered wings|folded wings|spread wings'], ['Хвіст', 'demon_tail|spade_tail|long_tail|curled_tail|short_tail|fluffy_tail'], ['Ікла', RC.fangs]],
  succubus: [['Роги', RC.hornsAll], ['Крила', 'demon_wings|bat_wings|leathery_wings|small_wings|large_wings|tattered wings|folded wings|spread wings'], ['Хвіст', 'demon_tail|spade_tail|long_tail|curled_tail|short_tail'], ['Ікла', RC.fangs]],
  vampire: [['Ікла', RC.fangs], ['Крила', 'bat_wings|leathery_wings|small_wings|large_wings|folded wings|spread wings'], ['Вуха', 'pointy_ears']],
  oni: [['Роги', 'oni_horns|single_horn|horns|large_horns|small horns|thick_horns|broken_horn|twisted_horns'], ['Ікла й бивні', 'fangs|tusks|sharp_teeth']],
  kitsune: [['Вуха', 'fox_ears|fluffy_ears|large_ears|animal_ears'], ['Хвости', 'fox_tail|multiple_tails|nine_tails|fluffy_tail|long_tail'], ['Маска', 'fox_mask']],
  foxfolk: [['Вуха', 'fox_ears|fluffy_ears|large_ears|animal_ears'], ['Хвости', 'fox_tail|multiple_tails|nine_tails|fluffy_tail|long_tail'], ['Лапи й хутро', 'paw_hands|fur']],
  catfolk: [['Вуха', 'cat_ears|floppy_ears|fluffy_ears|large_ears|animal_ears'], ['Хвіст', 'cat_tail|long_tail|curled_tail|short_tail|fluffy_tail|striped_tail'], ['Вуса', 'whiskers'], ['Лапи й хутро', 'paw_hands|claw_hands|fur']],
  wolffolk: [['Вуха', 'wolf_ears|fluffy_ears|animal_ears'], ['Хвіст', 'wolf_tail|fluffy_tail|long_tail'], ['Ікла', RC.fangs], ['Лапи й хутро', 'paw_hands|claw_hands|fur']],
  dogfolk: [['Вуха', 'dog_ears|floppy_ears|fluffy_ears|animal_ears'], ['Хвіст', 'dog tail|fluffy_tail|short_tail|curled_tail'], ['Лапи й хутро', 'paw_hands|fur']],
  rabbitfolk: [['Вуха', 'bunny ears|long_rabbit_ears|lop_ears|fluffy_ears|floppy_ears'], ['Хвіст', 'bunny tail|pom_pom_tail|fluffy_tail|short_tail'], ['Хутро', 'fur']],
  horsefolk: [['Вуха', 'horse_ears|animal_ears'], ['Хвіст', 'horse_tail|long_tail'], ['Копита', 'hooves']],
  tigerfolk: [['Вуха', 'tiger_ears|round_animal_ears|animal_ears'], ['Хвіст', 'tiger_tail|striped_tail|long_tail'], ['Ікла', RC.fangs], ['Лапи й хутро', 'paw_hands|claw_hands|fur']],
  dragonkin: [['Роги', 'dragon_horns|horns|large_horns|backswept_horns|small horns|twisted_horns|curled_horns|broken_horn'], ['Крила', 'dragon_wings|large_wings|small_wings|huge_wings|folded wings|spread wings|tattered wings'], ['Хвіст', 'dragon_tail|long_tail|spade_tail'], ['Луска й гребені', 'scales|dragon_frills'], ['Вуха', 'pointy_ears|fin ears']],
  dragonborn: [['Роги', 'dragon_horns|horns|large_horns|backswept_horns|small horns|twisted_horns|curled_horns|broken_horn'], ['Крила', 'dragon_wings|large_wings|small_wings|huge_wings|folded wings|spread wings|tattered wings'], ['Хвіст', 'dragon_tail|long_tail|spade_tail'], ['Луска й гребені', 'scales|dragon_frills']],
  snakefolk: [['Зміїне тіло', 'snake_body|snake_tail'], ['Луска', 'scales'], ['Волосся-змії', 'snake_hair']],
  lamia: [['Зміїне тіло', 'snake_body|snake_tail'], ['Луска', 'scales'], ['Волосся-змії', 'snake_hair']],
  birdfolk: [['Крила', 'bird_wings|feathered_wings|wing_arms|large_wings|folded wings|spread wings|white_wings|black_wings'], ['Пір’я', 'feathers|tail_feathers'], ['Пазурі', 'talons']],
  harpy: [['Крила', 'bird_wings|feathered_wings|wing_arms|large_wings|folded wings|spread wings|white_wings|black_wings'], ['Пір’я', 'feathers|tail_feathers'], ['Пазурі', 'talons']],
  mermaid: [['Хвіст', 'mermaid_tail|fish_tail|long_tail'], ['Плавці', 'fins|head_fins|fin ears'], ['Луска й зябра', 'scales|gills']],
  fairy: [['Крила', 'fairy_wings|butterfly_wings|dragonfly_wings|insect_wings|translucent_wings|glowing_wings|small_wings|large_wings|multiple_wings'], ['Вуха', 'pointy_ears|long_pointy_ears']],
  elf: [['Вуха', 'pointy_ears|long_pointy_ears|long elf ears']],
  dark_elf: [['Вуха', 'pointy_ears|long_pointy_ears|long elf ears']],
  goblin: [['Вуха', 'pointy_ears|large_ears|long_pointy_ears'], ['Ікла й бивні', 'tusks|fangs|sharp_teeth']],
  orc: [['Ікла й бивні', 'tusks|fangs|sharp_teeth'], ['Вуха', 'pointy_ears']],
  werewolf: [['Вуха', 'wolf_ears|fluffy_ears'], ['Хвіст', 'wolf_tail|fluffy_tail'], ['Ікла', RC.fangs], ['Лапи й хутро', 'paw_hands|claw_hands|fur']],
  minotaur: [['Роги', 'bull_horns|horns|large_horns|thick_horns|straight_horns'], ['Хвіст', 'cow_tail'], ['Копита', 'hooves'], ['Вуха', 'animal_ears']],
  centaur: [['Тіло', 'horse_body'], ['Хвіст', 'horse_tail'], ['Копита', 'hooves']],
  arachne: [['Павучі кінцівки', 'spider_legs|extra_arms'], ['Очі', 'extra_eyes|multiple_eyes'], ['Павутиння', 'webbing']],
  spiderfolk: [['Павучі кінцівки', 'spider_legs|extra_arms'], ['Очі', 'extra_eyes|multiple_eyes'], ['Павутиння', 'webbing']],
  ghost: [['Тіло привида', 'transparent_body|ghost_tail']],
  undead: [['Тіло нежиті', 'exposed_bones|rotting_skin']],
  android: [['Механіка', 'mechanical_arms|prosthetic_arm|mechanical_parts|doll_joints|robot_joints|exposed_wires|panel_lines|antenna|cyber_eye|mechanical_tail|mechanical_wings|mechanical_halo']],
  cyborg: [['Механіка', 'mechanical_arms|prosthetic_arm|mechanical_parts|doll_joints|robot_joints|exposed_wires|panel_lines|antenna|cyber_eye|mechanical_tail|mechanical_wings|mechanical_halo']],
  robot: [['Механіка', 'mechanical_arms|prosthetic_arm|mechanical_parts|doll_joints|robot_joints|exposed_wires|panel_lines|antenna|cyber_eye|mechanical_tail|mechanical_wings|mechanical_halo']],
  mecha_musume: [['Механіка', 'mechanical_arms|prosthetic_arm|mechanical_parts|doll_joints|robot_joints|exposed_wires|panel_lines|antenna|cyber_eye|mechanical_tail|mechanical_wings|mechanical_halo']],
  monster: [['З чого складається', 'extra_arms|extra_heads|tentacles|multiple_eyes|extra_eyes|many_mouths|body_spikes|bone_plates|crystal_growths|slime_body|mechanical_parts'], ['Роги', 'horns|broken_horn|twisted_horns|large_horns|thick_horns'], ['Крила', 'bat_wings|leathery_wings|tattered wings|large_wings|huge_wings'], ['Покрив тіла', 'scales|fur|feathers'], ['Хвіст', 'long_tail|scorpion_tail|lizard_tail|spade_tail'], ['Ікла', RC.fangs]],
  plantfolk: [['Рослинність', 'leaf_hair|flower_petals|vines|thorns|bark_skin|moss_covered']],
  slimefolk: [['Слиз', 'slime_body|transparent_body']],
  yuki_onna: [['Лід і мороз', 'ice_crystals|frost_breath']],
  yokai: [['Роги й хвости', 'horns|single_horn|oni_horns|multiple_tails|fox_tail|animal_ears']],
};

// Теги меню рас, яких ще немає серед старих особливостей: додаються в параметр raceFeat (mk-spec.js)
const RACE_NEW_RACES = RACE_NEW.split('|');
const RACE_TAGS_ALL = [...new Set(Object.values(RACE_MENU).flatMap(gs => gs.flatMap(g => g[1].split('|'))))];
