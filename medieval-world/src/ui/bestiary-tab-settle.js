/* Бестіарій, вкладка «Поселення»: ранги поселень, їхні стани, будівлі та поселення, що справді є в поточному світі */
(function () {
  "use strict";
  const A = window.Atlas, H = Bestiary.H, esc = H.esc;
  const SUBS = [["rank", "Типи поселень", "Від хутора до столиці: населення й дороги"], ["state", "Стани", "Живе, занепале, зруйноване, покинуте, захоплене"], ["bld", "Будівлі", "Усі типи споруд міста за категоріями"], ["real", "Згенеровано", "Поселення поточного світу на карті"]];
  const LOOK = { capital: "Місто за високими мурами з кількома вежами, широкі вулиці, площі та багато кварталів.", regional: "Велике місто з мурами, ринком і міською ратушею.", town: "Містечко з невеликим муром або частоколом, ринковою площею та храмом.", village: "Сільські хати навколо спільного пасовиська, колодязь і млин.", hamlet: "Кілька дворів серед полів, без муру.", mine: "Дерев'яні бараки біля чорного лазу в скелі та відвали породи." };
  const STLOOK = { normal: "Димлять комини, на вулицях люди.", fallen: "Частина хат порожня, дахи латані, ринок тихий.", ruined: "Обвалені стіни й чорні від диму балки, лишилися поодинокі мешканці.", abandoned: "Порожні будинки, двері розхитані, бур'ян у дворах.", occupied: "Над осельцем дим не від господарів: тут розташувались монстри." };
  Bestiary.tab("settle", "Поселення", "Довідник поселень: типи, стани, будівлі та що є в світі", (c) => {
    const st = H.st("settle"), sub = st.sub || "rank", D = (window.RealmMap && RealmMap.Data) || {};
    let body = "";
    if (sub === "rank") body = Object.keys(D.ranks || {}).map((k) => { const r = D.ranks[k]; return H.card(r.name, H.chip(r.pop[0] + "–" + r.pop[1] + " мешканців"), "<p>" + esc(LOOK[k] || "") + "</p>" + H.kv("Населення", r.pop[0] + "–" + r.pop[1]) + H.kv("Дорога", (D.roadClasses[r.road] || {}).name || r.road) + H.kv("Раси", "у малих осельцях живе до кількох рас, у великих містах усі")); }).join("");
    else if (sub === "state") body = Object.keys(D.states || {}).map((k) => H.card(D.states[k].name, "", "<p>" + esc(STLOOK[k] || "") + "</p><p>Стан мають лише хутори, села й великі села; містечка й більші завжди живі.</p>")).join("");
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
        body = "<p>Огляд квадрата " + s.size + "×" + s.size + " од. навколо центру поточного світу карти. Поселень: <b>" + s.places.length + "</b>.</p>" +
          H.sec("За типами", "<p>" + Object.keys(rk).map((k) => esc((D.ranks[k] || {}).name || k) + ": <b>" + rk[k] + "</b>").join(" · ") + "</p>") +
          H.sec("За станом", "<p>" + Object.keys(stt).map((k) => esc((D.states[k] || {}).name || k) + ": <b>" + stt[k] + "</b>").join(" · ") + "</p>") +
          H.sec("Раси в поселеннях", "<p>" + mix.map((m) => esc(m.race.name) + ": <b>" + m.places + "</b>").join(" · ") + "</p>");
      }
    }
    return H.sub("settle", SUBS) + body;
  });
})();
