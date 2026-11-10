'use strict';
// Інструкції для нейромереж: користувач надсилає їй картинку разом з цим текстом, а вона повертає промпт із Danbooru-тегів у 6 блоках.
// Текст збирається з одного шаблону й меж кількості тегів. Інтерфейс: вкладка «Інструкції ШІ» (кнопка копіює весь текст). Тести: test/ai-prompts.test.js
(function () {
  var BASE = "YOUR OUTPUT IS TEXT ONLY. Never generate, draw, edit or output an image, and never call an image tool. Your only job is to LOOK at the input image and WRITE a very detailed Danbooru tag prompt that an anime image model (trained on Danbooru tags) will use to redraw the same character and scene. Output only the tag blocks: no comments, no \"here is the prompt\", no explanations, no mention of what was unclear.\n\nINPUT: one image (an illustration, artwork, render, screenshot or photo), possibly with a short note. Study it carefully and convert every visible fact into tags: character, hair, eyes, face, body, clothing, accessories, pose, held items, viewpoint, framing, background, effects, lighting and colors. Ignore text in the picture, plot, names and anything that is not visible. Never output character names, series names, artist names, quality tags, year tags, or text/watermark/logo tags.\n\nOUTPUT STRUCTURE (MANDATORY, NEVER MERGE BLOCKS):\n- The output is split into separate blocks in the fixed order below. Each block is ONE line of tags separated by a comma and a space, and ends with a period.\n- Blocks are separated by exactly one blank line. No headings, no labels, no numbers, no bullet points, no extra text anywhere.\n- Never put two blocks on the same line. Never merge blocks, even if the picture is simple. Never reorder blocks. Never add a block that is not listed.\n- Blocks 1, 4, 5 and 6 are always present. Block 2 is omitted only if the character has no visible worn accessories. Block 3 is omitted only if the character is deliberately unclothed or there is no character.\n- The very last character of the whole output is the period at the end of block 6.\n\nBLOCK 1 - CHARACTER: count, special features, hair, eyes, eyebrows, face and makeup, expression, skin, body.\nBLOCK 2 - WORN ACCESSORIES: jewelry, glasses, hair ornaments, chokers, earrings, bracelets. Worn only, never held items.\nBLOCK 3 - CLOTHING: every garment with its parts, colors, materials and decorations, footwear and legwear included.\nBLOCK 4 - POSE, INTERACTIONS, VIEWPOINT, FRAMING: pose, head and gaze, held items and interactions, viewpoint, framing and composition.\nBLOCK 5 - BACKGROUND AND EFFECTS: setting, key scene elements, effects.\nBLOCK 6 - LIGHTING AND COLORS: light direction and quality, shadows, dominant color theme.\n\nQUANTITY (IMPORTANT): the prompt must be DENSE. Total {{LO}}-{{HI}} tags, never fewer than {{LO}} and never more than {{HI}}. Tags per block: block 1: {{B1}}, block 2: {{B2}}, block 3: {{B3}}, block 4: {{B4}}, block 5: {{B5}}, block 6: {{B6}}. Reach these numbers by being more granular, never by repeating tags or adding filler: split every visible feature into its smallest parts, and tag color, shape, length, material and position separately. If a block would fall short because the pose hides things, add the missing quantity to the other visible blocks instead.\n\nFORMAT RULES:\n- Lowercase tags, separated by a comma and a space, spaces inside tags (never underscores).\n- Only real, common Danbooru tags. Never invent tags, never write phrases, sentences, adjectives or praise words (\"beautiful\", \"epic\", \"cinematic\", \"magical\", \"stunning\"). If you are unsure a tag exists, use a simpler, more common tag for the same concept.\n- No weights, no brackets or colons. A tag that contains parentheses on Danbooru is written exactly as on Danbooru, e.g. bow (weapon), arrow (projectile).\n- Do not repeat the same tag anywhere in the output. Tags must never contradict each other (e.g. blunt bangs together with parted bangs, long hair together with short hair, standing together with sitting).\n- For CRITICAL features (bangs, hairstyle, hair color and length, eye color, horns, wings, tails, animal ears, halos, markings, signature accessories) you may add 1-2 closely related but different tags to reinforce them (e.g. blunt bangs, hair over forehead; long hair, hair past hips). Never use two synonyms that mean exactly the same thing, and never use tags that contradict each other (e.g. long hair together with very long hair).\n- Do not write negation tags (\"no forehead\", \"no bangs\"). Express absence by choosing the positive opposite tag. Exception: established Danbooru tags such as no pupils, no humans.\n\n\nCORE RULES:\n- Everything visible in the image is mandatory and must be tagged exactly as drawn (colors, hairstyle, species traits, clothing, items, pose, setting, viewpoint). Never contradict the picture.\n- Where a visible attribute is unclear (cropped, blurred, in shadow), choose the most plausible fitting tag; never invent large elements that are not in the image.\n- Adapt to pose and framing. Do NOT output tags for anything not visible: back view means no face, eye, expression or front-of-clothing tags; bust or upper-body crop means no legs, footwear or legwear tags; hidden or cropped items are not tagged. Never tag body parts outside the frame.\n- Describe the pose, viewpoint and framing of the image exactly as seen.\n- Several characters: tag the main one only (1girl, solo). No character: use only block 4 (framing only), block 5 and block 6, and reach {{NOCHAR}} tags with scene detail.\n- Breast size: for a female or breasted character, if the chest is visible in the chosen framing, always include one size tag (flat chest, small breasts, medium breasts, large breasts, huge breasts). Use the size seen in the image, otherwise choose one that fits.\n- Build: if arms or legs are visible, tag the build exactly as drawn (slender, skinny, tall female or tall male, thin arms, thin legs, muscular, curvy, plump, petite, short...).\n- INTERACTION PRIORITY: every action visible in the image (holding, drawing, aiming, pulling, touching, adjusting, leaning on, sitting on) is mandatory. Tag it in block 4 with real action tags: the action, the item, the contact and the hand or arm position. At most 2 held or interacting items.\n\nBLOCK 1 checklist (tag every item, in this order):\n- count: 1girl or 1boy or 1other, solo.\n- special features first, each with several tags: type (horns, dragon horns, curled horns, demon horns, antlers, wings, angel wings, demon wings, bat wings, feathered wings, tail, fox tail, cat tail, dragon tail, animal ears, cat ears, fox ears, wolf ears, rabbit ears, pointy ears, elf, halo, scales, claws, fangs), color (black horns, white wings), position and count (single horn, asymmetrical horns, multiple tails, mismatched), plus glowing, facial mark, forehead mark, body markings.\n- hair by zones, each zone with several tags: (a) bangs: blunt bangs, long bangs, short bangs, parted bangs, swept bangs, side-swept bangs, hair between eyes, hair over one eye, hair intakes, bangs pinned back, hair over forehead; (b) sidelocks: sidelocks, long sidelocks, braided sidelocks, hair over shoulder, hair behind ear; (c) crown: ahoge, antenna hair, hair flaps, flipped hair; (d) back hair and style: ponytail, high ponytail, low ponytail, side ponytail, twintails, low twintails, braid, twin braids, single braid, french braid, hair bun, double bun, half updo, hime cut, drill hair, hair down, hair over back; (e) length and texture: short hair, medium hair, long hair, very long hair, absurdly long hair, hair past hips, hair past waist, straight hair, wavy hair, curly hair, messy hair, hair strand; (f) color: base color (purple hair), multicolored hair, two-tone hair, gradient hair, streaked hair, colored inner hair, colored tips, colored roots, hair highlights, shiny hair.\n- eyes: color (cyan eyes), second color tag if different, heterochromia if they differ, shape and look (tsurime, tareme, jitome, sanpaku, large eyes, narrow eyes, slit pupils, glowing eyes, ringed eyes, symbol-shaped pupils, empty eyes, eye reflection), eyelashes (long eyelashes, colored eyelashes, thick eyelashes), eyeliner, eyeshadow.\n- eyebrows: thick eyebrows, thin eyebrows, long eyebrows, colored eyebrows, furrowed brow, raised eyebrow, eyebrows hidden by hair.\n- face and makeup: face shape (small face, sharp chin), lips (red lips, pink lips, lipstick, glossy lips, thin lips), makeup, blush, lip gloss, mole under eye, mole, fang, facial mark, freckles.\n- expression: closed mouth, parted lips, smile, light smile, smirk, serious, glaring, expressionless, open mouth, half-closed eyes.\n- ears: ear shape tags (earrings go in block 2).\n- skin: pale skin, dark skin, tan, shiny skin.\n- body (as visible in the frame): slender, tall female, breast size tag, narrow waist, wide hips, thighs, collarbone, bare shoulders, bare arms, thin arms, thin legs, long legs, long fingers, nail polish, black nails, muscular, abs, scar, tattoo, as appropriate.\n\n\nBLOCK 2 checklist: each worn item gets 2-4 tags: type, color, material, decoration, position (e.g. choker, black choker, lace choker, cross necklace, gold cross, pendant, earrings, drop earrings, hair ribbon, hair bow, hairclip, hair flower, headband, tiara, glasses, bracelet, ring, armlet, belt, garter). If the character wears none, omit the block.\n\nBLOCK 3 content (clothing): for every garment tag the type, color, cut, length, sleeves, material and each decoration as separate tags (e.g. black dress, gothic lolita, off-shoulder dress, ruffled collar, frilled collar, puffy sleeves, long sleeves, detached sleeves, corset, black corset, lace-up, lace trim, blue bow, bowtie, pleated skirt, a-line skirt, frilled skirt, miniskirt, ribbon trim, thighhighs, black thighhighs, lace-trimmed legwear, mary janes, black footwear, ankle bow, gloves, cape, hood, armor, pauldrons, belt, buckle, frills, zettai ryouiki). Include footwear and legwear if visible. Tag the clothing exactly as drawn and complete unclear details consistently with the outfit.\n\nBLOCK 4 content (pose, viewpoint, framing; tag everything): body orientation and posture (standing, sitting, kneeling, lying, walking, running, leaning forward, leaning back, arched back, weight on one leg, contrapposto), arms (arms up, arms behind back, arm up, arm down, outstretched arm, crossed arms, hand on hip, hand on own chest, hand up, raised hand), hands (clenched hand, open hand, hand to own mouth), legs (spread legs, crossed legs, legs apart, knees together, one knee up), head and gaze (looking at viewer, looking away, looking back, looking down, looking to the side, looking up, head tilt, head down, chin up), viewpoint (from front, from side, from behind, from above, from below, dutch angle, facing away, facing viewer, three-quarter view), then held items and interactions: the action tag, the item tag and the contact tag (holding weapon, holding bow (weapon), drawing bow, aiming, aiming at viewer, holding arrow, nocked arrow, bowstring, holding sword, holding staff, holding cup, holding umbrella, holding flower, adjusting hair, adjusting clothes, skirt hold, hand on weapon, fingers on string). Held items are tagged here, never in block 2. Then framing and composition exactly as in the image (full body, upper body, cowboy shot, portrait or close-up, centered, wide shot, very wide shot, copy space, negative space).\n\nBLOCK 5 content: tag the background and setting visible in the image in detail: location (indoors, outdoors, cathedral, forest, night sky, ruins, city, field, library, bridge), architecture and structures (stone wall, vaulted ceiling, arch, pillar, stained glass, window, stairs, castle), floor and ground (stone floor, grass, water, snow), objects and nature (tree, moon, candles, banners, flowers, rubble), weather and sky (night, starry sky, clouds, rain, fog), and effects (glowing, light particles, magic circle, falling petals, floating particles, mist, fire, sparks, energy, sparkle). If the background is a plain color or gradient, tag it as it is (simple background, white background, gradient background).\n\nBLOCK 6 content: light direction and quality (backlighting, rim light, side lighting, moonlight, sunlight, light rays, dim lighting, volumetric lighting, ambient light, glow, light from above, dramatic shadow, cast shadow, shadow on face, reflection), light colors (blue light, cyan light, warm light), and 3-5 color theme tags (blue theme, dark, cool colors, high contrast, monochrome accents). Light direction must match the shading on the character.\n\nEXAMPLE OF THE REQUIRED LAYOUT (structure only; your real output must have {{LO}}-{{HI}} tags, do not copy the tags):\n1girl, solo, pointy ears, elf, purple hair, long hair, hair past hips, blunt bangs, hair over forehead, cyan eyes, tsurime, glowing eyes, long eyelashes, pale skin, medium breasts, slender, thin arms, thin legs.\n\nblack choker, lace choker, cross necklace, gold cross.\n\nblack dress, off-shoulder dress, puffy sleeves, corset, black thighhighs, mary janes.\n\nstanding, facing viewer, looking at viewer, from front, holding bow (weapon), drawing bow, holding arrow, nocked arrow, full body, wide shot.\n\ncathedral, stained glass, stone floor, light particles.\n\nrim light, dim lighting, blue theme.\n\nOutput only the final tag blocks. NO image, only text.";
  var VARIANTS = [
  {
    "id": "t50",
    "name": "Опис картинки: 50–60 тегів",
    "note": "Короткий промпт: тільки головне (персонаж, одяг, поза, фон, світло).",
    "lo": 50,
    "hi": 60,
    "b": [
      "18-24",
      "3-6",
      "8-12",
      "8-12",
      "5-8",
      "3-5"
    ],
    "nc": "30-50"
  },
  {
    "id": "t60",
    "name": "Опис картинки: 60–100 тегів",
    "note": "Середній за довжиною промпт: основні деталі без надмірної дрібниці.",
    "lo": 60,
    "hi": 100,
    "b": [
      "22-36",
      "4-8",
      "10-18",
      "12-20",
      "8-14",
      "4-8"
    ],
    "nc": "40-80"
  },
  {
    "id": "t70",
    "name": "Опис картинки: 70–120 тегів",
    "note": "Докладний промпт: добре передає зовнішність, одяг і сцену.",
    "lo": 70,
    "hi": 120,
    "b": [
      "26-42",
      "4-10",
      "12-22",
      "14-26",
      "10-16",
      "5-10"
    ],
    "nc": "50-100"
  },
  {
    "id": "t80",
    "name": "Опис картинки: 80–180 тегів",
    "note": "Найдокладніший: максимум дрібниць у кожному блоці.",
    "lo": 80,
    "hi": 180,
    "b": [
      "30-60",
      "5-14",
      "15-32",
      "18-40",
      "12-26",
      "6-16"
    ],
    "nc": "60-140"
  }
];
  function build(v) {
    var m = { LO: v.lo, HI: v.hi, B1: v.b[0], B2: v.b[1], B3: v.b[2], B4: v.b[3], B5: v.b[4], B6: v.b[5], NOCHAR: v.nc };
    return BASE.replace(/\{\{(\w+)\}\}/g, function (_, k) { return m[k]; });
  }
  var api = { BASE: BASE, VARIANTS: VARIANTS, build: build };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  window.SDAiPrompts = api;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function copy(text, toast) {
    var ok = function () { toast('Інструкцію скопійовано'); }, fail = function () { toast('Не вдалося скопіювати'); };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(ok, fail);
    var ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { fail(); } ta.remove();
  }
  api.init = function (host) {
    var box = document.getElementById('aiList'); if (!box) return; box.textContent = '';
    VARIANTS.forEach(function (v) {
      var c = el('div', 'aicard'), t = el('div', 'ait'); t.appendChild(el('b', null, v.name)); t.appendChild(el('span', 'hint', v.note)); c.appendChild(t);
      var b = el('button', 'btn-main', '⧉ Копіювати інструкцію'); b.type = 'button'; b.title = 'Скопіювати весь текст інструкції'; b.addEventListener('click', function () { copy(build(v), host.toast); }); c.appendChild(b); box.appendChild(c);
    });
  };
})();
