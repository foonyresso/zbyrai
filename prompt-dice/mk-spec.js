// Специфікація груп для старих параметрів Кубика (див. mk-merge.js).
// Група: [назва, режим, теги через «|», ділянка манекена]. Режим: 's' — не більше одного значення з групи, 'm' — кілька.
// «@id» вбирає залишок категорії манекена (теги, яких ще ніхто не має). «drop» — теги, чий «дім» в іншому параметрі.
// Кожен тег старого параметра має бути в групі (це перевіряє test/mannequin.test.js). Ділянку не вказано: група показується там, де живе параметр.
const MKM_ALIAS = {
  'big eyes': 'large eyes', 'hair clip': 'hairclip', scrunchie: 'hair scrunchie', 'flower in hair': 'hair flower', 'flowers in hair': 'hair flower', 'knee pads': 'kneepads',
  tanlines: 'tan lines', 'pointed ears': 'pointy ears', 'bunny ears': 'rabbit ears', 'band-aid': 'bandaid', 'bandaid on face': 'bandaid on cheek',
};
const MKM_SPEC = {
  // стать задається лише параметром «Стать»: у решті тегів тіла слів «жіночий/чоловічий» немає
  // сусідні старі параметри з повторами: «дім» тегу в іншому місці
  action: { drop: 'laughing|shouting|blowing_kiss|jumping|leaping|stretching|walking|running' },
  legPos: { drop: 'standing_on_one_leg|walking' },
  pose: { drop: 'hands_on_hips' },
  interaction: { drop: 'hand_on_own_thigh|adjusting_hair' },
  cameraAngle: { drop: 'depth_of_field' },
  background: { drop: 'depth_of_field|fog' },
  lighting: { drop: 'sunset|twilight' },
  weather: { drop: 'sunbeam' },
  race: {
    drop: 'demon_girl|demon_boy|fox_girl|fox_boy|cat_girl|cat_boy|wolf_girl|wolf_boy|dog_girl|dog_boy|rabbit_girl|horse_girl|tiger_girl|dragon_girl|dragon_boy|snake_girl|bird_girl|monster_girl|slime_girl|spider_girl|plant_girl',
    groups: [
      ['Люди й фентезійні раси', 'm', 'human|elf|dark_elf|fairy|goblin|orc|valkyrie|witch|dullahan|yokai|yuki_onna|kitsune|oni|dragonborn|dragonkin'],
      ['Демони й небесні', 'm', 'demon|succubus|vampire|angel|fallen_angel'],
      ['Звіролюди й напівмонстри', 'm', 'catfolk|foxfolk|wolffolk|dogfolk|rabbitfolk|horsefolk|tigerfolk|beastfolk|werewolf|minotaur|snakefolk|birdfolk|lamia|harpy|mermaid|arachne|spiderfolk|centaur'],
      ['Монстри й рослини', 'm', 'monster|plantfolk|slimefolk'],
      ['Нежить і штучні істоти', 'm', 'ghost|undead|android|cyborg|robot|mecha_musume'],
    ],
  },
  raceFeat: {
    label: 'Расові особливості (роги, крила, хвости…)',
    drop: 'claws|slit_pupils|colored_sclera|black_sclera|glowing_veins|facial_mark|forehead_jewel|gem_on_forehead|black_wings|white_wings',
    groups: [
      ['Роги', 'm', 'horns|demon_horns|curled_horns|long_horns|single_horn|oni_horns|goat_horns|antlers|dragon_horns|broken_horn|horns_through_hair|@pl_horns', 'hair'],
      ['Крила', 'm', 'angel_wings|demon_wings|bat_wings|dragon_wings|feathered_wings|butterfly_wings|fairy_wings|mechanical_wings|large_wings|multiple_wings|head_wings|folded wings|spread wings|tattered wings', 'torso'],
      ['Хвости', 'm', 'demon_tail|dragon_tail|fox_tail|multiple_tails|cat_tail|wolf_tail|lizard_tail|fluffy_tail|scorpion_tail|@pl_tail', 'pelvis'],
      ['Вуха', 'm', 'pointy_ears|long_pointy_ears|animal_ears|fox_ears|cat_ears|wolf_ears|fake_animal_ears|@x_ears2', 'ears'],
      ['Німб', 'm', 'halo|mechanical_halo|broken_halo', 'hat'],
      ['Додаткові очі', 'm', 'third_eye|extra_eyes', 'forehead'],
      ['Ікла й зуби', 'm', 'fangs|sharp_teeth', 'mouth'],
      ['Покрив тіла', 'm', 'scales|fur|feathers'],
      ['Механічні й зайві кінцівки', 'm', 'mechanical_arms|prosthetic_arm|mechanical_parts|extra_arms', 'arm'],
      ['Незвичайне волосся', 'm', 'tentacle_hair|snake_hair|crystal_hair|flame_hair', 'hair'],
    ],
  },
  skin: { drop: 'dark-skinned_female|dark-skinned_male|dark-skinned_female, shiny_skin|dark-skinned_male, scar|colored_skin, blue_skin|colored_skin, red_skin|colored_skin, purple_skin|colored_skin, green_skin|colored_skin, grey_skin|colored_skin, white_skin', groups: [
    ['Відтінок шкіри', 'm', 'pale_skin|tan|dark_skin'],
    ['Особливості шкіри', 'm', 'shiny_skin|freckles|tan, tanlines|pale_skin, freckles|dark_skin, shiny_skin|dark_skin, scar'],
  ] },
  build: {
    label: 'Комплекція: зріст, статура, м’язи',
    drop: 'abs|thick_thighs|wide_hips|broad_shoulders|muscular_male|bara|tall_female|tall_male|muscular_female|bishounen',
    groups: [
      ['Зріст', 's', 'tall|short|very tall, towering|average height|petite, tiny'],
      ['Статура', 's', 'curvy|slim|athletic|toned|lean_body|hourglass|androgynous|@pl_body_type'],
      ['М’язи й рельєф', 's', '@x_muscle'],
      ['Пропорції', 'm', 'narrow_waist|@pl_body_proportions'],
      ['Постава', 's', 'straight posture|slouched, hunched|proud posture, chest out|relaxed posture'],
    ],
  },
  permFeat: {
    label: 'Шрами, тату, родимки, аура',
    drop: 'freckles|eyepatch|collar|ear_piercing|tongue_piercing|navel_piercing|prosthetic_leg',
    groups: [
      ['Шрами й пошкодження', 'm', 'scar|cross_scar|burn_scar|scar_on_arm|bruise|stitches|bandages|bandaged_arm|@pl_body_scars'],
      ['Тату на тілі', 'm', 'tattoo|arm_tattoo|shoulder_tattoo|chest_tattoo|thigh_tattoo|neck_tattoo|back_tattoo|stomach_tattoo|leg_tattoo|hand_tattoo|glowing_tattoo|full-body_tattoo|body_markings|@pl_body_tattoo'],
      ['Родимки й мітки на тілі', 'm', 'mole|@pl_body_marks'],
      ['Аура й світні жили', 'm', 'aura|dark_aura|glowing_aura|veins|glowing_veins'],
      ['Пірсинг і протези', 'm', 'piercing|mechanical_arm'],
      ['Шрами на обличчі', 'm', 'scar_on_face|scar_across_eye|scar_on_cheek|bandaid_on_face|@pl_face_scars', 'face'],
      ['Тату й мітки на обличчі', 'm', 'facial_tattoo|facial_mark|forehead_mark|forehead_jewel|gem_on_forehead|@pl_face_tattoo', 'face'],
      ['Родимки й розмальовка обличчя', 'm', 'mole_under_eye|mole_under_mouth|beauty_mark|@pl_face_marks', 'face'],
    ],
  },
  hairColor: { opts: 'multicolored_hair|two-tone_hair|gradient_hair|streaked_hair|colored_inner_hair|colored_tips|split-color_hair|rainbow_hair', groups: [
    ['Різнокольорове (два кольори з палітри)', 'm', 'multicolored_hair|two-tone_hair|gradient_hair|streaked_hair|colored_inner_hair|colored_tips|split-color_hair|rainbow_hair'],
  ] },
  hairStyle: {
    label: 'Зачіска і текстура волосся',
    kind: 'multi', n: [1, 2], drop: 'swept_bangs|hair_over_shoulder',
    groups: [
      ['Хвости', 's', 'ponytail|high_ponytail|low_ponytail|side_ponytail|short_ponytail|braided_ponytail|twintails|low_twintails'],
      ['Коси', 's', 'braid|single_braid|twin_braids|side_braid|french_braid|crown_braid|long_braid'],
      ['Пучки й зачісування вгору', 's', 'hair_bun|double_bun|braided_bun|topknot|single_hair_bun|half_updo|updo|hair_pulled_back|slicked_back|hair_slicked_back'],
      ['Стрижки', 's', 'bob_cut|hime_cut|wolf_cut|undercut|pompadour|spiked_hair|mohawk|bowl_cut|asymmetrical_hair'],
      ['Локони й дреди', 's', 'ringlets|drill_hair|twin_drills|dreadlocks|afro'],
      ['Розпущене', 's', 'loose_hair'],
      ['Текстура волосся', 's', 'straight_hair|wavy_hair|curly_hair|messy_hair|@x_hairtex'],
    ],
  },
  hairDetail: {
    label: 'Волосся: чубчик, пасма, прикраси, ефекти',
    drop: 'asymmetrical_hair|gradient_hair|colored_inner_hair|single_hair_bun',
    groups: [
      ['Чубчик', 's', 'bangs|blunt_bangs|swept_bangs|parted_bangs|braided_bangs|diagonal_bangs|forehead|@pl_hair_bangs|@x_fringe', 'fringe'],
      ['Пасма й прядки', 'm', 'hair_between_eyes|ahoge|hair_over_one_eye|sidelocks|long_sidelocks|hair_intakes|hair_behind_ear|eyebrows_visible_through_hair|hair_over_shoulder', 'fringe'],
      ['Поділ і рух волосся', 'm', 'floating_hair|@x_hairmove', 'hair'],
      ['Прикраси у волоссі', 'm', 'hair_ornament|hair_ribbon|hairband|hair_flower|hair_bow|hair_rings|hairclip|hair_tubes|hair_scrunchie|beads_in_hair|feather_in_hair|chain_in_hair|@pl_hair_acc', 'hair'],
      ['Ефекти волосся', 'm', 'glowing_hair|@x_hairtone', 'hair'],
    ],
  },
  eyeColor: {
    opts: 'heterochromia|multicolored_eyes|gradient_eyes',
    groups: [
      ['Різнокольорові очі (два кольори з палітри)', 'm', 'heterochromia|multicolored_eyes|gradient_eyes'],
    ],
  },
  eyeDetail: {
    label: 'Очі: форма, зіниці, склера, вії',
    drop: 'empty_eyes|sparkling_eyes|gradient_eyes|eyeshadow|colored_eyelashes|colored_sclera|black_sclera|red_sclera',
    groups: [
      ['Розріз і форма очей', 's', 'tareme|tsurime|jitome|sanpaku|@pl_eye_shape|@x_eyesize'],
      ['Зіниці', 's', 'slit_pupils|diamond-shaped_pupils|star-shaped_pupils|heart-shaped_pupils|symbol-shaped_pupils|ringed_eyes|bright_pupils|constricted_pupils|dot_pupils|mismatched_pupils|horizontal_pupils|cross-shaped_pupils|flower-shaped_pupils|@pl_pupils'],
      ['Склера', 's', 'sclera'],
      ['Вії', 'm', 'long_eyelashes|thick_eyelashes|@x_lashes'],
      ['Сяйво й деталі очей', 'm', 'glowing_eyes|glowing_eye|shiny_eyes|detailed_eyes|beautiful_detailed_eyes|eyes_visible_through_hair|@pl_eye_special'],
    ],
  },
  eyeExpr: {
    drop: 'jitome|sanpaku|sharp_eyes|upturned_eyes|downturned_eyes|furrowed_brow|looking_at_viewer',
    groups: [
      ['Розплющеність і напрямок', 'm', 'half-closed_eyes|narrowed_eyes|wide-eyed|closed_eyes|one_eye_closed|eyes_closed, smile|side_eye|rolling_eyes|unfocused_eyes'],
      ['Погляд і настрій', 'm', 'glaring|serious_eyes|intense_gaze|piercing_gaze|crazy_eyes|raised_eyebrow|shaded_face|tearful'],
      ['Особливі очі', 'm', 'empty_eyes|sparkling_eyes|spiral_eyes|heart_eyes|bright_eyes|dark_eyes'],
    ],
  },
  emotion: {
    drop: 'closed_mouth|glaring',
    groups: [
      ['Усмішки й сміх', 'm', 'smile|light_smile|smirk|grin|evil_smile|seductive_smile|evil_grin|crazy_smile|gentle_smile|smug|joyful|laughing|:3|;)|wink|naughty_face'],
      ['Рум’янець і сором', 'm', 'blush|light_blush|nose_blush|embarrassed'],
      ['Гнів і неприязнь', 'm', 'angry|annoyed|disdain|contempt|disgust|fierce|yandere|tsundere'],
      ['Смуток і страх', 'm', 'sad|crying|tears|scared|worried|melancholic'],
      ['Здивування й роздуми', 'm', 'surprised|confused|pensive|excited'],
      ['Спокій і байдужість', 'm', 'serious|expressionless|confident|determined|bored|sleepy|pout'],
    ],
  },
  expression: {
    drop: 'pout|grin|smirk',
    groups: [
      ['Стан рота', 'm', 'closed_mouth|parted_lips|open_mouth|slight_smile|frown|lips|wavy_mouth|:o|:d|:p|puffy_cheeks|mouth_hold|@pl_mouth_state', 'mouth'],
      ['Зуби й язик', 'm', 'fang|fang_out|clenched_teeth|gritted_teeth|tongue_out|sticking_tongue_out|licking_lips|biting_lip|lip_biting', 'mouth'],
      ['Голос і дії', 'm', 'shouting|screaming|yawning|whistling|kiss|blowing_kiss', 'mouth'],
    ],
  },
  makeup: {
    label: 'Макіяж (обличчя, очі, губи)',
    drop: 'facial_mark|forehead_mark|mole_under_eye|mole_under_mouth|beauty_mark|scar_on_face|red_lips|black_lipstick|purple_lips|pink_lips|red_eyeshadow|purple_eyeshadow|blue_eyeshadow|gold_eyeshadow|black_eyeliner|colored_eyelashes',
    groups: [
      ['Макіяж і розмальовка обличчя', 'm', 'makeup|facepaint|glitter_makeup|war_paint', 'face'],
      ['Макіяж очей', 'm', 'eyeshadow|eyeshadow, smoky_eyes|eyeliner|winged_eyeliner|mascara|@pl_eye_makeup', 'eyes'],
      ['Помада й губи', 'm', 'lipstick|lip_gloss|glossy_lips|shiny_lips', 'mouth'],
    ],
  },
  nails: {
    kind: 'multi', n: [1, 2], opts: 'long_fingernails|sharp_fingernails|short_nails|nail_polish|claws',
    groups: [
      ['Форма нігтів', 's', 'long_fingernails|sharp_fingernails|short_nails'],
      ['Лак і кігті (колір — з палітри)', 'm', 'nail_polish|claws'],
    ],
  },
  breasts: { groups: [
    ['Розмір грудей', 'm', 'gigantic_breasts|huge_breasts|large_breasts|medium_breasts|small_breasts|flat_chest'],
  ] },
  hips: {
    drop: 'broad_shoulders|thick_thighs',
    groups: [
      ['Стегна й сідниці', 'm', 'wide_hips, narrow_waist|wide_hips, thick_thighs|narrow_waist, wide_hips, thick_thighs|wide_hips, huge_ass|thick_thighs, narrow_waist|curvy, wide_hips|large_ass, narrow_waist|plump, wide_hips'],
      ['Плечі й талія', 'm', 'narrow_waist, broad_shoulders|wide_shoulders, narrow_waist', 'shoulders'],
    ],
  },
  limbs: {
    drop: 'long_legs|thick_thighs|toned|skinny|muscular_female|thick_arms|muscular_legs|veins|slender',
    groups: [
      ['Ноги', 'm', 'long_legs, slim_legs|thick_thighs, long_legs|long_legs, slender|toned, abs', 'leg'],
      ['Руки', 'm', 'thin_arms, long_legs|muscular_arms', 'arm'],
    ],
  },
  bareParts: {
    drop: 'bare_legs|zettai_ryouiki|abs|muscular_arms|veins',
    groups: [
      ['Плечі й руки', 'm', 'bare_shoulders|off_shoulder|bare_arms|detached_sleeves|sleeveless|rolled_up_sleeves', 'shoulders'],
      ['Груди', 'm', 'cleavage|cleavage_cutout|sideboob|underboob|strapless|halterneck|bare_pectorals', 'chest'],
      ['Живіт і талія', 'm', 'midriff|navel|navel_cutout|open_shirt|open_jacket|taut_clothes|clothing_cutout', 'belly'],
      ['Спина', 'm', 'bare_back|backless_outfit', 'torso'],
      ['Стегна й ноги', 'm', 'bare_hips|bare_thighs|thighs|hip_vent|side_slit|pelvic_curtain', 'pelvis'],
    ],
  },
  outState: {
    drop: 'off_shoulder|clothing_cutout',
    groups: [
      ['Пошкоджений одяг', 'm', 'torn_clothes|tattered_clothes|ripped_clothes|torn_sleeves|armor_damaged'],
      ['Розстебнутий й спущений', 'm', 'open_clothes|unbuttoned|unzipped|untied|loose_clothes|clothes_pull|strap_slip'],
      ['Прозорий і мокрий', 'm', 'see-through|wet_clothes'],
      ['Крій і шари', 'm', 'cropped_jacket|asymmetrical_clothes|layered_clothes'],
      ['Рух і декор', 'm', 'billowing_clothes|cape_flowing|ruffled_sleeves|glowing_trim'],
    ],
  },
  legwear: {
    label: 'Панчохи, штани, взуття для ніг',
    drop: 'cargo_pants|leather_pants|black_thighhighs|white_thighhighs|black_pantyhose|red_thighhighs|purple_thighhighs|black_pants',
    groups: [
      ['Панчохи й колготки', 'm', 'thighhighs|striped_thighhighs|fishnet_thighhighs|single_thighhigh|over-kneehighs|stockings|pantyhose|torn_pantyhose|fishnets|toeless_legwear|lace-trimmed_legwear|asymmetrical_legwear|mismatched_legwear'],
      ['Шкарпетки й гетри', 'm', 'knee_socks|leg_warmers|@pl_legwear', 'foot'],
      ['Оголені ноги й підв’язки', 'm', 'bare_legs|zettai_ryouiki|garter_straps|garter_belt|thigh_strap'],
      ['Штани й шорти', 'm', 'pants|baggy_pants|loose_pants|shorts', 'pelvis'],
      ['Захист ніг', 'm', 'armored_leggings|greaves|knee_pads'],
    ],
  },
  footwear: {
    drop: 'greaves|black_footwear|brown_footwear|red_footwear|white_footwear',
    groups: [
      ['Каблуки й платформа', 'm', 'high_heels|stiletto_heels|wedge_heels|platform_footwear|high_heel_boots'],
      ['Чоботи й черевики', 'm', 'thigh_boots|knee_boots|ankle_boots|combat_boots|boots|armored_boots|lace-up_boots|buckled_boots|cross-laced_footwear|fur-trimmed_boots'],
      ['Інше взуття', 'm', 'sneakers|loafers|sandals|geta|barefoot'],
    ],
  },
  gloves: {
    drop: 'detached_sleeves|black_gloves|white_gloves|red_gloves|fingerless_gloves, black_gloves|gold_gauntlets',
    groups: [
      ['Рукавички', 'm', 'gloves|fingerless_gloves|elbow_gloves|leather_gloves|lace_gloves|fur-trimmed_gloves|single_glove|claw_gloves'],
      ['Рукавиці й наручі', 'm', 'gauntlets|armored_gloves|bridal_gauntlets|bracers|spiked_bracers'],
      ['Рукави', 'm', 'long_sleeves|wide_sleeves'],
    ],
  },
  headwear: {
    kind: 'multi', n: [1, 2], drop: 'hair_flower|eyepatch',
    groups: [
      ['Капелюхи й шапки', 'm', 'hat|witch_hat|beret|top_hat|cowboy_hat|tricorne|bandana|headband|visor|goggles_on_head|headset|cat_ear_headphones'],
      ['Корони й обручі', 'm', 'crown|tiara|circlet|mini_crown|diadem|laurel_crown|head_wreath'],
      ['Шоломи, капюшони, вуалі', 'm', 'hood|hood_up|hooded_cloak|helmet|horned_helmet|forehead_protector|headdress|veil|ear_covers'],
      ['Інші прикраси голови', 'm', '@x_hat2'],
    ],
  },
  accessories: {
    drop: 'thigh_strap|hair_ornament|circlet|hip_vent|gold_trim|gold_chain',
    groups: [
      ['Шия й намисто', 'm', 'choker|necklace|pendant|amulet|pearl_necklace|crystal_necklace|collar|spiked_collar|rosary|@pl_neck_acc', 'neck'],
      ['Сережки й вуха', 'm', 'earrings|ear_piercing|single_earring|@pl_ear_acc', 'ears'],
      ['Окуляри й маски', 'm', 'glasses|sunglasses|monocle|mask|@pl_eyewear', 'eyes'],
      ['Руки й зап’ястя', 'm', 'bracelet|armlet|ring|arm_guards', 'wrist'],
      ['Плечі й груди', 'm', 'pauldrons|shoulder_armor|brooch|badge|crest', 'shoulders'],
      ['Пояс', 'm', 'belt|sash|belt_pouch|harness|bandolier|waist_cape|@pl_waist_acc', 'waist'],
      ['Спина й накидки', 'm', 'cape|cloak|scarf|backpack|quiver|@pl_back_acc', 'torso'],
      ['Щиколотка', 'm', 'anklet', 'ankle'],
      ['Загальні оздоблення', 'm', 'ribbon|fur_trim|trim|chain|bell|tassel|feather_ornament|gem|jewelry|pocket_watch'],
    ],
  },
};

// Теги з меню рас, яких не було серед старих особливостей, потрапляють у відповідні групи (роги до рогів, крила до крил…)
(function raceExtras() {
  const groups = MKM_SPEC.raceFeat.groups, rules = [[/horn/, 'Роги'], [/wing/, 'Крила'], [/tail/, 'Хвости'], [/ears?$/, 'Вуха'], [/halo/, 'Німб']];
  const have = new Set(groups.flatMap(g => g[2].split('|')).filter(t => t[0] !== '@'));
  const rest = [];
  RACE_TAGS_ALL.forEach(t => {
    if (have.has(t)) return;
    const r = rules.find(x => x[0].test(t));
    const g = r && groups.find(x => x[0] === r[1]);
    if (g) g[2] += '|' + t; else rest.push(t);
  });
  groups.push(['Інше за расами', 'm', rest.join('|')]);
})();

// Категорії манекена з одних кольорів: колір — це палітра (colors.js), тож такі теги прибрано або зведено до одного тегу
const MKM_CATS = {
  pl_fur_color: null, pl_teeth_color: null, pl_tongue_color: null, pl_sclera: null, pl_lip_color: null,
  pl_bg_color: [['Колір', [['Однотонний фон: колір', 'background']]]],
};
