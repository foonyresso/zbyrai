/* Бестіарій, вкладка «Поселення»: ранги поселень, їхні стани, будівлі та поселення, що справді є в поточному світі */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc;
  const SUBS = [["rank", "Типи поселень", "Від хутора до столиці: населення й дороги"], ["state", "Стани", "Живе, занепале, зруйноване, покинуте, захоплене"], ["bld", "Будівлі", "Усі типи споруд міста за категоріями"], ["real", "Згенеровано", "Поселення поточного світу на карті"]];
  const LOOK = { capital: "Місто за високими мурами з кількома вежами, широкі вулиці, площі та багато кварталів.", regional: "Велике місто з мурами, ринком і міською ратушею.", town: "Містечко з невеликим муром або частоколом, ринковою площею та храмом.", village: "Сільські хати навколо спільного пасовиська, колодязь і млин.", hamlet: "Кілька дворів серед полів, без муру.", mine: "Дерев'яні бараки біля чорного лазу в скелі та відвали породи." };
  const STLOOK = { normal: "Димлять комини, на вулицях люди.", fallen: "Частина хат порожня, дахи латані, ринок тихий.", ruined: "Обвалені стіни й чорні від диму балки, лишилися поодинокі мешканці.", abandoned: "Порожні будинки, двері розхитані, бур'ян у дворах.", occupied: "Над осельцем дим не від господарів: тут розташувались монстри." };
  const IDX = { hamlet: 0, village: 1, town: 2, regional: 3, capital: 4, mine: 1 };
  /* лор поселень виміру з preset.settle: найвищий ранг, густота, частка руїн, власні назви рангів */
  const lore = (w) => Object.assign({ max: 6, dens: 1, ruin: 0 }, (w && w.preset && w.preset.settle) || {});
  const loreText = (L) => (L.max < 0 ? "поселень немає зовсім" : L.max == 0 ? "лише поодинокі хутори" : L.max < 3 ? "лише малі поселення (до рангу «" + ["Хутір", "Село", "Містечко"][L.max] + "»)" : L.max < 4 ? "малі й середні поселення, без столиць" : "усі ранги") + "; густота ×" + L.dens + (L.ruin ? "; зруйновано " + Math.round(L.ruin * 100) + "% поселень" : "");
  Bestiary.tab("settle", "Поселення", "Довідник поселень: типи, стани, будівлі та що є в світі", (c) => {
    const st = H.st("settle"), sub = st.sub || "rank", D = (window.RealmMap && RealmMap.Data) || {};
    const L = lore(c.world), nm = L.names || {}, rn = (k) => nm[k] || (D.ranks[k] || {}).name || k;
    let body = "";
    if (sub === "rank") body = "<p>Склад поселень цього виміру: <b>" + esc(loreText(L)) + "</b>.</p>" + Object.keys(D.ranks || {}).filter((k) => k != "mine" ? IDX[k] <= L.max : L.max >= 1).map((k) => { const r = D.ranks[k]; return H.card(rn(k), H.chip(r.pop[0] + "–" + r.pop[1] + " мешканців"), "<p>" + esc(LOOK[k] || "") + "</p>" + H.kv("Населення", r.pop[0] + "–" + r.pop[1]) + H.kv("Дорога", (D.roadClasses[r.road] || {}).name || r.road) + H.kv("Раси", "у малих осельцях живе до кількох рас, у великих містах усі")); }).join("");
    else if (sub === "state") body = (L.ruin ? "<p>Вимір зруйнований: <b>" + Math.round(L.ruin * 100) + "%</b> поселень (будь-якого рангу) зруйновані або покинуті, мешканців мало або немає.</p>" : "") + Object.keys(D.states || {}).map((k) => H.card(D.states[k].name, "", "<p>" + esc(STLOOK[k] || "") + "</p><p>" + (L.ruin ? "Стан мають поселення всіх рангів; стартове місто завжди живе." : "Стан мають лише хутори, села й великі села; містечка й більші завжди живі.") + "</p>")).join("");
    else if (sub === "bld") {
      const cats = {};
      if (typeof T !== "undefined") for (const k in T) (cats[T[k].c] = cats[T[k].c] || []).push(T[k]);
      body = Object.keys(cats).map((cat) => "<h4>" + esc(cat) + "</h4>" + cats[cat].map((b) => H.card(b.n, "", "<p>" + esc(b.d) + "</p>", b.col)).join("")).join("");
    } else {
      const s = window.BestiaryScan && BestiaryScan.run();
      if (!s) body = "<p>Карта ще не готова.</p>";
      else {
        const rk = {}, stt = {};
        s.places.forEach((p) => { const r = BestiaryScan.rankOf(p.tier); rk[r] = (rk[r] || 0) + 1; stt[p.state] = (stt[p.state] || 0) + 1; });
        const mix = Object.values(s.mix).sort((a, b) => b.share - a.share);
        body = "<p>Огляд квадрата " + s.size + "×" + s.size + " од. навколо центру поточного світу карти. Поселень: <b>" + s.places.length + "</b>. Лор: " + esc(loreText(L)) + ".</p>" +
          H.sec("За типами", "<p>" + Object.keys(rk).map((k) => esc(rn(k)) + ": <b>" + rk[k] + "</b>").join(" · ") + "</p>") +
          H.sec("За станом", "<p>" + Object.keys(stt).map((k) => esc((D.states[k] || {}).name || k) + ": <b>" + stt[k] + "</b>").join(" · ") + "</p>") +
          H.sec("Раси в поселеннях", "<p>" + mix.map((m) => esc(m.race.name) + ": <b>" + m.places + "</b>").join(" · ") + "</p>");
      }
    }
    return H.sub("settle", SUBS) + body;
  });
})();
