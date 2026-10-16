// Манекен: геометрія двох видів (тіло, обличчя), реєстр ділянок і груп.
// Векторна фігура, намальована за власною сіткою. Ділянка = id, підпис, вид, група, контури (path) із можливим дзеркальним відбиттям.
const MK_VIEWS = {
  body: { box: '0 0 300 530' },
  head: { box: '0 0 300 350' },
};
// Конус між двома колами (кінцівка, що звужується): центри (x1,y1) r1 → (x2,y2) r2
function mkCap(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  const phi = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / L)));
  const P = (x, y, r, t) => [(x + r * Math.cos(t)).toFixed(1), (y + r * Math.sin(t)).toFixed(1)].join(' ');
  const far = 2 * phi > Math.PI ? 1 : 0, near = 2 * Math.PI - 2 * phi > Math.PI ? 1 : 0;
  return `M${P(x1, y1, r1, a - phi)} L${P(x2, y2, r2, a - phi)} A${r2} ${r2} 0 ${far} 1 ${P(x2, y2, r2, a + phi)} L${P(x1, y1, r1, a + phi)} A${r1} ${r1} 0 ${near} 1 ${P(x1, y1, r1, a - phi)}Z`;
}
const mkCircle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const mkEllipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

// Ділянки. mirror: true = малюється ще й дзеркально відносно осі x=150 (ліва/права). sort: порядок малювання (менше = глибше).
// jump: клік у цьому виді перемикає на інший вид. Один і той самий id може бути в обох видах (шия, волосся, обличчя).
const MK_ZONES = [
  /* ---------- вид «Тіло» ---------- */
  { id: 'toes', label: 'Пальці ніг', view: 'body', group: 'leg', mirror: true, sort: 1, d: [mkEllipse(115, 510, 13, 6)] },
  { id: 'foot', label: 'Стопа', view: 'body', group: 'leg', mirror: true, sort: 1, d: [mkCap(121, 467, 9, 117, 497, 12)] },
  { id: 'ankle', label: 'Щиколотка', view: 'body', group: 'leg', mirror: true, sort: 2, d: [mkCircle(122, 457, 9)] },
  { id: 'shin', label: 'Гомілка', view: 'body', group: 'leg', mirror: true, sort: 1, d: [mkCap(126, 368, 13.5, 122, 450, 9)] },
  { id: 'knee', label: 'Коліно', view: 'body', group: 'leg', mirror: true, sort: 2, d: [mkCircle(126, 355, 15.5)] },
  { id: 'thigh', label: 'Стегно', view: 'body', group: 'leg', mirror: true, sort: 1, d: [mkCap(132, 262, 21, 126, 344, 15)] },
  { id: 'fingers', label: 'Пальці рук', view: 'body', group: 'arm', mirror: true, sort: 1, d: [mkCap(68, 300, 8, 63, 325, 4.5)] },
  { id: 'hand', label: 'Кисть', view: 'body', group: 'arm', mirror: true, sort: 1, d: [mkCap(73, 276, 10, 69, 296, 8.5)] },
  { id: 'wrist', label: 'Зап’ястя', view: 'body', group: 'arm', mirror: true, sort: 2, d: [mkCircle(75, 266, 8.5)] },
  { id: 'forearm', label: 'Передпліччя', view: 'body', group: 'arm', mirror: true, sort: 1, d: [mkCap(88, 207, 11.5, 76, 262, 8.5)] },
  { id: 'elbow', label: 'Лікоть', view: 'body', group: 'arm', mirror: true, sort: 2, d: [mkCircle(88, 200, 12.5)] },
  { id: 'upperarm', label: 'Плече (біцепс)', view: 'body', group: 'arm', mirror: true, sort: 1, d: [mkCap(102, 134, 14.5, 88, 192, 11.5)] },
  { id: 'shoulders', label: 'Плечі', view: 'body', group: 'arm', mirror: true, sort: 2, d: [mkEllipse(108, 120, 20, 16)] },
  { id: 'pelvis', label: 'Таз і стегна', view: 'body', group: 'torso', sort: 3, d: ['M121 218H179Q193 228 193 252Q185 272 150 278Q115 272 107 252Q107 228 121 218Z'] },
  { id: 'waist', label: 'Талія', view: 'body', group: 'torso', sort: 3, d: ['M118 198H182L179 217H121Z'] },
  { id: 'belly', label: 'Живіт', view: 'body', group: 'torso', sort: 3, d: ['M116 164H184L182 197H118Z'] },
  { id: 'chest', label: 'Груди', view: 'body', group: 'torso', sort: 3, d: ['M113 108Q150 98 187 108L190 150Q189 163 177 164H123Q111 163 110 150Z'] },
  { id: 'neck', label: 'Шия', view: 'body', group: 'head', sort: 3, d: [mkCap(150, 84, 11, 150, 104, 13)] },
  { id: 'hair', label: 'Волосся', view: 'body', group: 'head', sort: 5, d: ['M122 58Q118 16 150 17Q182 16 178 58Q172 36 150 34Q128 36 122 58Z', 'M120 56Q116 80 124 96Q119 74 124 58Z', 'M180 56Q184 80 176 96Q181 74 176 58Z'] },
  { id: 'face', label: 'Обличчя', view: 'body', group: 'head', sort: 4, jump: 'head', d: [mkEllipse(150, 56, 27, 33)] },
  /* ---------- вид «Обличчя» ---------- */
  { id: 'neck', label: 'Шия', view: 'head', group: 'head', sort: 1, d: ['M127 258Q150 272 173 258L180 338H120Z'] },
  { id: 'hair', label: 'Волосся', view: 'head', group: 'head', sort: 2, d: ['M62 176Q48 40 150 26Q252 40 238 176Q238 252 212 296L88 296Q62 252 62 176Z'] },
  { id: 'ears', label: 'Вуха', view: 'head', group: 'head', mirror: true, sort: 3, d: [mkEllipse(91, 162, 9, 18)] },
  { id: 'face', label: 'Обличчя', view: 'head', group: 'head', sort: 4, d: ['M97 112Q97 62 150 62Q203 62 203 112V172Q203 234 150 266Q97 234 97 172Z'] },
  { id: 'jaw', label: 'Щелепа', view: 'head', group: 'head', mirror: true, sort: 5, d: ['M99 182Q103 228 130 252L137 242Q113 222 111 182Z'] },
  { id: 'cheeks', label: 'Щоки', view: 'head', group: 'head', mirror: true, sort: 5, d: [mkEllipse(114, 191, 14, 16)] },
  { id: 'forehead', label: 'Лоб', view: 'head', group: 'head', sort: 5, d: ['M106 98Q150 82 194 98L196 123Q150 111 104 123Z'] },
  { id: 'brows', label: 'Брови', view: 'head', group: 'head', mirror: true, sort: 6, d: ['M109 136Q127 124 145 133V141Q127 133 109 144Z'] },
  { id: 'eyes', label: 'Очі', view: 'head', group: 'head', mirror: true, sort: 6, d: [mkEllipse(127, 154, 18, 9.5)] },
  { id: 'nose', label: 'Ніс', view: 'head', group: 'head', sort: 6, d: ['M146 158L141 192Q150 200 159 192L154 158Z'] },
  { id: 'mouth', label: 'Рот і губи', view: 'head', group: 'head', sort: 6, d: [mkEllipse(150, 222, 21, 9)] },
  { id: 'chin', label: 'Підборіддя', view: 'head', group: 'head', sort: 6, d: ['M127 243Q150 256 173 243Q150 266 127 243Z'] },
  { id: 'fringe', label: 'Чубчик', view: 'head', group: 'head', sort: 7, d: ['M93 134Q88 50 150 44Q212 50 207 134Q196 94 150 90Q104 94 93 134Z'] },
  { id: 'hat', label: 'Головний убір і прикраси', view: 'head', group: 'head', sort: 8, d: ['M92 46Q150 -12 208 46L208 56Q150 4 92 56Z'] },
];
// Групи: цілі кінцівки й блоки. Клік у режимі «Цілі частини» вибирає групу.
const MK_GROUPS = [
  { id: 'body', label: 'Тіло загалом', parts: ['arm', 'torso', 'leg', 'head'] },
  { id: 'head', label: 'Голова', parts: ['hat', 'hair', 'fringe', 'forehead', 'brows', 'eyes', 'nose', 'cheeks', 'ears', 'mouth', 'chin', 'jaw', 'face', 'neck'] },
  { id: 'arm', label: 'Руки (цілі)', parts: ['shoulders', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand', 'fingers'] },
  { id: 'torso', label: 'Торс (цілий)', parts: ['chest', 'belly', 'waist', 'pelvis'] },
  { id: 'leg', label: 'Ноги (цілі)', parts: ['thigh', 'knee', 'shin', 'ankle', 'foot', 'toes'] },
];
// Англійські назви ділянок для Flux/Gemini та українські назви груп у вкладках
const MK_PART_EN = {
  body: 'Whole body', torso: 'Torso', chest: 'Chest', belly: 'Stomach', waist: 'Waist', pelvis: 'Hips and pelvis', neck: 'Neck', shoulders: 'Shoulders', upperarm: 'Upper arms', elbow: 'Elbows',
  forearm: 'Forearms', wrist: 'Wrists', hand: 'Hands', fingers: 'Fingers', arm: 'Arms', leg: 'Legs', thigh: 'Thighs', knee: 'Knees', shin: 'Lower legs', ankle: 'Ankles', foot: 'Feet', toes: 'Toes',
  head: 'Head', hair: 'Hair', fringe: 'Bangs', forehead: 'Forehead', brows: 'Eyebrows', eyes: 'Eyes', nose: 'Nose', cheeks: 'Cheeks', ears: 'Ears', mouth: 'Mouth and lips', chin: 'Chin', jaw: 'Jaw',
  face: 'Face', hat: 'Headwear', pose: 'Pose', bg: 'Background', frame: 'Camera frame', free: 'Extra details',
};
const MK_PART_UA = {
  body: 'Тіло загалом', torso: 'Торс', chest: 'Груди', belly: 'Живіт', waist: 'Талія', pelvis: 'Таз і стегна', neck: 'Шия', shoulders: 'Плечі', upperarm: 'Плече (біцепс)', elbow: 'Лікоть',
  forearm: 'Передпліччя', wrist: 'Зап’ястя', hand: 'Кисть', fingers: 'Пальці рук', arm: 'Руки', leg: 'Ноги', thigh: 'Стегно', knee: 'Коліно', shin: 'Гомілка', ankle: 'Щиколотка', foot: 'Стопа', toes: 'Пальці ніг',
  head: 'Голова', hair: 'Волосся', fringe: 'Чубчик', forehead: 'Лоб', brows: 'Брови', eyes: 'Очі', nose: 'Ніс', cheeks: 'Щоки', ears: 'Вуха', mouth: 'Рот і губи', chin: 'Підборіддя', jaw: 'Щелепа',
  face: 'Обличчя', hat: 'Головний убір', pose: 'Пози (розширено)', bg: 'Фони (розширено)', frame: 'Кадр (розширено)',
};
