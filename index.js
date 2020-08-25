const { parseDate, extractWords } = require('./lib/date-parser');

//let original = "6 апреля в 15:59, 9 марта за водой в 40 секунд и за хлебом, 20 минут 6 часов 50 июля 45 года и 2010 года но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей. Это новый контекст в 15:00, а то другой, и рядом с ним еще один на 10:00 января.";
//let original = "завтра 31 декабря в без 1 минут 9 вечера напомни позвонить послезавтра в центр";
let original = "а 20.12.2020 и 5.05 что-то. то что в 10:20";

let obj = extractWords(original);
let str = '';
obj.forEach(v => str += v.regex_char);
console.log(str);
let resDate = parseDate(original, 1, 50);
console.log('resDate :>> ', resDate);
console.log("exiting . . .");