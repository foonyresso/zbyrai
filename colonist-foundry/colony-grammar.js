/* Colonist Foundry: відмінювання імен для текстів журналу («посварився з Ратибором», «допоміг Ладі»).
   Покриває типові українські імена з нашого списку; рідкісні форми можуть бути неідеальні. Глобал ColonyGrammar і module.exports. */
const ColonyGrammar = (() => {
  const MUT = { к: 'ц', г: 'з', х: 'с' };
  const VOW = 'аеєиіїоуюя';
  // case: gen (кого), dat (кому), acc (кого, знахідний), ins (ким)
  function inflect(name, female, cs) {
    const last = name.slice(-1), stem = name.slice(0, -1), prev = name.slice(-2, -1);
    if (female) {
      if (last === 'а') { const m = MUT[prev] ? stem.slice(0, -1) + MUT[prev] : stem; return { gen: stem + 'и', dat: m + 'і', acc: stem + 'у', ins: stem + 'ою' }[cs]; }
      if (last === 'я') { const v = VOW.includes(prev); return { gen: v ? stem + 'ї' : stem + 'і', dat: v ? stem + 'ї' : stem + 'і', acc: stem + 'ю', ins: v ? stem + 'єю' : stem + 'ею' }[cs]; }
      return name;
    }
    if (last === 'й') return { gen: stem + 'я', dat: stem + 'ю', acc: stem + 'я', ins: stem + 'єм' }[cs];
    if (last === 'о') return { gen: stem + 'а', dat: stem + 'у', acc: stem + 'а', ins: stem + 'ом' }[cs];
    if (last === 'а') return { gen: stem + 'и', dat: (MUT[prev] ? stem.slice(0, -1) + MUT[prev] : stem) + 'і', acc: stem + 'у', ins: stem + 'ою' }[cs];
    if (last === 'я' || last === 'ь') return name;
    return { gen: name + 'а', dat: name + 'у', acc: name + 'а', ins: name + 'ом' }[cs];
  }
  return { inflect };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ColonyGrammar;
