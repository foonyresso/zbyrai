#!/usr/bin/env python3
"""Витягує систему предметів гри GodsDontDie у loot-forge/gdd-data.js.

Лише читає репозиторій гри (нічого в ньому не змінює). Запуск:
    python3 loot-forge/sync/extract-gdd.py /шлях/до/GodsDontDie [--named N|all]

Джерела у грі: db/item_class_db.yml, db/items/**, Items/Qualities.cs, Items/Effects*.cs, Items/Inserts.cs,
Items/Sets.cs, Items/SetsRunewords.g.cs, Items/RandomSets.cs, Items/NamedItems.g.cs, Locale/strings.csv.
Коли гра зміниться, запусти скрипт ще раз і перевір `git diff loot-forge/gdd-data.js`.
"""
import csv, json, os, re, subprocess, sys

root = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else '/home/user/godsdontdie'
named_arg = '3'
if '--named' in sys.argv:
    named_arg = sys.argv[sys.argv.index('--named') + 1]
named_limit = 10 ** 9 if named_arg == 'all' else int(named_arg)
out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'gdd-data.js')


def read(rel):
    with open(os.path.join(root, rel), encoding='utf-8') as f:
        return f.read()


# ---------- переклади ----------
loc = {}
with open(os.path.join(root, 'Locale', 'strings.csv'), encoding='utf-8', newline='') as f:
    rd = csv.reader(f)
    next(rd)
    for row in rd:
        if len(row) >= 2:
            loc[row[0]] = row[1]


def tr(key, default=None):
    return loc.get(key, default if default is not None else key)


def keyof(code, prefix):
    return prefix + code.replace('.', '_').upper()


# ---------- YAML (простий формат db/*.yml) ----------
def parse_yml(text):
    rows, cur = [], None
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        m = re.match(r'^\s*- (\w+):\s*(.*)$', line)
        if m:
            cur = {}
            rows.append(cur)
            k, v = m.group(1), m.group(2)
        else:
            m = re.match(r'^\s{4}(\w+):\s*(.*)$', line)
            if not m or cur is None:
                continue
            k, v = m.group(1), m.group(2)
        v = v.strip()
        if v.startswith('['):
            cur[k] = [x.strip() for x in v.strip('[]').split(',') if x.strip()]
        elif re.fullmatch(r'-?\d+', v):
            cur[k] = int(v)
        elif re.fullmatch(r'-?\d+\.\d+', v):
            cur[k] = float(v)
        elif v in ('true', 'false'):
            cur[k] = v == 'true'
        else:
            cur[k] = v
    return rows


# ---------- слоти ----------
SLOTS = ['Head', 'Shoulders', 'Cloak', 'Chest', 'Wrists', 'Hands', 'Waist', 'Legs', 'Feet', 'Neck', 'Ring', 'Trinket',
         'MainHand', 'OffHand', 'TwoHand', 'Extra', 'Shirt', 'Tabard', 'Glider', 'Mount', 'Bag', 'None']
slots = [{'id': s, 'name': tr('CODEX_SLOT_' + s.upper(), s)} for s in SLOTS if s not in ('None',)]

# ---------- класи ----------
CLASS_NAMES = {'class.armor': 'Броня', 'class.jewelry': 'Прикраси', 'class.one_hand': 'Одноручна зброя', 'class.two_hand': 'Дворучна зброя',
               'class.off_hand': 'Друга рука', 'class.extra': 'Додаткове', 'class.travel': 'Пересування', 'class.cosmetic': 'Косметика',
               'class.bag': 'Сумки', 'class.junk': 'Простий лут'}
classes = []
for c in parse_yml(read('db/item_class_db.yml')):
    classes.append({
        'id': c['Code'], 'name': CLASS_NAMES.get(c['Code'], c['Code']),
        'genSockets': [c.get('GenSocketsMin', 0), c.get('GenSocketsMax', 0)], 'maxSockets': c.get('MaxSockets', 0),
        'hasStats': c.get('HasStats', True), 'mainStat': c.get('MainStat', 'armor'), 'enhancePool': c.get('EnhancePool', []),
        'insertKind': c.get('InsertKind', 'armor'), 'maxDurability': c.get('MaxDurability', 0), 'maxStack': 1 if c.get('MaxStack', 1) == 1 else 'inf',
    })

