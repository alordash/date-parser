const { parseDate, extractWords } = require('./lib/date-parser');
const { extractDates } = require('./lib/date-cases');
extractDates({text: "lolol"});

let obj = extractWords("6 апреля в 15.00 На Ногти Мне");
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
console.log("exiting . . .");