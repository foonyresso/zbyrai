// Хаб: позначає сесію, щоб інструменти, відкриті з диска (file://), показували посилання «назад на головну»,
// і підсвічує картку за курсором (змінні --mx / --my).
try { sessionStorage.setItem('hub', '1'); } catch (e) {}

document.querySelectorAll('.card').forEach(function (card) {
  card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});
