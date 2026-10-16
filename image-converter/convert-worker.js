// Конвертер зображень: Web Worker. Отримує файл і завдання, декодує, малює кадр, кодує й повертає Blob.
importScripts('./convert-render.js');
self.onmessage = async function (e) {
  var m = e.data, bmp = null;
  try {
    bmp = await ConvertRender.decode(m.file);
    var r = await ConvertRender.render(bmp, m.job, function (w, h) { return new OffscreenCanvas(w, h); });
    self.postMessage({ id: m.id, blob: r.blob, over: r.over, w: r.w, h: r.h });
  } catch (err) {
    self.postMessage({ id: m.id, error: String(err && err.message || err) });
  } finally { if (bmp && bmp.close) bmp.close(); }
};
