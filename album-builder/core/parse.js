// Розбір списків: діти (будь-який порядок номерів і ПІБ) і вчителі (номери, 3 слова ПІБ, решта — посада). Без DOM.
(function (root) {
  function norm(n) { return String(parseInt(n, 10)); }
  function numsOf(s) { return (String(s).match(/\d+/g) || []).map(norm); }
  function cleanName(s) {
    return String(s).replace(/\d+/g, ' ').replace(/[№#,;:|\/\\()\[\]]+/g, ' ').replace(/\s[-–—]\s/g, ' ').replace(/^[\s\-–—.]+|[\s\-–—.]+$/g, '').replace(/\s+/g, ' ');
  }
  // Дитина/без альбому: підпис = текст рядка без номерів (порядок слів не чіпаємо).
  function parseChildren(text) {
    var out = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var nums = numsOf(line), name = cleanName(line);
      if (!nums.length && !name) return;
      out.push({ nums: nums, name: name });
    });
    return out;
  }
  // Вчитель: перші три слова — прізвище, ім'я, по батькові; решта — посада (може не бути).
  function parseTeachers(text) {
    return parseChildren(text).map(function (p) {
      var w = p.name ? p.name.split(' ') : [];
      return { nums: p.nums, name: w.slice(0, 3).join(' '), post: w.slice(3).join(' ') };
    });
  }
  // Номери з назви файлу (без розширення), без нулів попереду.
  function fileRuns(fileName) { return numsOf(String(fileName).replace(/\.[^.]*$/, '')); }
  var api = { parseChildren: parseChildren, parseTeachers: parseTeachers, fileRuns: fileRuns, numsOf: numsOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumParse = api;
})(typeof self !== 'undefined' ? self : this);
