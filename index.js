const { parseDate, extractWords } = require('./lib/date-parser');

let original = "6 апреля на 9 марта в 15.00 за водой в 40 секунд 20 минут 50 августа 45 года 2010 года";
let obj = extractWords(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
console.log('parseDate(original) :>> ', parseDate(original));
console.log("exiting . . .");