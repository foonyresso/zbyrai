/* Бестіарій, вкладка «Дороги»: класи сухопутних доріг, морські шляхи та що де розміщено в поточному світі */
(function () {
  "use strict";
  const H = Bestiary.H, esc = H.esc;
  const TXT = { major: "Широкий вимощений шлях між столицями й центрами регіонів, на ньому завжди людно.", medium: "Утоптана дорога з колією від возів, веде до містечок і великих сіл.", minor: "Вузька ґрунтова дорога до сіл і значних місць; навесні розкисає.", trail: "Ледь помітна стежка до хуторів, таборів і дрібних місць; легко загубити." };
  Bestiary.tab("roads", "Дороги", "Довідник доріг і морських шляхів", (c) => {
    const D = (window.RealmMap && RealmMap.Data) || {}, rk = D.ranks || {};
    const L = Object.assign({ max: 6 }, (c.world && c.world.preset && c.world.preset.settle) || {}), rd = L.roads || {};
    /* найвищий клас дороги залежить від найвищого рангу поселення; без поселень доріг нема */
    const top = L.max < 0 ? 0 : L.max >= 4 ? 4 : L.max >= 3 ? 3 : L.max >= 1 ? 2 : 1, hasRoad = (k) => D.roadClasses[k].level <= top;
    const topK = Object.keys(D.roadClasses || {}).find((k) => D.roadClasses[k].level == top);
    const roads = Object.keys(D.roadClasses || {}).filter(hasRoad).map((k) => { const r = D.roadClasses[k]; return H.card(rd[k] || r.name, H.chip(r.speed + " км/добу"), "<p>" + esc(TXT[k] || "") + "</p>" + H.kv("Швидкість пішки", r.speed + " км за добу") +
      H.kv("З'єднує", Object.keys(rk).filter((x) => rk[x].road === k).map((x) => rk[x].name)), r.color); }).join("");
    const sea = H.card("Морські шляхи", "", "<p>Лінії між портами, якими ходять кораблі, тримаючись узбережжя. Порт є лише в тих містах, що впираються у воду.</p>" + H.kv("Вигляд", "пунктирні лінії по воді з кораблями"));
    const note = L.max < 0 ? "<p><b>У цьому вимірі поселень немає, а отже й доріг.</b></p>" : L.max < 4 ? "<p><b>Великих міст тут нема, тому найширша дорога — «" + esc(rd[topK] || D.roadClasses[topK].name) + "».</b></p>" : "";
    return note + "<p>Дороги прокладаються за найпростішим шляхом з урахуванням рельєфу; чим важливіше поселення, тим ширша дорога до нього.</p>" + roads + (L.max < 0 ? "" : sea);
  });
})();
