const {
   DateTypes,
   TimeTypes,
   ValidModes,
   ParsedTime,
   Context,
   ContextsData,

   replaceAt,
   ParseCase,
   markIndexes,
   processContexts,
   checkHours,
   checkMinutes,
   checkDate,
   checkMonth,
   checkYear,
   processHour,
   GetDaysToDayOfWeek
} = require('../parse-cases-processing');

const parseCases = [
   //Searchs for DD.MM().Y-YYYY) cases
   new ParseCase(75, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/D/g)];
      for (const match of matches) {
         let vals = this.expressions[match.index].text.split(/\./);
         let date = +vals[0];
         let month = +vals[1];
         let year = -1;
         if (vals.length > 2) {
            year = +vals[2];
         }
         if (
            checkDate(date, month, year)
            && checkMonth(month)
            && (year == -1 || checkYear(year))
         ) {
            let indexes = markIndexes.call(this, match.index, 1, true, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, date, indexes, context, prevalence, { validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, month, indexes, context, prevalence, { validMode: ValidModes.certified }));
            if (year != -1) {
               parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, year, indexes, context, prevalence, { validMode: ValidModes.certified }));
            }
         } else if (checkHours(date) && checkMinutes(month) && vals.length == 2) {
            this.regchars = replaceAt(this.regchars, match.index, 't');
         } else {
            this.regchars = replaceAt(this.regchars, match.index, 'n');
         }
      }
      return parsedTimes;
   }),
   //Searchs for HH:MM(:SS) cases
   new ParseCase(75, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/t/g)];
      for (const match of matches) {
         let vals = this.expressions[match.index].text.split(/[:\.]/);
         let hours = +vals[0];
         let minutes = +vals[1];
         let seconds = -1;
         if (vals.length > 2) {
            if (match[0][2] == match[0][5] || match[0][1] == match[0][5]) {
               seconds = +vals[2];
            } else {
               hours = 100;
            }
         }
         if (checkHours(hours) && checkMinutes(minutes) && (seconds == -1 || checkMinutes(seconds))) {
            let indexes = markIndexes.call(this, match.index, 1, true, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, hours, indexes, context, prevalence, { isFixed: true, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, indexes, context, prevalence, { validMode: ValidModes.certified }));
            if (seconds != -1) {
               parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, seconds, indexes, context, prevalence, { validMode: ValidModes.certified }));
            }
         }
      }
      return parsedTimes;
   }),
   //Searchs for weeks cases
   new ParseCase(80, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/[FpP]d/g)];
      for (const match of matches) {
         const length = match[0].length;
         let value = this.expressions[match.index + length - 1].value;
         if (value != 0) {
            let dif = GetDaysToDayOfWeek(value);
            if (match[0][0] == 'F' && dif == 0) {
               dif += 7;
            }
            let indexes = markIndexes.call(this, match.index, length, true, true);
            let context = processContexts(contextsData, indexes);
            const now = new Date();
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, now.getDate() + dif, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for "in without X minutes" cases
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/[pP]BnnO{0,1}/g)];
      for (const match of matches) {
         const length = match[0].length;
         let minutes = +this.expressions[match.index + 2].text;
         let hours = +this.expressions[match.index + 3].text;
         if (1 <= hours && hours <= 25 && 0 < minutes && minutes < 60) {
            let isFixed = false;
            if (match[0][length - 1] == 'O') {
               hours = processHour(hours, this.expressions[match.index + length - 1].value);
               isFixed = true;
            }
            hours--;
            minutes = 60 - minutes;
            let indexes = markIndexes.call(this, match.index, length, false, false, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, hours, indexes, context, prevalence, { isFixed, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for without X minutes cases
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/Bnm{0,1}n[Oh]O{0,1}/g)];
      for (const match of matches) {
         const length = match[0].length;
         let minutes = +this.expressions[match.index + 1].text;
         let num;
         if (match[0][2] == 'm') {
            num = +this.expressions[match.index + 3].text;
         } else {
            num = +this.expressions[match.index + 2].text;
         }
         if (1 <= num && num <= 25 && 0 < minutes && minutes < 60) {
            let isFixed = false;
            if (match[0][length - 1] == 'O') {
               num = processHour(num, this.expressions[match.index + length - 1].value);
               isFixed = true;
            }
            num--;
            minutes = 60 - minutes;
            let indexes = markIndexes.call(this, match.index, length, true, false);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { isFixed, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for without X minutes cases on EN
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nm{0,1}Bn[Oh]O{0,1}/g)];
      for (const match of matches) {
         const length = match[0].length;
         let minutes = +this.expressions[match.index].text;
         let num;
         if (match[0][1] == 'm') {
            num = +this.expressions[match.index + 3].text;
         } else {
            num = +this.expressions[match.index + 2].text;
         }
         if (1 <= num && num <= 25 && 0 < minutes && minutes < 60) {
            let isFixed = false;
            if (match[0][length - 1] == 'O') {
               num = processHour(num, this.expressions[match.index + length - 1].value);
               isFixed = true;
            }
            num--;
            minutes = 60 - minutes;
            let indexes = markIndexes.call(this, match.index, length, true, false);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { isFixed, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for half past hour (RU)
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/HnO{0,1}/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index + 1].text - 1;
         if (0 <= num && num <= 23) {
            let isFixed = false;
            if (match[0][match[0].length - 1] == 'O') {
               num = processHour(num, this.expressions[match.index + offset + 2].value);
               isFixed = true;
            }
            let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { isFixed, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, 30, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for half past hour
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/HL{0,1}n(O{1}|h{0,1})/g)];
      for (const match of matches) {
         let offset = 0;
         if (match[0][1] == 'L') {
            offset = 1;
         }
         let num = +this.expressions[match.index + offset + 1].text;
         if ((offset == 1 ? 0 : 1) <= num && num <= (offset == 1 ? 23 : 24)) {
            let isFixed = false;
            if (match[0][match[0].length - 1] == 'O') {
               num = processHour(num, this.expressions[match.index + offset + 2].value);
               isFixed = true;
            }
            if (offset == 0) {
               num--;
            }
            let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { isFixed, validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, 30, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for "every day" cases
   new ParseCase(60, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/En{0,1}[dO]/g)];
      for (const match of matches) {
         let last = this.expressions[match.index + match[0].length - 1];
         let isAmbiguous = last.regex_char == 'O';
         if (isAmbiguous && last.value != 3) {
            return parsedTimes;
         }
         let num = +this.expressions[match.index + 1].text;
         if (match[0].length < 3) {
            num = 1;
         }
         let value = last.value;
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         const now = new Date();
         if (isAmbiguous || value == 0) {
            parsedTimes.push(new ParsedTime(DateTypes.period, TimeTypes.dates, num, indexes, context, prevalence, { validMode: ValidModes.certified }));
         } else {
            let dif = value - (now.getDay() + 1);
            if (dif < 0) {
               dif += 7;
            }
            parsedTimes.push(new ParsedTime(DateTypes.period, TimeTypes.dates, 7, indexes, context, prevalence, { validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, now.getDate() + dif, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for "N N N" cases (typical for voice messages)
   new ParseCase(20, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/n{2,3}/g)];
      for (const match of matches) {
         let hours = +this.expressions[match.index].text;
         let mid = 0;
         let mIndex = 1;
         if (match[0].length > 2) {
            mid = +this.expressions[match.index + mIndex++].text;
         }
         let minutes = +this.expressions[match.index + mIndex].text;
         if (mIndex > 1 && minutes > 9) {
            continue;
         }
         if (mid == 0 && checkHours(hours) && 0 <= minutes && minutes < 60) {
            let indexes = markIndexes.call(this, match.index, match[0].length, true, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, hours, indexes, context, prevalence, { validMode: ValidModes.certified }));
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, indexes, context, prevalence, { validMode: ValidModes.certified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for simplified specification of hours and time of day
   new ParseCase(75, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nO/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         if (match.index > 0) {
            let prevExpr = this.expressions[match.index - 1];
            if (prevExpr.regex_char == 'C') {
               let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
               let context = processContexts(contextsData, indexes);
               parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, indexes, context, prevalence, { validMode: ValidModes.notCertified }));
               continue;
            }
         }
         let value = this.expressions[match.index + 1].value;
         if (checkHours(num)) {
            num = processHour(num, value);
            let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { isFixed: true, validMode: ValidModes.notCertified }));
         }
      }
      return parsedTimes;
   }),
   //Searchs for "after 'A'"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/CA/g)];
      for (const match of matches) {
         let value = this.expressions[match.index + 1].value + 1;
         let indexes = markIndexes.call(this, match.index, 2, true, true);
         let context = processContexts(contextsData, indexes);
         const now = new Date();
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, now.getDate() + value, indexes, context, prevalence, { validMode: ValidModes.certified }));
      }
      return parsedTimes;
   }),
   //Searchs for "after 'X'"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/CX/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, false, true);
         let context = processContexts(contextsData, indexes);
         const now = new Date();
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, now.getUTCMinutes() + 30, indexes, context, prevalence, { isOffset: true, validMode: ValidModes.certified }));

         const notFoundTimeTypes = [TimeTypes.dates, TimeTypes.months, TimeTypes.seconds, TimeTypes.years];
      }
      return parsedTimes;
   }),
   //Searchs for tomorrow and after tomorrow cases
   new ParseCase(60, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/A/g)];
      for (const match of matches) {
         let value = this.expressions[match.index].value;
         let indexes = markIndexes.call(this, match.index, 1, true, true);
         let context = processContexts(contextsData, indexes);
         const now = new Date();
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, now.getDate() + value, indexes, context, prevalence, { validMode: ValidModes.certified }));
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, now.getMonth() + 1, indexes, context, prevalence, { validMode: ValidModes.certified }));
      }
      return parsedTimes;
   })
];

module.exports = {
   parseCases
}