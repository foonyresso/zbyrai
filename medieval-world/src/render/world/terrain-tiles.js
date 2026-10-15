/* ---- растр тайла: плоскі кольори за класами + тонкі контури (як на паперовій карті) ---- */
let CR = 0, CG = 0, CB = 0;
function mxc(c, t) {
  if (t > 0) {
    CR += (c[0] - CR) * t;
    CG += (c[1] - CG) * t;
    CB += (c[2] - CB) * t;
  }
}
const PCL = {},
  BKI = ["grass", "snow", "desert", "swamp"],
  RK = [0, 0, 0, 1, 2, 3, 0],
  COAST = [116, 167, 197],
  CONT = [190, 181, 156];
function pal(bk) {
  if (PCL[bk]) return PCL[bk];
  const b = BIOS[bk], g = hx(b.g), f = hx(b.f);
  return PCL[bk] = [
    [168, 205, 227],
    [156, 197, 222],
    f,
    g.map((v) => Math.round(v * .955)),
    bk == "snow" ? [226, 230, 229] : [218, 212, 192],
    [247, 248, 248],
    g,
  ];
}
function mkTile(b, tx, ty) {
  const TW = 2 ** b,
    X0 = tx * TW,
    Y0 = ty * TW,
    GN2 = Math.max(48, Math.min(256, Math.ceil(TW / 128))),
    Q = 256,
    QB = Q + 2,
    sp = TW / GN2,
    GG = GN2 + 4,
    NF = 9,
    FD = new Float32Array(GG * GG * NF),
    ps = TW / Q * 1.6;
  for (let gy = -2; gy < GN2 + 2; gy++) {
    for (let gx = -2; gx < GN2 + 2; gx++) {
      const p = tsamp(X0 + (gx + .5) * sp, Y0 + (gy + .5) * sp, ps),
        o = ((gy + 2) * GG + gx + 2) * NF;
      FD[o] = p.E;
      FD[o + 1] = p.rd;
      FD[o + 2] = p.mo;
      FD[o + 3] = p.tp;
      FD[o + 4] = p.fo;
      const sb = p.E > 0 ? sbAt(X0 + (gx + .5) * sp, Y0 + (gy + .5) * sp) : null;
      if (sb) { FD[o + 5] = sb.w; FD[o + 6] = sb.w * sb.rgb[0]; FD[o + 7] = sb.w * sb.rgb[1]; FD[o + 8] = sb.w * sb.rgb[2]; }
    }
  }
  const Ef = new Float32Array(QB * QB),
    Rf = new Float32Array(QB * QB),
    Ff = new Float32Array(QB * QB),
    Sb = new Float32Array(QB * QB * 4),
    bi = new Uint8Array(QB * QB),
    Rr = new Float32Array(QB * QB).fill(1e3),
    V = new Float32Array(NF),
    gs = GN2 / Q;
  if (TW <= 65536) riverRaster(X0, Y0, TW, Q, QB, Rr);
  for (let py = -1; py <= Q; py++) {
    const gyf = (py + .5) * gs - .5, gy0 = Math.floor(gyf), fy = gyf - gy0;
    for (let px = -1; px <= Q; px++) {
      const gxf = (px + .5) * gs - .5,
        gx0 = Math.floor(gxf),
        fx = gxf - gx0,
        o00 = ((gy0 + 2) * GG + gx0 + 2) * NF,
        o10 = o00 + NF,
        o01 = o00 + GG * NF,
        o11 = o01 + NF,
        w00 = (1 - fx) * (1 - fy),
        w10 = fx * (1 - fy),
        w01 = (1 - fx) * fy,
        w11 = fx * fy;
      for (let k = 0; k < NF; k++) {
        V[k] = FD[o00 + k] * w00 + FD[o10 + k] * w10 + FD[o01 + k] * w01 +
          FD[o11 + k] * w11;
      }
      const i = (py + 1) * QB + px + 1;
      Ef[i] = V[0];
      Rf[i] = V[1];
      Ff[i] = V[4];
      Sb[i * 4] = V[5];
      Sb[i * 4 + 1] = V[6];
      Sb[i * 4 + 2] = V[7];
      Sb[i * 4 + 3] = V[8];
      bi[i] = V[3] < .36
        ? 1
        : (V[2] < .38 && V[3] > .45)
        ? 2
        : V[2] > .64
        ? 3
        : 0;
    }
  }
  /* кольори за класами, межі згладжені за відстанню в пікселях до ізолінії → без «сходинок» */
  const sc = document.createElement("canvas");
  sc.width = sc.height = QB;
  const sx = sc.getContext("2d"),
    im = sx.createImageData(QB, QB),
    dt = im.data,
    gr = (A, x, y, i) => {
      const a = x > 0 ? i - 1 : i,
        b = x < QB - 1 ? i + 1 : i,
        u = y > 0 ? i - QB : i,
        d = y < QB - 1 ? i + QB : i;
      return Math.max(
        1e-6,
        (Math.abs(A[b] - A[a]) + Math.abs(A[d] - A[u])) * .5,
      );
    };
  for (let y = 0; y < QB; y++) {
    for (let x = 0; x < QB; x++) {
      const i = y * QB + x,
        E = Ef[i],
        P = pal(BKI[bi[i]]),
        gE = gr(Ef, x, y, i);
      if (E < 0 && -E > 3 * gE) {
        const c = E < -.16 ? P[1] : P[0], o = i * 4;
        dt[o] = c[0];
        dt[o + 1] = c[1];
        dt[o + 2] = c[2];
        dt[o + 3] = 255;
        continue;
      }
      CR = P[6][0];
      CG = P[6][1];
      CB = P[6][2];
      mxc(P[3], cl01((E - .27) / gE + .5));
      const fo = Ff[i];
      if (fo > .4 && E < .45) {
        mxc(
          P[2],
          cl01((fo - .55) / gr(Ff, x, y, i) + .5) * cl01((.4 - E) / gE + .5),
        );
      }
      const sw0 = Sb[i * 4];
      if (sw0 > .01 && E > .01) {
        mxc([Sb[i * 4 + 1] / sw0, Sb[i * 4 + 2] / sw0, Sb[i * 4 + 3] / sw0], sw0 * .6 * cl01(E / gE));
      }
      mxc(P[4], cl01((E - .4) / gE + .5));
      mxc(P[5], cl01((E - .62) / gE + .5));
      if (E > -.05) {
        for (const t of [.27, .4, .62]) {
          mxc(CONT, cl01(1 - Math.abs(E - t) / gE) * .75);
        }
        let sw = -E / gE;
        if (-Rr[i] > sw) sw = -Rr[i];
        if (E > 0) {
          const sr = -Rf[i] / gr(Rf, x, y, i);
          if (sr > sw) {
            sw = sr;
          }
        }
        mxc(E < -.16 ? P[1] : P[0], cl01(sw + .5));
        mxc(COAST, cl01(1 - Math.abs(sw)) * .9);
      }
      const o = i * 4;
      dt[o] = CR;
      dt[o + 1] = CG;
      dt[o + 2] = CB;
      dt[o + 3] = 255;
    }
  }
  sx.putImageData(im, 0, 0);
  const cvT = document.createElement("canvas");
  cvT.width = cvT.height = TP;
  const c = cvT.getContext("2d"), kk = TP / Q;
  c.imageSmoothingEnabled = true;
  c.drawImage(sc, -kk, -kk, QB * kk, QB * kk);
  wdet(c, X0, Y0, TW, TP);
  return cvT;
}
