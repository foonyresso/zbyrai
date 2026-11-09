// Перемалювання (inpaint): чиста логіка без DOM — рамка маски, авто-розмір обробки (кратний 64), перетворення маски. Тести: test/inpaint-core.test.js
(function (root) {
  var PAD = 64;

  // Рамка зафарбованого: {x, y, w, h} за RGBA-даними (альфа ≥ 128), або null, якщо маска порожня
  function maskBBox(data, w, h) {
    var x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y++) {
      var row = y * w * 4;
      for (var x = 0; x < w; x++) {
        if (data[row + x * 4 + 3] >= 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
    }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  // Розмір обробки ділянки: довга сторона 1024 (ділянка до 1024), 1344 (до 1344) або 1536 (більша); пропорції ділянки зберігаються, обидві сторони кратні 64
  function inpaintSize(box, imgW, imgH) {
    var rw = Math.min(imgW, box.w + 2 * PAD), rh = Math.min(imgH, box.h + 2 * PAD), big = Math.max(rw, rh);
    var L = big <= 1024 ? 1024 : big <= 1344 ? 1344 : 1536;
    var short = Math.max(512, Math.round(L * Math.min(rw, rh) / big / 64) * 64);
    return rw >= rh ? { w: L, h: short, padding: PAD, region: { w: rw, h: rh } } : { w: short, h: L, padding: PAD, region: { w: rw, h: rh } };
  }

  // Перетворити зафарбований RGBA у чорно-білу маску (білий = перемальовувати), на місці
  function toBinaryMask(data) {
    for (var i = 0; i < data.length; i += 4) { var v = data[i + 3] >= 128 ? 255 : 0; data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255; }
    return data;
  }

  // Зменшення картинки так, щоб довга сторона не перевищувала max (пропорції зберігаються; менші не збільшуються)
  function fitSize(w, h, max) {
    var long = Math.max(w, h); if (long <= max) return { w: Math.round(w), h: Math.round(h), scaled: false };
    var k = max / long; return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)), scaled: true };
  }

  var api = { fitSize: fitSize, PAD: PAD, maskBBox: maskBBox, inpaintSize: inpaintSize, toBinaryMask: toBinaryMask };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDInpaint = api;
})(typeof window !== 'undefined' ? window : globalThis);
