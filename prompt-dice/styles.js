/* =====================================================================
   СТИЛІ  (піксель-арт типи мають свої; персонажі/сцени — свої)
   ===================================================================== */
const PIX_STYLES = [
  ['Випадковий', '🎲', ''],
  ['Темне фентезі', '🗡️', 'Style: dark fantasy, muted desaturated colors, heavy shadows, gothic mood.'],
  ['Яскравий мультяшний', '🌈', 'Style: bright cartoon, saturated cheerful colors, chunky rounded shapes, expressive and playful.'],
  ['Sci-fi', '🚀', 'Style: science fiction, clean hard-surface shapes, glowing panel lines, cool metallic tones.'],
  ['Похмурий горор', '💀', 'Style: grim horror, sickly colors, unsettling anatomy, deep blacks, dread atmosphere.'],
  ['Мінімалістичний', '⬜', 'Style: minimalist pixel art, very few colors, simple geometric shapes, no dithering, flat shading.'],
  ['Ретро 8-біт (NES)', '👾', 'Style: retro 8-bit NES-era pixel art, max 4 colors per sprite including transparency, chunky pixels.'],
  ['Ретро 16-біт (SNES)', '🎮', 'Style: retro 16-bit SNES/Mega Drive era pixel art, rich shading ramps, light dithering.'],
  ['Палітра 16 кольорів', '🎨', 'Style: strictly limited 16-color palette, no colors outside it, clean hue-shifted ramps.'],
  ['Game Boy 4 тони', '🟩', 'Style: original Game Boy 4-tone green palette only, no other colors.'],
  ['PICO-8 палітра', '🕹️', 'Style: strictly the PICO-8 16-color palette.'],
  ['1-біт монохром', '⚫', 'Style: 1-bit monochrome pixel art, only black and white, patterns and dithering for shading.'],
  ['Космічний жах', '🐙', 'Style: cosmic eldritch, impossible geometry, starfield textures, deep purples and void blacks.'],
  ['Стімпанк', '⚙️', 'Style: steampunk, brass and copper, rivets, pipes, warm sepia lighting.'],
  ['Біопанк', '🧬', 'Style: biopunk, organic machinery, wet flesh tones mixed with neon biolights.'],
  ['Затишний (cozy)', '🧸', 'Style: cozy pastel pixel art, soft warm light, gentle friendly shapes.'],
  ['Укійо-е', '🌊', 'Style: inspired by ukiyo-e woodblock prints, flat color areas, bold outlines, wave and cloud motifs.'],
  ['Синтвейв', '🌆', 'Style: synthwave/vaporwave, magenta and cyan neon, gradients rendered with dithering.'],
  ['Народна казка', '🪆', 'Style: folk tale illustration, embroidery-like patterns, earthy reds and ochres, hand-made charm.'],
  ['HD піксель-арт', '🔍', 'Style: high-detail modern pixel art, painterly hue-shifted shading, rim light, crisp outlines.'],
].map(([name, icon, text]) => ({ name, icon, text }));

// [назва, іконка, теги SD, опис для Flux/Gemini]
const ART_STYLES = [
  ['Випадковий', '🎲', '', ''],
  ['Гача-арт (splash)', '💠', 'official_art, game_cg, detailed, vibrant_colors', 'high-end mobile gacha game splash art, polished anime illustration with crisp lineart, rich cel-shading with soft gradients, extremely detailed'],
  ['Аніме (cel-shading)', '🎌', 'anime_coloring, cel_shading, sharp_lineart', 'clean anime illustration, cel-shaded with crisp lineart and flat color areas'],
  ['Реалістичне аніме', '🎭', 'semi-realistic, realistic, detailed_skin, soft_shading', 'semi-realistic anime style, realistic proportions and skin rendering, soft painterly shading, detailed anatomy'],
  ['Фотореалізм', '📷', 'photorealistic, realistic, photo_(medium), 8k', 'photorealistic photograph, natural skin texture, realistic materials, shot on a full-frame camera, 85mm lens'],
  ['Мультяшний (cartoon)', '🖍️', 'cartoon, thick_outline, flat_color, bold_colors', 'western cartoon style, thick bold outlines, flat saturated colors, exaggerated shapes'],
  ['Піксель-арт', '👾', 'pixel_art, pixelated, limited_palette, retro_artstyle', 'crisp pixel art, limited color palette, hard pixel edges, no anti-aliasing, clean pixel clusters'],
  ['Манхва / вебтун', '📚', 'sharp_lineart, soft_shading, elegant, detailed_eyes', 'Korean manhwa / webtoon style, elegant sharp lineart, soft glossy shading, refined features'],
  ['Акварель', '💧', 'watercolor_(medium), traditional_media, soft_colors', 'delicate watercolor painting, soft bleeding edges, visible paper texture, translucent washes'],
  ['Олійний живопис', '🖌️', 'oil_painting_(medium), painterly, impasto', 'classical oil painting, visible brush strokes, rich impasto texture, dramatic chiaroscuro'],
  ['Концепт-арт', '🧭', 'concept_art, digital_painting, detailed', 'professional concept art, digital painting, bold shape design, loose painterly edges with detailed focal areas'],
  ['Чорно-біла манга', '⬛', 'monochrome, greyscale, manga, ink_(medium), halftone', 'black and white manga page style, inked linework, screentones and hatching'],
  ['Ретро аніме 90-х', '📼', 'retro_artstyle, 1990s_(style), anime_screencap, film_grain', '1990s retro anime style, hand-painted cel look, slightly grainy film texture, muted vintage colors'],
  ['Темне фентезі', '🌑', 'dark_fantasy, dark, moody, low_saturation', 'dark fantasy illustration, desaturated palette, heavy atmospheric shadows, gritty detail'],
  ['Чібі', '🍡', 'chibi, super_deformed, simple_shading', 'cute chibi super-deformed proportions, big head, small body, simple soft shading'],
  ['Скетч / лайнарт', '✏️', 'lineart, sketch, monochrome', 'clean pencil sketch with confident lineart, minimal shading, visible construction lines'],
  ['Неон / кіберпанк', '🌃', 'neon_palette, glowing, vibrant, high_contrast', 'neon-soaked cyberpunk illustration, glowing edges, saturated magenta and cyan, high contrast'],
  ['Плоский вектор', '🔷', 'flat_color, minimalism, simple_shading', 'flat vector illustration, geometric shapes, limited palette, clean edges, no gradients'],
  ['3D-рендер', '🧊', '3d, cg, smooth_shading', 'stylized 3D render, smooth subsurface shading, soft global illumination, game-engine quality'],
  ['Укійо-е', '🌊', 'ukiyo-e, traditional_media, flat_color', 'ukiyo-e woodblock print style, flat color planes, bold outlines, traditional Japanese patterns'],
  ['Арт-нуво', '🌿', 'art_nouveau, ornate, decorative_border', 'Art Nouveau poster style, flowing organic lines, ornate floral decoration, muted gold and earthy tones'],
].map(([name, icon, sd, nl]) => ({ name, icon, sd, nl }));

