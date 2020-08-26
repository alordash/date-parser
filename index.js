const { parseDate, extractWords } = require('./lib/date-parser');

const original = "что-то каждые 5 секунд 10 минут 23 часов с 5 часов до 7 часов, 123 в 25 году";

let obj = extractWords(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
let resDate = parseDate(original, 1, 50);
console.log('resDate :>> ', resDate);
console.log("exiting . . .");