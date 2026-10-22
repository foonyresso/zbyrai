/* Підсвітка при наведенні: на великій відстані світиться вся провінція під курсором, при наближенні лише регіон. Дикий океан не підсвічується.
   Маска рахується малим растром (крок HR_STEP пікселів) і кешується, поки курсор у тій самій області й камера не рушила. */
const HR_STEP = 6, HR_PROV_S = .04, HR_MAX_S = .5;
let hrCv = null, hrKey = "", hrTarget = null;
function hrTargetAt(x, y) {
  const h = bTerr(x, y);
  if (!h) return null;
  return S < HR_PROV_S ? PV(h) : h;
}
function drawHoverRegion() {
  if (!hov || S >= HR_MAX_S || !WLD || !WBD) return;
  const t = hrTargetAt(hov[0], hov[1]);
  if (!t) return;
  const prov = S < HR_PROV_S, key = [prov ? "p" : "r", t.x, t.y, S, Math.round(ox), Math.round(oy), W, H, WLD.hk].join("|");
  if (key !== hrKey) {
    const w = Math.ceil(W / HR_STEP), h = Math.ceil(H / HR_STEP);
    hrCv = hrCv || document.createElement("canvas");
    hrCv.width = w;
    hrCv.height = h;
    const g = hrCv.getContext("2d"), im = g.createImageData(w, h), d = im.data;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const q = bTerr(((i + .5) * HR_STEP - ox) / S, ((j + .5) * HR_STEP - oy) / S);
        if (!q || (prov ? PV(q) : q) !== t) continue;
        const o = (j * w + i) * 4;
        d[o] = d[o + 1] = d[o + 2] = 255;
        d[o + 3] = 95;
      }
    }
    g.putImageData(im, 0, 0);
    hrKey = key;
  }
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(hrCv, 0, 0, hrCv.width * HR_STEP, hrCv.height * HR_STEP);
  ctx.restore();
}