# ---------- бази предметів ----------
bases = []
items_dir = os.path.join(root, 'db', 'items')
for dp, dn, fn in sorted(os.walk(items_dir)):
    for name in sorted(fn):
        if not name.endswith('.yml') or name == 'junk.yml':
            continue
        rel = os.path.relpath(os.path.join(dp, name), root).replace(os.sep, '/')
        for b in parse_yml(read(rel)):
            o = {'id': b['Code'], 'name': tr(b.get('NameKey', ''), b['Code']), 'slot': b['Slot'], 'cls': b['Class'], 'mult': b.get('TypeMult', 1.0)}
            if b.get('BagSlots'):
                o['bagSlots'] = b['BagSlots']
            bases.append(o)

# ---------- якості ----------
qsrc = read('Items/Qualities.cs')
qualities = []
for m in re.finditer(r'c\.Add\(Q\("([^"]+)", (\d+), "(#\w+)", ([\d.]+), (\d+), (\d+), ([\d.]+), (-?[\d.]+), (\d+), (true|false), (\d+)(, iridescent: true)?\)\);', qsrc):
    code, rank, color, mult, bonus, uniq, weight, growth, minlvl, mighty, glow, irid = m.groups()
    qualities.append({'id': code, 'name': tr(keyof(code, 'ITEM_')), 'rank': int(rank), 'color': color, 'mult': float(mult), 'bonus': int(bonus), 'unique': int(uniq),
                      'weight': float(weight), 'growth': float(growth), 'minLvl': int(minlvl), 'mighty': mighty == 'true', 'glow': int(glow), 'iridescent': bool(irid)})
vm = re.search(r'private static QualityCard V\(.*?=> new\(\)\s*\{(.*?)\};', qsrc, re.S).group(1)
vfix = {k: v for k, v in re.findall(r'(\w+) = ([\d.]+)', vm)}
for m in re.finditer(r'c\.Add\(V\("([^"]+)", "(#\w+)", "([^"]+)"\)\);', qsrc):
    code, color, theme = m.groups()
    qualities.append({'id': code, 'name': tr(keyof(code, 'ITEM_')), 'rank': int(vfix['Rank']), 'color': color, 'mult': float(vfix['StatMult']),
                      'bonus': int(vfix['BonusCount']), 'unique': int(vfix['UniqueCount']), 'weight': float(vfix['DropWeight']), 'growth': float(vfix['LevelGrowth']),
                      'minLvl': int(vfix['MinSourceLevel']), 'mighty': True, 'glow': int(vfix['GlowTier']), 'iridescent': True, 'theme': theme})

# ---------- ефекти ----------
USE_BITS = {'Bonus': 'bonus', 'Unique': 'unique', 'Theme': 'theme', 'Enhance': 'enhance', 'Set': 'set', 'Insert': 'insert', 'Named': 'named'}
CLASS_SETS = {'Weapons': ['class.one_hand', 'class.two_hand', 'class.extra'], 'Defense': ['class.armor', 'class.off_hand', 'class.jewelry', 'class.travel'], 'null': None}
effects, seen_eff = [], set()


def parse_use(expr, table):
    out = []
    for part in expr.split('|'):
        p = part.strip()
        if p.startswith('EffectUse.'):
            out.append(USE_BITS[p[10:]])
        elif p in table:
            out.extend(table[p])
    return sorted(set(out), key=list(USE_BITS.values()).index)


