// Дані для сторінки «Шрифти» (fonts.html): автор, джерело, ліцензія, варіанти. Шрифти лежать локально (fonts/fonts.css).
// Автори — за каталогом Google Fonts (потрібна вибіркова перевірка). Вільні: OFL-1.1, Apache-2.0, UFL-1.0.
(function (root) {
  var GF = function (n) { return 'https://fonts.google.com/specimen/' + n.replace(/ /g, '+'); };
  var OFL = 'OFL-1.1', LIC = {
    'OFL-1.1': { name: 'SIL Open Font License 1.1', url: 'https://openfontlicense.org/', free: true },
    'Apache-2.0': { name: 'Apache License 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0', free: true },
    'UFL-1.0': { name: 'Ubuntu Font Licence 1.0', url: 'https://ubuntu.com/legal/font-licence', free: true },
    'proprietary': { name: 'Власницька (Microsoft), не вільна', url: '', free: false },
    'unknown': { name: 'Невідома, не вільна', url: '', free: false }
  };
  // [назва сімейства, автор(и), група, ліцензія, варіанти: [[підпис, css-сімейство, вага, стиль]] ]
  function v(fam, ws) { return ws.map(function (w) { return [w[0], fam, w[1], w[2] || 'normal']; }); }
  var R = [['Звичайний', 400]], RB = [['Звичайний', 400], ['Жирний', 700]];
  var S = 'Класичні із засічками', G = 'Гротески без засічок', D = 'Заголовкові й декоративні', H = 'Рукописні й каліграфічні', K = 'Дитячі й ігрові';
  var F = [
    ['Playfair Display', 'Claus Eggers Sørensen', S, OFL, v('Playfair Display', [['Звичайний', 400], ['Курсив', 400, 'italic'], ['Жирний', 700], ['Чорний', 900]])],
    ['Lora', 'Cyreal', S, OFL, v('Lora', RB)],
    ['PT Serif', 'ParaType (О. Корольова, О. Умпелєва, В. Єфімов)', S, OFL, v('PT Serif', RB)],
    ['Cormorant Garamond', 'Christian Thalmann (Catharsis Fonts)', S, OFL, v('Cormorant Garamond', [['Тонкий', 300], ['Звичайний', 400], ['Курсив', 400, 'italic'], ['Середній', 500], ['Жирний', 700]])],
    ['Merriweather', 'Eben Sorkin', S, OFL, v('Merriweather', RB)],
    ['EB Garamond', 'Georg Duffner, Octavio Pardo', S, OFL, v('EB Garamond', RB)],
    ['Old Standard TT', 'Alexey Kryukov', S, OFL, v('Old Standard TT', RB)],
    ['Source Serif 4', 'Frank Grießhammer (Adobe)', S, OFL, v('Source Serif 4', RB)],
    ['Literata', 'TypeTogether', S, OFL, v('Literata', RB)],
    ['Spectral', 'Production Type', S, OFL, v('Spectral', RB)],
    ['Vollkorn', 'Friedrich Althausen', S, OFL, v('Vollkorn', RB)],
    ['Alegreya', 'Juan Pablo del Peral (Huerta Tipográfica)', S, OFL, v('Alegreya', RB)],
    ['Bitter', 'Sol Matas (Huerta Tipográfica)', S, OFL, v('Bitter', RB)],
    ['Roboto Slab', 'Christian Robertson', S, 'Apache-2.0', v('Roboto Slab', RB)],
    ['Podkova', 'Сергій Ткаченко (Ukrainian Type)', S, OFL, v('Podkova', RB)],
    ['Oranienbaum', 'Oleg Pospelov', S, OFL, v('Oranienbaum', R)],
    ['Forum', 'Денис Машаров', S, OFL, v('Forum', R)],
    ['Prata', 'Cyreal', S, OFL, v('Prata', R)],
    ['PT Sans', 'ParaType (О. Корольова, О. Умпелєва, В. Єфімов)', G, OFL, v('PT Sans', RB)],
    ['Montserrat', 'Julieta Ulanovsky та ін.', G, OFL, v('Montserrat', RB).concat(v('Montserrat Alternates', [['Alternates', 400], ['Alternates жирний', 700]]))],
    ['Raleway', 'Matt McInerney, Pablo Impallari, Rodrigo Fuenzalida', G, OFL, v('Raleway', RB)],
    ['Roboto', 'Christian Robertson', G, OFL, v('Roboto', RB)],
    ['Open Sans', 'Steve Matteson', G, OFL, v('Open Sans', RB)],
    ['Noto Sans', 'Google', G, OFL, v('Noto Sans', RB)],
    ['Ubuntu', 'Dalton Maag', G, 'UFL-1.0', v('Ubuntu', RB), 'https://design.ubuntu.com/font'],
    ['Exo 2', 'Natanael Gama', G, OFL, v('Exo 2', RB)],
    ['Fira Sans', 'Erik Spiekermann, Carrois Apparel', G, OFL, v('Fira Sans', RB)],
    ['Rubik', 'Hubert & Fischer, Meir Sadan', G, OFL, v('Rubik', RB).concat(v('Rubik Mono One', [['Mono One', 400]]), v('Rubik Bubbles', [['Bubbles', 400]]))],
    ['Nunito', 'Vernon Adams, Jacques Le Bailly', G, OFL, v('Nunito', RB)],
    ['Manrope', 'Михайло Шаранда', G, OFL, v('Manrope', RB)],
    ['Jura', 'Ek Type (Naipol)', G, OFL, v('Jura', RB)],
    ['Didact Gothic', 'Daniel Johnson та ін.', G, OFL, v('Didact Gothic', R)],
    ['Cuprum', 'Jovanny Lemonad', G, OFL, v('Cuprum', RB)],
    ['Play', 'Jonas Hecksher', G, OFL, v('Play', RB)],
    ['Tenor Sans', 'Vernon Adams', G, OFL, v('Tenor Sans', R)],
    ['Bahnschrift', 'Aaron Bell (Microsoft)', G, 'proprietary', v('Bahnschrift', [['Світлий', 300], ['Звичайний', 400], ['Жирний', 700]]), '', 'Файл із Windows 10+, розповсюджувати його не можна. Лише для довідки, замінити (напр. Sofia Sans).'],
    ['Oswald', 'Vernon Adams, Kalapi Gajjar, Cyreal', D, OFL, v('Oswald', RB)],
    ['Russo One', 'Jovanny Lemonad', D, OFL, v('Russo One', R)],
    ['Ruslan Display', 'Павло Ємельянов', D, OFL, v('Ruslan Display', R)],
    ['Philosopher', 'Jovanny Lemonad', D, OFL, v('Philosopher', RB)],
    ['Yeseva One', 'Jovanny Lemonad', D, OFL, v('Yeseva One', R)],
    ['Stalinist One', 'Денис Машаров', D, OFL, v('Stalinist One', R)],
    ['Poiret One', 'Денис Машаров', D, OFL, v('Poiret One', R)],
    ['Advent Pro', 'Vernon Adams', D, OFL, v('Advent Pro', RB)],
    ['Kelly Slab', 'Денис Машаров', D, OFL, v('Kelly Slab', R)],
    ['Tektur', 'Ek Type', D, OFL, v('Tektur', RB)],
    ['Unbounded', 'Nicole Fally', D, OFL, v('Unbounded', RB)],
    ['Yanone Kaffeesatz', 'Yanone', D, OFL, v('Yanone Kaffeesatz', RB)],
    ['Kurale', 'Eduardo Tunni', D, OFL, v('Kurale', R)],
    ['Sofia Sans Extra Condensed', 'Олекса Волочай', D, OFL, v('Sofia Sans Extra Condensed', [['Напівжирний', 600], ['Екстражирний', 800]])],
    ['Caveat', 'Impallari Type', H, OFL, v('Caveat', RB)],
    ['Marck Script', 'Денис Машаров', H, OFL, v('Marck Script', R)],
    ['Pacifico', 'Vernon Adams, Jacques Le Bailly, Botjo Nikoltchev, Ani Petrova', H, OFL, v('Pacifico', R)],
    ['Bad Script', 'Gaslight', H, OFL, v('Bad Script', R)],
    ['Lobster', 'Impallari Type', H, OFL, v('Lobster', R)],
    ['Comforter', 'Robert Leuschke', H, OFL, v('Comforter', [['Звичайний', 400]]).concat(v('Comforter Brush', [['Brush', 400]]))],
    ['Great Vibes', 'Robert Leuschke', H, OFL, v('Great Vibes', R)],
    ['Comfortaa', 'Johan Aakerlund', K, OFL, v('Comfortaa', RB)],
    ['Underdog', 'Сергій Ткаченко (Ukrainian Type)', K, OFL, v('Underdog', R)],
    ['Pangolin', 'Hector Gatti (Omnibus-Type)', K, OFL, v('Pangolin', R)],
    ['Amatic SC', 'Vernon Adams, Ani Petrova', K, OFL, v('Amatic SC', RB)],
    ['Playpen Sans', 'Tjarda Koster, Jelle Bosma (Typearture)', K, OFL, v('Playpen Sans', RB)],
    ['Neucha', 'Jovanny Lemonad', K, OFL, v('Neucha', R)],
    ['Marmelad', 'Сергій Ткаченко (Ukrainian Type)', K, OFL, v('Marmelad', R)],
    ['Pudelinka', 'Gophmann A.L. (2007)', K, 'unknown', v('Pudelinka', R), '', 'Походження й ліцензія файлу невідомі («All rights reserved»). Замінити (Underdog, Marmelad, Pangolin).']
  ];
  var FAMILIES = F.map(function (f) {
    var lic = LIC[f[3]];
    return { id: f[0], name: f[0], author: f[1], group: f[2], license: f[3], licenseName: lic.name, licenseUrl: lic.url, free: lic.free,
      source: f[5] || GF(f[0]), note: f[6] || '', variants: f[4].map(function (x) { return { label: x[0], family: x[1], weight: x[2], style: x[3] }; }) };
  });
  var api = { FAMILIES: FAMILIES, LICENSES: LIC, GROUPS: [S, G, D, H, K] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FontsMeta = api;
})(typeof self !== 'undefined' ? self : this);
