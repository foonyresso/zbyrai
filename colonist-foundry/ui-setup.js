/* Colonist Foundry: панель «Колонія й місце»: скільки людей, зерно, планета, місцевість, тип поселення, варіант подій. Глобал CFSetup. */
const CFSetup = (() => {
  const C = ColonistCore, W = ColonyWorld, U = CFUI;
  let X = null;
  const init = x => {
    X = x; const { $, el } = X;
    $('selBiome').replaceChildren(...Object.entries(W.BIOMES).map(([k, b]) => el('option', { value: k }, `${U.BIOME_ICON[k]} ${b.name}`)));
    $('selKind').replaceChildren(...Object.entries(W.KINDS).map(([k, b]) => el('option', { value: k }, `${U.KIND_ICON[k]} ${b.name}`)));
    $('rCount').oninput = e => X.setPeople(+e.target.value);
    $('tSeed').onchange = e => X.setSeed(e.target.value.trim());
    $('btnNew').onclick = () => X.newColony();
    $('nDay').onchange = e => X.setVariant(Math.max(1, +e.target.value || 1));
    $('inPlanet').onchange = e => X.setPlace({ planet: e.target.value.trim().slice(0, 24) || 'Орвелія' });
    $('selBiome').onchange = e => X.setPlace({ biome: e.target.value });
    $('selKind').onchange = e => X.setPlace({ kind: e.target.value });
    $('btnPlanetName').onclick = () => X.setPlace({ planet: W.planetName(C.rngFromSeed(X.randSeed())) });
    $('btnPlaceRand').onclick = () => X.setPlace(W.randomPlace(C.rngFromSeed(X.randSeed())));
  };
  function render() {
    const { $, el, st } = X, p = st.place, b = W.BIOMES[p.biome], k = W.KINDS[p.kind], fx = v => (v === 1 || v == null ? '—' : '×' + v);
    $('rCount').value = st.n; $('oCount').textContent = st.n; $('tSeed').value = st.seed; $('nDay').value = st.day;
    $('inPlanet').value = p.planet; $('selBiome').value = p.biome; $('selKind').value = p.kind;
    $('setupSummary').textContent = `${st.n} людей · ${U.BIOME_ICON[p.biome]} ${p.planet}, ${b.name.toLowerCase()}, ${k.name.toLowerCase()}`;
    const mood = b.mood + k.thought;
    $('placeInfo').replaceChildren(el('p', { class: 'story' }, b.desc + ' ' + k.desc),
      el('ul', { class: 'plist' }, b.problems.map(t => el('li', {}, t))),
      el('div', { class: 'tags' },
        el('span', { class: 'tag', title: 'Додається до настрою кожного колоніста' }, `Настрій ${U.signed(mood)}`),
        el('span', { class: 'tag', title: 'Множник ризику хвороб (також залежить від погоди)' }, `Хвороби ${fx(b.ill)}`),
        el('span', { class: 'tag', title: 'Розваги відновлюють потребу швидше чи повільніше' }, `Розваги ${fx(k.fun)}`),
        el('span', { class: 'tag', title: 'Як часто на поселення нападають' }, `Загрози ${fx(k.raid)}`),
        ...Object.entries(b.need).map(([id, v]) => el('span', { class: 'tag', title: 'Множник швидкості спаду потреби' }, `${C.NEEDS.find(n => n.id === id).name} ×${v}`))),
      el('p', { class: 'hint' }, 'Погода тут: ' + Object.entries(b.w).sort((a, c) => c[1] - a[1]).map(([id]) => `${U.WEATHER_ICON[id]} ${W.WEATHER[id].name.toLowerCase()}`).join(', ') + '.'));
  }
  return { init, render };
})();
