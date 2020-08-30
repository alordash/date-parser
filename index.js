const { parseDate, extractRegexChars } = require('./lib/date-parser');

const original = "come home in 10 seconds 20 minutes 30 hours. Buy milk and wash car on monday Wash my car ";

let obj = extractRegexChars(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
let resDate = parseDate(original, 1, 50);
console.log('resDate :>> ', resDate);
console.log("exiting . . .");