def parse_effects(rel):
    text, table = read(rel), {}
    for line in text.splitlines():
        cm = re.match(r'\s*const EffectUse (\w+) = (.+);', line)
        if cm:
            table[cm.group(1)] = parse_use(cm.group(2), table)
            continue
        m = re.match(r'\s*E\(c, "([^"]+)", "([^"]+)", EffectKind\.(\w+), (-?[\d.]+), (-?[\d.]+), ([\d.]+), ([^,]+?), (null|\w+), ?(.*)\);', line)
        if not m:
            continue
        code, group, kind, mn, mx, power, use, cls, tags = m.groups()
        if code in seen_eff:
            continue
        seen_eff.add(code)
        effects.append({'id': code, 'name': tr(keyof(code, 'EFFECT_')), 'group': group, 'kind': kind.lower(), 'min': float(mn), 'max': float(mx), 'power': float(power),
                        'use': parse_use(use, table), 'classes': CLASS_SETS.get(cls), 'tags': re.findall(r'"([^"]+)"', tags)})


for rel in ['Items/Effects.cs', 'Items/Effects.g.cs', 'Items/SetsRunewords.g.cs']:
    parse_effects(rel)
named_src = read('Items/NamedItems.g.cs')
named_effects = {}
for m in re.finditer(r'E\(c, "([^"]+)", "named", EffectKind\.Flag, 0, 0, ([\d.]+), EffectUse\.Named, null, (.*)\);', named_src):
    named_effects[m.group(1)] = (float(m.group(2)), re.findall(r'"([^"]+)"', m.group(3)))

# ---------- вставки ----------
isrc = read('Items/Inserts.cs')
gem_tiers = re.search(r'GemTiers = \{ ([^}]*) \}', isrc).group(1)
gem_tiers = re.findall(r'"(\w+)"', gem_tiers)
gem_strength = float(re.search(r'const double s = ([\d.]+);', isrc).group(1))
GEM_COLORS = {'ruby': '#e0384a', 'sapphire': '#3a6fe0', 'emerald': '#2fbf6a', 'topaz': '#f0c030', 'amethyst': '#a052e0', 'diamond': '#e8f4ff', 'obsidian': '#3a3048', 'pearl': '#f2ead8'}
gems = [{'id': g, 'name': tr('INSERT_GEM_' + g.upper()), 'weapon': w, 'armor': a, 'jewelry': j, 'color': GEM_COLORS.get(g, '#cccccc')}
        for g, w, a, j in re.findall(r'\("(\w+)", "([\w.]+)", "([\w.]+)", "([\w.]+)"\),', isrc)]
rune_ids = re.findall(r'"(\w+)"', re.search(r'RuneIds =\s*\{(.*?)\};', isrc, re.S).group(1))
rune_weak = re.findall(r'"([\w.]+)"', re.search(r'string\[\] weak =\s*\{(.*?)\};', isrc, re.S).group(1))
rm = re.search(r'EffectsBy = new\(\) \{ \["any"\] = new\[\] \{ new InsertEffect\(weak\[i % weak\.Length\], ([\d.]+) \+ ([\d.]+) \* i\) \} \}', isrc)
rune_strength = [float(rm.group(1)), float(rm.group(2))]
runes = [{'id': r, 'name': tr('INSERT_RUNE_' + r.upper())} for r in rune_ids]

runewords = []
for rel in ['Items/Inserts.cs', 'Items/SetsRunewords.g.cs']:
    for m in re.finditer(r'RW\("([^"]+)", new\[\] \{ ([^}]*) \}, new\[\] \{ ([^}]*) \}, "([^"]+)", ([\d.]+)\);', read(rel)):
        code, kinds, rs, eff, st = m.groups()
        runewords.append({'id': code, 'name': tr(keyof(code, 'INSERT_')), 'kinds': re.findall(r'"([^"]+)"', kinds), 'runes': re.findall(r'"(\w+)"', rs), 'effect': eff, 'strength': float(st)})

cards = []
for m in re.finditer(r'^\s*C\("([^"]+)", (weapon|armor|null|new\[\] \{[^}]*\}), (.*)\);\s*$', isrc, re.M):
    code, sl, effs = m.groups()
    if sl == 'weapon':
        sls = ['MainHand', 'TwoHand']
    elif sl == 'armor':
        sls = ['Chest']
    elif sl == 'null':
        sls = None
    else:
        sls = re.findall(r'Slot\.(\w+)', sl)
    cards.append({'id': code, 'name': tr(keyof(code, 'INSERT_')), 'slots': sls, 'effects': [[e, float(s)] for e, s in re.findall(r'new InsertEffect\("([^"]+)", ([\d.]+)\)', effs)]})
