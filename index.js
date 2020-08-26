const { parseDate, extractWords } = require('./lib/date-parser');

const original = "что-то каждый день";

let obj = extractWords(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
let resDate = parseDate(original, 1, 50);
console.log('resDate :>> ', resDate);
console.log("exiting . . .");