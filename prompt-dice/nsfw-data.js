// Секція «18+»: теги у стилі Danbooru для дорослих персонажів (SDXL і Flux; Gemini не підтримується).
// Усі параметри за замовчуванням вимкнені (manual): секція нічого не додає, доки щось не вибрано.
// Межа вмісту: оголеність, еротична білизна, натяки й пози; без тегів статевих актів і крупних планів геніталій.
// Вільний текст («Свій опис») лишається на розсуд користувача. Формат рядка як у mk-data-extra.js:
// [id, частина, назва, 'single'|'multi', 'Група:: підпис=промпт; підпис=промпт || Група 2:: …'].
// Підписи українською, промпти англійською. Символи «;» і «=» у підписах і промптах не вживати.
const NSFW_ROWS = [
  ['n_level', 'nsfw', 'Рівень відвертості', 'single', 'Рівень:: Чутливий=sensitive; Сумнівний=questionable; Відвертий (NSFW)=nsfw'],
  ['n_nude', 'nsfw', 'Оголеність', 'multi', 'Оголеність:: Топлес=topless; Без низу=bottomless; Повністю гола=completely_nude; Груди назовні=breasts_out; Соски=nipples; Прикриті груди=covering_breasts; Прикритий пах=covering_crotch; Соски крізь тканину=covered_nipples || Частини тіла:: Декольте=cleavage; Нижня частина грудей=underboob; Збоку груди=sideboob; Груди ззаду=backboob; Оголена спина=bare_back; Сідниці=ass; Живіт=navel; Стегна=thighs'],
  ['n_lingerie', 'nsfw', 'Білизна й відвертий одяг', 'multi', 'Білизна:: Бюстгальтер=bra; Трусики=panties; Стринги=thong; Мереживо=lace; Білизна=lingerie; Прозора білизна=see-through, lingerie; Боді=teddy_(lingerie); Бебідол=babydoll; Нічна сорочка=negligee; Підв’язки=garter_belt, garter_straps || Купальники:: Бікіні=bikini; Мікробікіні=micro_bikini; Шнурівка бікіні=string_bikini; Слінгшот=slingshot_swimsuit; Мокрий купальник=wet_swimsuit || На голе тіло:: Фартух на голе тіло=naked_apron; Сорочка на голе тіло=naked_shirt; Рушник=naked_towel; Светр на голе тіло=naked_sweater; Плащ на голе тіло=naked_coat || Панчохи:: Панчохи=thighhighs; Колготки=pantyhose; Сітка=fishnet_legwear; Прозорі панчохи=sheer_legwear'],
  ['n_undress', 'nsfw', 'Роздягання й зсунутий одяг', 'multi', 'Стан одягу:: Роздягається=undressing; Розстебнутий=open_clothes; Розстебнута сорочка=open_shirt; Порваний одяг=torn_clothes; Зсунута бретелька=strap_slip; Збій гардероба=wardrobe_malfunction || Підняття та зсув:: Підняла сорочку=shirt_lift; Підняла спідницю=skirt_lift; Підняла сукню=dress_lift; Стягує одяг=clothes_pull; Відтягнула трусики вбік=panties_aside; Стягує трусики=panty_pull; Стягує бюстгальтер=bra_pull; Піднятий бюстгальтер=bra_lift'],
  ['n_body', 'nsfw', 'Стан тіла', 'multi', 'Стан:: Рум’янець=blush; Піт=sweat; Мокра=wet; Мокрий одяг=wet_clothes; Пара=steam; Важке дихання=heavy_breathing; Блискуча шкіра=shiny_skin; Олія на тілі=oil; Сліди засмаги=tan_lines; Збентежена=embarrassed; Червоні щоки=nose_blush'],
  ['n_pose', 'nsfw', 'Спокусливі пози', 'multi', 'Пози:: Розведені ноги=spread_legs; Ноги вгору=legs_up; На четвереньках=all_fours; Нахилилась=bent_over; Лежить на спині=on_back; Лежить на животі=on_stomach; Вигнута спина=arched_back; Стоїть на колінах=kneeling; Сидить на п’ятах=wariza; Схрещені ноги=crossed_legs; Потягується=stretching; Тримається за груди=grabbing_own_breast; Руки на грудях=hands_on_own_breasts; Погляд через плече=looking_back || Фокус кадру:: Фокус на грудях=breast_focus; Фокус на сідницях=ass_focus; Фокус на стегнах=thigh_focus; Знизу вгору=from_below; Ззаду=from_behind; Згори=from_above; Крупний план=close-up'],
  ['n_expr', 'nsfw', 'Вираз обличчя й погляд', 'multi', 'Вираз:: Спокуслива усмішка=seductive_smile; Напівзаплющені очі=half-closed_eyes; Погляд спокусниці=bedroom_eyes; Розтулені губи=parted_lips; Висунутий язик=tongue_out; Облизує губи=licking_lips; Кусає губу=biting_lip; Дивиться на глядача=looking_at_viewer; Очі-сердечка=heart-shaped_pupils; Хитрий вираз=naughty_face; Соромиться=shy'],
  ['n_set', 'nsfw', 'Місце й світло', 'multi', 'Місце:: Ліжко=on_bed; Спальня=bedroom; Готельний номер=hotel_room; Ванна=bathtub; Душ=shower; Лазня=onsen; Басейн=pool; Пляж=beach; Простирадла=bed_sheet || Світло:: Приглушене світло=dim_lighting; Світло свічок=candlelight; Контрове світло=rim_lighting; Червоне світло=red_light; Рожеве освітлення=pink_lighting'],
  ['n_acc', 'nsfw', 'Аксесуари', 'multi', 'Аксесуари:: Чокер=choker; Нашийник=collar; Пастиси=pasties; Високі підбори=high_heels; Довгі рукавички=elbow_gloves; Кролячі вуха=rabbit_ears; Костюм кролика=playboy_bunny; Вирізи=cleavage_cutout; Вирізи на боках=side_cutout; Хутряні вушка=animal_ears'],
];
const NSFW_IDS = [];
NSFW_ROWS.forEach(r => {
  const c = mkParseRow(r), prompts = [], lab = {};
  c.groups.forEach(g => g[1].forEach(([l, p]) => { prompts.push(p); lab[p] = l; }));
  NSFW_IDS.push(c.id);
  def(c.id, c.label, 'Adult details (18+)', {
    kind: c.mode === 'multi' ? 'multi' : 'single', n: [1, 2], p: 0.6, manual: true, models: ['sdxl', 'flux'],
    opts: () => prompts, lab, groups: c.groups, hint: c.id === 'n_level' ? 'Лише для дорослих персонажів (18+).' : '', nl: v => v,
  });
});
def('n_text', 'Свій опис', 'Adult details (custom)', { kind: 'text', manual: true, models: ['sdxl', 'flux'], opts: () => [], nl: v => v, text: true });
NSFW_IDS.push('n_text');

// чи вибрано хоч щось у секції 18+ (тоді додаються службові теги «nsfw, adult»)
const nsfwActive = () => NSFW_IDS.some(id => { const s = ss(id); return s.mode !== 'off' && s.value.length; });
// Flux: один абзац англійською; повторює дорослість персонажа
function nsfwFluxParagraph(get) {
  const vals = NSFW_IDS.flatMap(id => (get(id) || []).flatMap(v => String(v).split(',').map(x => x.trim())).map(hum)).filter(Boolean);
  return vals.length ? 'Adult artwork of a character who is clearly an adult (18+). Mature details: ' + [...new Set(vals)].join(', ') + '.' : '';
}
(function () {
  const ch = TYPES.char;
  ch.sections.splice(ch.sections.length - 1, 0, { t: '6 · 18+ (дорослий контент)', e: 'Adult content (18+)', s: NSFW_IDS, models: ['sdxl', 'flux'] });
  ch.sdGroups.push({ sec: ch.sections.length - 2, pre: () => (nsfwActive() ? ['nsfw', 'adult'] : []) });
})();