card_sets = []
for m in re.finditer(r'Code = "(cardset\.\w+)", NameKey = [^,]+,\s*Cards = new\[\] \{ ([^}]*) \},\s*Effects = new\[\] \{ (.*?) \},', isrc, re.S):
    card_sets.append({'id': m.group(1), 'name': tr(keyof(m.group(1), 'INSERT_')), 'cards': re.findall(r'"([^"]+)"', m.group(2)),
                      'effects': [[e, float(s)] for e, s in re.findall(r'new InsertEffect\("([^"]+)", ([\d.]+)\)', m.group(3))]})

# ---------- комплекти ----------
sets = []
ssrc = read('Items/Sets.cs')
for m in re.finditer(r'Code = "(set\.\w+)", NameKey = "(\w+)", Source = "([^"]+)"(?:, Named = (true|false))?,\s*Slots = new\[\] \{([^}]*)\},\s*Bonuses = new\[\]\s*\{(.*?)\},\s*\}\);', ssrc, re.S):
    code, nk, src, named, sl, bon = m.groups()
    sets.append({'id': code, 'name': tr(nk), 'source': src, 'named': named == 'true', 'ref': '', 'slots': re.findall(r'Slot\.(\w+)', sl),
                 'bonuses': [[int(n), e] for n, e in re.findall(r'new SetBonus\((\d+), "([^"]+)"\)', bon)]})
for m in re.finditer(r'Add\(c, "(set\.\w+)", "([^"]+)", (true|false), "([^"]*)", new\[\] \{ ([^}]*) \}, (.*)\);', read('Items/SetsRunewords.g.cs')):
    code, src, named, ref, sl, bon = m.groups()
    sets.append({'id': code, 'name': tr('SET_' + code.split('.', 1)[1].upper()), 'source': src, 'named': named == 'true', 'ref': ref, 'slots': re.findall(r'Slot\.(\w+)', sl),
                 'bonuses': [[int(n), e] for n, e in re.findall(r'new SetBonus\((\d+), "([^"]+)"\)', bon)]})

# ---------- випадкові комплекти ----------
rsrc = read('Items/RandomSets.cs')
themes, adjs, nouns = [], {}, {}
for m in re.finditer(r'T\("([^"]+)", new\[\] \{([^}]*)\}, new\[\] \{([^}]*)\}, new\[\] \{([^}]*)\}, new\[\] \{([^}]*)\}, "([^"]+)"\);', rsrc):
    code, tags, ad, nm, nf, special = m.groups()
    ad, nm, nf = [re.findall(r'"(\w+)"', x) for x in (ad, nm, nf)]
    for a in ad:
        adjs[a] = [tr('SET_ADJ_%s_M' % a), tr('SET_ADJ_%s_F' % a)]
    for n in nm + nf:
        nouns[n] = tr('SET_NOUN_' + n)
    themes.append({'id': code, 'tags': re.findall(r'"(\w+)"', tags), 'adj': ad, 'nounsM': nm, 'nounsF': nf, 'special': special})
slot_pool = re.findall(r'Slot\.(\w+)', re.search(r'SlotPool =\s*\{(.*?)\};', rsrc, re.S).group(1))
rparts = [int(x) for x in re.search(r'new\[\] \{ (4, 4, 6, 6, 6, 8) \}', rsrc).group(1).split(',')]
random_sets = {'themes': themes, 'adjectives': adjs, 'nouns': nouns, 'slotPool': slot_pool, 'parts': rparts, 'format': tr('SET_RANDOM_FMT')}

