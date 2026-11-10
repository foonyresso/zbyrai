// Аудіо редактор: воркер збирання звуку (щоб інтерфейс не зависав під час розтягування, тону й нормалізації).
// Повідомлення: {type:'source', sr, channels:[Float32Array]} один раз; {type:'render', id, segs, opts} → {type:'done', id, sr, channels, peak} або {type:'progress'|'error'}.
importScripts('dsp-core.js', 'audio-core.js', 'render-core.js');
var SRC = null;
self.onmessage = function (e) {
  var m = e.data;
  if (m.type === 'source') { SRC = { sr: m.sr, channels: m.channels }; return; }
  if (m.type !== 'render') return;
  try {
    if (!SRC) throw new Error('Немає джерела');
    var out = AudioRender.render(SRC, m.segs, m.opts, function (p) { self.postMessage({ type: 'progress', id: m.id, p: p }); });
    self.postMessage({ type: 'done', id: m.id, sr: out.sr, channels: out.channels, peak: out.peak }, out.channels.map(function (c) { return c.buffer; }));
  } catch (err) { self.postMessage({ type: 'error', id: m.id, error: String(err && err.message || err) }); }
};
