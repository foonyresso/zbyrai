// Атлас 2.0: воркер генерації. Що тут: той самий конвеєр A.generateAsync у фоновому потоці, щоб камера й інтерфейс не завмирали, поки створюється материк; растр рельєфу теж рахується тут. Працює лише за http(s) (з file:// воркери заборонені, тоді ui/genclient.js рахує в основному потоці). Протокол: {id, params} → {id, f, l} (хід) і {id, W} або {id, error}; {cancel: id} скасовує.
'use strict';
const V = (self.location.search.match(/v=([^&]*)/) || [])[1] || '';
const CORE = ['rng', 'noise', 'heap', 'grid', 'params', 'terrain', 'hydrology', 'climate', 'astrakor', 'biomedata', 'subbiomes', 'names', 'settle', 'grow', 'politics', 'islands', 'settlements', 'astrawall', 'roads', 'roadgraph', 'landmarks', 'searoutes', 'seas', 'bestiary', 'monorder', 'danger', 'needs', 'resdata', 'resources', 'resassign', 'resroads', 'generate'];
importScripts.apply(self, CORE.map(f => f + '.js?v=' + V).concat(['../render/raster.js?v=' + V]));
const A = self.Atlas2, cancelled = new Set();
self.onmessage = async e => {
  const m = e.data; if (m.cancel != null) { cancelled.add(m.cancel); return; }
  const id = m.id;
  try {
    const W = await A.generateAsync(m.params, (f, l) => cancelled.has(id) ? false : (self.postMessage({ id, f, l }), true));
    if (!W) { self.postMessage({ id, W: null }); return; }
    W.img = A.Raster.build(W, W.params.infinite ? 3 : 4, (a, b) => ({ data: new Uint8ClampedArray(a * b * 4), width: a, height: b })); // растр для малювання
    const bufs = new Set(); for (const k in W) { const v = W[k]; if (ArrayBuffer.isView(v)) bufs.add(v.buffer); }
    bufs.add(W.img.ocean.data.buffer); bufs.add(W.img.land.data.buffer);
    self.postMessage({ id, W }, Array.from(bufs)); // великі масиви передаються без копіювання
  } catch (err) { self.postMessage({ id, error: String((err && err.stack) || err) }); }
};