# ---------- іменовані (вибірка) ----------
named, per_src = [], {}
for m in re.finditer(r'N\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]*)", new \(string, double\)\[\] \{(.*?)\}, new string\[\] \{(.*?)\}\);', named_src):
    code, base, quality, source, ref, bon, uniq = m.groups()
    if per_src.get(source, 0) >= named_limit:
        continue
    per_src[source] = per_src.get(source, 0) + 1
    key = keyof(code, 'ITEM_')
    named.append({'id': code, 'name': tr(key), 'desc': tr(key + '_DESC', ''), 'base': base, 'quality': quality, 'source': source, 'ref': ref,
                  'bonuses': [[e, float(r)] for e, r in re.findall(r'\("([^"]+)", ([\d.]+)\)', bon)], 'uniques': re.findall(r'"([^"]+)"', uniq)})
named_fx = {}
for fn in sorted(os.listdir(os.path.join(root, 'Items', 'data'))):
    if fn.startswith('named_fx_'):
        for line in read('Items/data/' + fn).splitlines():
            if line.startswith('#') or '|' not in line:
                continue
            code, power, tags, uk, en = line.split('|')[:5]
            named_fx[code] = (float(power), tags.split(','), uk)
by_id = {e['id']: e for e in effects}
for n in named:
    for u in n['uniques']:
        if u in by_id:
            continue
        if u in named_fx:
            p, t, uk = named_fx[u]
            e = {'id': u, 'name': tr(keyof(u, 'EFFECT_'), uk), 'group': 'named', 'kind': 'flag', 'min': 0, 'max': 0, 'power': p, 'use': ['named'], 'classes': None, 'tags': t}
        elif u in named_effects:
            p, t = named_effects[u]
            e = {'id': u, 'name': tr(keyof(u, 'EFFECT_')), 'group': 'named', 'kind': 'flag', 'min': 0, 'max': 0, 'power': p, 'use': ['named'], 'classes': None, 'tags': t}
        else:
            continue
        effects.append(e)
        by_id[u] = e

try:
    commit = subprocess.check_output(['git', '-C', root, 'rev-parse', 'HEAD'], text=True).strip()
    when = subprocess.check_output(['git', '-C', root, 'log', '-1', '--format=%cI'], text=True).strip()
except Exception:
    commit, when = '', ''

data = {
    'meta': {'source': 'foonyresso/GodsDontDie', 'commit': commit, 'commitDate': when,
             'note': 'Згенеровано loot-forge/sync/extract-gdd.py; не редагуй руками.'},
    'slots': slots, 'classes': classes, 'bases': bases, 'qualities': qualities, 'effects': effects,
    'gems': gems, 'gemTiers': gem_tiers, 'gemTierNames': [tr('INSERT_TIER_' + t.upper()) for t in gem_tiers], 'gemStrength': gem_strength,
    'runes': runes, 'runeWeak': rune_weak, 'runeStrength': rune_strength, 'runewords': runewords, 'cards': cards, 'cardSets': card_sets,
    'sets': sets, 'randomSets': random_sets, 'named': named,
}


def dump(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


lines = ['/* Згенеровано loot-forge/sync/extract-gdd.py з foonyresso/GodsDontDie (коміт %s). Не редагуй руками. */' % commit[:10],
         'const GDD_DATA = {']
keys = list(data.keys())
for i, k in enumerate(keys):
    v = data[k]
    comma = ',' if i + 1 < len(keys) else ''
    if isinstance(v, list) and v and isinstance(v[0], dict):
        lines.append('"%s":[' % k)
        lines.append(',\n'.join(dump(x) for x in v))
        lines.append(']' + comma)
    else:
        lines.append('"%s":%s%s' % (k, dump(v), comma))
lines += ['};', "if (typeof module !== 'undefined' && module.exports) module.exports = GDD_DATA;", '']
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('classes', len(classes), 'bases', len(bases), 'qualities', len(qualities), 'effects', len(effects), 'gems', len(gems), 'runes', len(runes),
      'runewords', len(runewords), 'cards', len(cards), 'sets', len(sets), 'named', len(named), '->', out_path, os.path.getsize(out_path), 'bytes')
