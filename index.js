const { parseDate, extractWords } = require('./lib/date-parser');

//let original = "6 апреля на 9 марта в 15.00 за водой в 40 секунд 20 минут 50 августа 45 года 2010 года";
let original = "6 апреля в 15:59, на 9 марта за водой в 40 секунд 20 минут 6 часов 50 августа 45 года и 2010 года";
let obj = extractWords(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
let resDate = parseDate(original, 1, 50);
console.log('resDate :>> ', resDate);
console.log("exiting . . .");