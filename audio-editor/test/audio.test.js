// Тести логіки аудіо редактора: монтаж, DSP, збирання, WAV, формати. Запуск: node audio-editor/test/audio.test.js
const assert = require('node:assert');
const D = require('../dsp-core.js'), A = require('../audio-core.js'), R = require('../render-core.js'), W = require('../wav-core.js'), E = require('../encode-core.js'), P = require('../peaks-core.js'), S = require('../sniff-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.stack.split('\n').slice(0, 3).join('\n       ')); } };
const sr = 22050;
const sine = (f, sec, amp = 0.5) => { const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) x[i] = amp * Math.sin(2 * Math.PI * f * i / sr); return x; };
// частота за кількістю переходів через нуль
const freq = (x) => { let z = 0; for (let i = 1; i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) z++; return z / (x.length / sr); };
const rms = (x) => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);
const near = (a, b, tol, m) => assert.ok(Math.abs(a - b) <= tol, (m || '') + ` ${a} ≉ ${b} (±${tol})`);

test('монтаж: розріз, видалення, обрізка', () => {
  let s = A.newProject(10);
  A.cut(s, 4); assert.equal(s.length, 2); near(s[0].b, 4, 1e-9); near(s[1].a, 4, 1e-9);
  A.removeRange(s, 2, 6); near(A.total(s), 6, 1e-9); assert.equal(s.length, 2);
  near(s[0].b, 2, 1e-9); near(s[1].a, 6, 1e-9);
  A.cropTo(s, 1, 5); near(A.total(s), 4, 1e-9);
  s = A.newProject(10); assert.equal(A.cut(s, 0.001), 0); assert.equal(A.cut(s, 9.999), 1); assert.equal(s.length, 1);
});
test('монтаж: розріз у фрагменті зі швидкістю 2', () => {
  const s = [A.newSeg(0, 10, { speed: 2 })]; // триває 5 с
  near(A.total(s), 5, 1e-9); A.cut(s, 2); near(s[0].b, 4, 1e-9); near(s[1].a, 4, 1e-9); near(A.total(s), 5, 1e-9);
});
test('монтаж: isolate дає правильні індекси й властивості', () => {
  const s = A.newProject(10), r = A.isolate(s, 3, 7); assert.deepEqual(r, [1, 2]); assert.equal(s.length, 3);
  A.setProps(s, r[0], r[1], { gain: -6 }); assert.equal(s[1].gain, -6); assert.equal(s[0].gain, 0);
});
test('час: форматування й розбір', () => {
  assert.equal(A.fmtTime(83.456), '1:23.46'); assert.equal(A.fmtTime(5), '0:05.00');
  near(A.parseTime('1:23.5'), 83.5, 1e-9); near(A.parseTime('7,25'), 7.25, 1e-9); assert.ok(isNaN(A.parseTime('abc')));
});
test('ресемплінг: тривалість і тон', () => {
  const x = sine(440, 1), y = D.resample(x, 2); near(y.length, x.length / 2, 1); near(freq(y), 880, 15);
  const z = D.resample(x, 0.5); near(z.length, x.length * 2, 1); near(freq(z), 220, 8);
});
test('розтягування: довжина змінюється, тон ні, гучність зберігається', () => {
  const x = sine(300, 1.5);
  for (const f of [0.5, 0.8, 1.25, 2]) {
    const y = D.stretch([x], f, sr)[0];
    near(y.length, x.length * f, 2, 'довжина ×' + f); near(freq(y), 300, 12, 'тон ×' + f); near(rms(y), rms(x), 0.04, 'rms ×' + f);
  }
});
test('розтягування: стерео зберігає лад каналів', () => {
  const l = sine(200, 1), r = sine(200, 1, 0.25), o = D.stretch([l, r], 1.5, sr);
  near(rms(o[0]) / rms(o[1]), 2, 0.1);
});
test('збирання: гучність ділянки, фейди, загальна гучність', () => {
  const src = { sr, channels: [sine(220, 4, 0.5)] }, s = A.newProject(4);
  const r = A.isolate(s, 1, 2); A.setProps(s, r[0], r[1], { gain: -6.0206 });
  const out = R.render(src, s, { gainDb: 0 }), x = out.channels[0];
  assert.equal(x.length, src.channels[0].length);
  near(D.peakOf([x.subarray(sr * 1.2 | 0, sr * 1.8 | 0)]), 0.25, 0.01); near(D.peakOf([x.subarray(sr * 2.3 | 0, sr * 3.5 | 0)]), 0.5, 0.01);
  const f = R.render(src, A.newProject(4), { fadeIn: 1, fadeOut: 1 }).channels[0];
  assert.ok(Math.abs(f[10]) < 0.01 && Math.abs(f[f.length - 10]) < 0.01); near(D.peakOf([f.subarray(sr * 1.5 | 0, sr * 2.5 | 0)]), 0.5, 0.01);
  near(D.peakOf(R.render(src, A.newProject(4), { gainDb: 6.0206 }).channels), 1, 0.01);
});
test('збирання: нормалізація до піку', () => {
  const src = { sr, channels: [sine(220, 1, 0.1), sine(220, 1, 0.05)] };
  const o = R.render(src, A.newProject(1), { normalize: { on: true, peakDb: -1 } });
  near(o.peak, D.dbToGain(-1), 0.005); near(D.peakOf([o.channels[1]]) / D.peakOf([o.channels[0]]), 0.5, 0.01);
});
test('збирання: видалена ділянка зменшує тривалість; швидкість 2 вдвічі коротша', () => {
  const src = { sr, channels: [sine(220, 6)] }, s = A.newProject(6);
  A.removeRange(s, 1, 3); near(R.render(src, s, {}).duration, 4, 0.01);
  const s2 = A.newProject(6); s2[0].speed = 2; near(R.render(src, s2, {}).duration, 3, 0.01);
  const s3 = A.newProject(6); s3[0].tape = true; s3[0].speed = 2; const o3 = R.render(src, s3, {}); near(o3.duration, 3, 0.01); near(freq(o3.channels[0]), 440, 12);
});
test('збирання: тон +12 півтонів подвоює частоту без зміни тривалості', () => {
  const src = { sr, channels: [sine(220, 2)] }, s = A.newProject(2); s[0].pitch = 12;
  const o = R.render(src, s, {}); near(o.duration, 2, 0.02); near(freq(o.channels[0]), 440, 15);
});
test('збирання: канали й частота', () => {
  const src = { sr, channels: [sine(220, 1), sine(330, 1)] };
  assert.equal(R.render(src, A.newProject(1), { channels: 1 }).channels.length, 1);
  const o = R.render({ sr, channels: [sine(220, 1)] }, A.newProject(1), { channels: 2, rate: 11025 });
  assert.equal(o.channels.length, 2); assert.equal(o.sr, 11025); near(o.channels[0].length, 11025, 2);
});
test('WAV: заголовок і дані', () => {
  const b = W.encodeWav([Float32Array.from([0, 1, -1, 0.5])], 8000, 16), v = new DataView(b.buffer);
  assert.equal(String.fromCharCode(...b.slice(0, 4)), 'RIFF'); assert.equal(v.getUint32(24, true), 8000); assert.equal(v.getUint16(34, true), 16);
  assert.equal(v.getUint32(40, true), 8); assert.equal(v.getInt16(46, true), 32767); assert.equal(v.getInt16(48, true), -32768);
  assert.equal(W.encodeWav([new Float32Array(3), new Float32Array(3)], 44100, 24).length, 44 + 3 * 2 * 3);
  assert.equal(new DataView(W.encodeWav([new Float32Array(1)], 44100, 32).buffer).getUint16(20, true), 3);
});
test('формати: бітрейт і частота обмежуються правилами MP3', () => {
  assert.equal(E.sanitize({ fmt: 'mp3', kbps: 320, rate: 8000 }, 44100).kbps, 64);
  assert.equal(E.sanitize({ fmt: 'mp3', kbps: 320, rate: 22050 }, 44100).kbps, 160);
  assert.equal(E.sanitize({ fmt: 'mp3', kbps: 128, rate: 0 }, 96000).rate, 48000);
  assert.equal(E.sanitize({ fmt: 'wav', bits: 24, rate: 0 }, 96000).rate, 96000);
  assert.equal(E.sanitize({ fmt: 'xxx' }, 44100).fmt, 'mp3');
  assert.equal(E.sanitize({ fmt: 'flac', bits: 32 }, 44100).bits, 16);
});
test('формати: аргументи ffmpeg, імена, оцінка', () => {
  assert.deepEqual(E.buildArgs({ fmt: 'mp3', kbps: 192 }, 'i.wav', 'o.mp3').slice(-5), ['-c:a', 'libmp3lame', '-b:a', '192k', 'o.mp3']);
  assert.deepEqual(E.buildArgs({ fmt: 'ogg', kbps: 128 }, 'i.wav', 'o.ogg').slice(-3), ['-q:a', '4', 'o.ogg']);
  assert.ok(E.buildArgs({ fmt: 'flac', bits: 24 }, 'i.wav', 'o.flac').includes('s32'));
  assert.ok(E.buildArgs({ fmt: 'm4a', kbps: 128 }, 'i.wav', 'o.m4a').includes('+faststart'));
  assert.equal(E.fileName('пісня.final.mp3', 'ogg'), 'пісня.final-edit.ogg'); assert.equal(E.fileName('a/b:c.wav', 'wav'), 'a_b_c-edit.wav');
  near(E.estimateBytes({ fmt: 'mp3', kbps: 128 }, 10), 160000, 1);
});
test('піки: мінімум і максимум', () => {
  const x = new Float32Array(1000); x[300] = 0.7; x[301] = -0.4; const p = P.build([x]), o = [0, 0];
  P.range(p, 256, 512, o); near(o[1], 0.7, 1e-6); near(o[0], -0.4, 1e-6); P.range(p, 600, 700, o); assert.equal(o[1], 0);
});
test('частота файлу: WAV, FLAC, MP3, OGG', () => {
  assert.equal(S.sampleRate(W.encodeWav([new Float32Array(10)], 32000, 16)), 32000);
  const fl = new Uint8Array(64); fl.set([0x66, 0x4C, 0x61, 0x43]); fl[18] = 0x0A; fl[19] = 0xC4; fl[20] = 0x42; assert.equal(S.sampleRate(fl), 44100);
  const mp = new Uint8Array(64); mp.set([0xFF, 0xFB, 0x90, 0x00], 5); assert.equal(S.sampleRate(mp), 44100); // 128 кбіт/с, 44100: кадр 417 байтів
  const mpr = new Uint8Array(1200); mpr.set([0xFF, 0xFB, 0x90, 0x00], 5); mpr.set([0xFF, 0xFB, 0x90, 0x00], 5 + 417); assert.equal(S.sampleRate(mpr), 44100);
  const mp4 = new Uint8Array(1200); mp4.set([0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70], 0); mp4.set([0xFF, 0xE1, 0x10, 0x00], 100); assert.equal(S.sampleRate(mp4), 0);
  const mp2 = new Uint8Array(64); mp2.set([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0xFF, 0xF3, 0x84, 0], 0); assert.equal(S.sampleRate(mp2), 24000); // 24 кГц, 64 кбіт/с, кадр 192 байти, файл закінчується раніше
  const og = new Uint8Array(64); og.set([0x4F, 0x67, 0x67, 0x53], 0); og.set([1, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73, 0, 0, 0, 0, 2, 0x44, 0xAC, 0, 0], 28); assert.equal(S.sampleRate(og), 44100);
  assert.equal(S.sampleRate(new Uint8Array(64)), 0);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
