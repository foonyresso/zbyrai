// Власні формули: елементи інтерфейсу (поле формули з перевіркою, вибір з бібліотеки, довідка). Логіка — formula.js, дані — formula-presets.js.
const FormulaUI = (() => {
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); } e.append(...kids.flat().filter(x => x != null)); return e; };

  /* Поле формули з живою перевіркою. onChange викликається при кожній зміні (навіть із помилкою, щоб було видно NaN). */
  function exprBox(c, onChange) {
    const i = el('input', { type: 'text', class: 'expr', value: c.expr || '', spellcheck: 'false', autocomplete: 'off', maxlength: 400, placeholder: 'наприклад: a * 1.1 ^ (x-1)', 'aria-label': 'Формула', title: 'Власна формула. Змінні: x (рівень), a, b, p (числа нижче), c1…c20 (інші криві). Приклад: a * b ^ floor((x-1)/p)' });
    const err = el('div', { class: 'ferr', role: 'status' });
    const show = () => { const e = Formula.check(c.expr); err.textContent = e || ''; err.hidden = !e; i.classList.toggle('bad', !!e); };
    i.oninput = () => { c.expr = i.value; show(); onChange(); };
    show();
    return el('div', { class: 'exprbox' }, i, err);
  }

  /* Вибір готової формули з бібліотеки; onPick(preset) отримує елемент бібліотеки. */
  function presetSelect(onPick, label = '＋ З бібліотеки формул…') {
    const s = el('select', { 'aria-label': 'Бібліотека формул', title: 'Готові формули для типових механік: досвід, клікер, відстань від центру, дроп, хвилі. Вибір додасть формулу, яку можна змінити' }, el('option', { value: '' }, label),
      FormulaPresets.groups.map(g => el('optgroup', { label: g }, FormulaPresets.list.map((p, k) => p.group === g ? el('option', { value: k, title: p.hint }, p.name) : null))));
    s.onchange = () => { const p = FormulaPresets.list[+s.value]; s.value = ''; if (p) onPick(p); };
    return s;
  }

  function help() {
    const rows = [['x', 'рівень, крок чи номер хвилі'], ['a, b, p', 'три числа кривої (їх міняють під формулою)'], ['c1…c20', 'значення першої…двадцятої кривої зі списку в тій самій точці x'], ['pi, e', 'математичні сталі'],
      ['+ − * / % ^', 'дії; ^ — степінь, % — залишок від ділення'], ['< > <= >= == !=  && ||  !', 'порівняння й логіка; дають 1 (так) або 0 (ні)'], ['умова ? тоді : інакше', 'вибір, напр. x % 10 == 0 ? 5 : 1'],
      ['min, max, abs, floor, ceil, round, sqrt, exp, ln, log2, log10, pow, sin, cos, tan, sign, mod', 'звичайні функції (min і max беруть кілька значень)'], ['clamp(v, від, до)', 'обмежити значення межами'], ['mix(a, b, t)', 'суміш: a при t=0, b при t=1'], ['step(межа, x)', '1, якщо x ≥ межа, інакше 0'], ['if(умова, тоді, інакше)', 'те саме, що ?:']];
    return el('details', { class: 'fhelp' }, el('summary', { title: 'Які змінні, дії й функції можна використовувати у формулі' }, 'Довідка по формулах'),
      el('dl', {}, rows.map(([k, v]) => [el('dt', {}, k), el('dd', {}, v)])),
      el('p', { class: 'hint' }, 'Приклад «кожні 10 рівнів баланс змінюється»: a * b ^ floor((x-1)/p) при a=100, b=2, p=10. Помилку в формулі видно під полем; крива тоді порожня.'));
  }
  return { exprBox, presetSelect, help };
})();
