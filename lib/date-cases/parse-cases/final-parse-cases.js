const {
   DateTypes,
   TimeTypes,
   getDateProperty,
   ValidModes,
   ParsedTime,
   Context,
   ContextsData,

   ParseCase,
   markIndexes,
   processContexts,
   processHour,
   findAllMatchingParsedTimes,
   findParsedTimesIndexByIndexes
} = require('../parse-cases-processing');

const parseCases = [
   //Searchs for time of day specification
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/O/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds]
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, -1, match.index, this.expressions, parsedTimes);
         if (parsedTimesIndexes.length == 0) {
            parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index, this.expressions, parsedTimes);
         }
         if (parsedTimesIndexes.length > 0) {
            let i = parsedTimesIndexes.length;
            let proceed = true;
            while (proceed && i--) {
               let parsedTime = parsedTimes[parsedTimesIndexes[i]];
               if (parsedTime.timeType == TimeTypes.hours) {
                  parsedTime.number = processHour(parsedTime.number, this.expressions[match.index].value);
                  parsedTime.prevalence += prevalence;
                  proceed = false;
                  parsedTime.isFixed = true;
                  let neighboursIds = findParsedTimesIndexByIndexes(parsedTimes, parsedTime.indexes);
                  for(const neighbourId of neighboursIds) {
                     if(neighbourId == parsedTimesIndexes[i]) {
                        continue;
                     }
                     parsedTimes[neighbourId].prevalence += prevalence;
                  }
               }
            }
            if (i >= 0) {
               parsedTimes[parsedTimesIndexes[i]].indexes.push(...markIndexes.call(this, match.index, 1, true, true));
            }
         }
      }
      return parsedTimes;
   }),
   //Searchs for "after X time"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/C/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.nMonth, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index, this.expressions, parsedTimes, undefined, true);
         if (parsedTimesIndexes.length == 0) {
            continue;
         }
         parsedTimesIndexes = parsedTimesIndexes.sort();
         let i = parsedTimesIndexes.length;
         const now = new Date();
         const indexes = markIndexes.call(this, match.index, 1, true, false);
         const context = processContexts(contextsData, indexes);
         let notFoundTimeTypes = [TimeTypes.dates, TimeTypes.hours, TimeTypes.minutes, TimeTypes.months, TimeTypes.seconds, TimeTypes.years];
         while (i--) {
            let parsedTime = parsedTimes[parsedTimesIndexes[i]];
            let index = notFoundTimeTypes.indexOf(parsedTime.timeType);
            if (index != -1) {
               notFoundTimeTypes.splice(index, 1);
            }
            if (parsedTime.timeType == TimeTypes.nMonth) {
               parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, now.getMonth() + 1 + parsedTime.number, parsedTime.indexes, context, prevalence, { isOffset: true }));
               parsedTimes.splice(parsedTimesIndexes[i], 1);
               notFoundTimeTypes.splice(notFoundTimeTypes.indexOf(TimeTypes.months), 1);
            } else {
               parsedTime.number = getDateProperty(now, parsedTime.timeType, true) + parsedTime.number;
            }
            parsedTime.prevalence += prevalence;
            parsedTime.indexes.push(...indexes);
            parsedTime.validMode = ValidModes.certified;
            parsedTime.isOffset = true;
         }
      }
      return parsedTimes;
   }),
   //Searchs for "from X time to Y time"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/V\.+I{0,1}[ZB]\.+/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.months, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let fromParsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index, this.expressions, parsedTimes, ValidModes.none);
         if (fromParsedTimesIndexes.length == 0) {
            continue;
         }
         fromParsedTimesIndexes.sort();
         let foundTimeTypes = [];
         let proceed = true;
         for (const i of fromParsedTimesIndexes) {
            let parsedTime = parsedTimes[i];
            if (foundTimeTypes.includes(parsedTime.timeType)) {
               proceed = false;
               break;
            } else {
               foundTimeTypes.push(parsedTime.timeType);
            }
         }
         if (proceed) {
            let zIndex = match.index + match[0].match(/[ZB]/).index;
            let toParsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, zIndex, this.expressions, parsedTimes, ValidModes.none);
            if (toParsedTimesIndexes.length == 0) {
               continue;
            }
            toParsedTimesIndexes = toParsedTimesIndexes.sort();
            foundTimeTypes = [];
            for (const i of toParsedTimesIndexes) {
               let parsedTime = parsedTimes[i];
               if (foundTimeTypes.includes(parsedTime.timeType)) {
                  proceed = false;
                  break;
               } else {
                  foundTimeTypes.push(parsedTime.timeType);
               }
            }
            if (proceed) {
               for (const i of fromParsedTimesIndexes) {
                  let parsedTime = parsedTimes[i];
                  parsedTime.indexes.unshift(match.index);
                  parsedTime.validMode = ValidModes.certified;
                  parsedTime.prevalence += prevalence;
               }
               for (const i of toParsedTimesIndexes) {
                  let parsedTime = parsedTimes[i];
                  parsedTime.dateType = DateTypes.max;
                  parsedTime.indexes.unshift(zIndex);
                  parsedTime.validMode = ValidModes.certified;
                  parsedTime.prevalence += prevalence;
               }
            }
         }
      }
      return parsedTimes;
   }),
   //Searchs for "to X time"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/Z\.+/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.months, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let toParsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index, this.expressions, parsedTimes);
         let proceed = true;
         if (toParsedTimesIndexes.length == 0) {
            continue;
         }
         toParsedTimesIndexes = toParsedTimesIndexes.sort();
         foundTimeTypes = [];
         for (const i of toParsedTimesIndexes) {
            let parsedTime = parsedTimes[i];
            if (foundTimeTypes.includes(parsedTime.timeType)) {
               proceed = false;
               break;
            } else {
               foundTimeTypes.push(parsedTime.timeType);
            }
         }
         if (proceed) {
            for (const i of toParsedTimesIndexes) {
               let parsedTime = parsedTimes[i];
               parsedTime.dateType = DateTypes.max;
               parsedTime.indexes.unshift(match.index);
               parsedTime.validMode = ValidModes.certified;
               parsedTime.prevalence += prevalence;
            }
         }
      }
      return parsedTimes;
   }),
   //Searchs for "every X time"
   new ParseCase(90, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/E\.+/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.nMonth, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index, this.expressions, parsedTimes, undefined, true);
         if (parsedTimes.length == 0) {
            continue;
         }
         parsedTimesIndexes.sort();
         let indexes = markIndexes.call(this, match.index, 1, true, false);
         let foundTimeTypes = [];
         for (const i in parsedTimesIndexes) {
            const index = parsedTimesIndexes[i];
            let parsedTime = parsedTimes[index];
            if (foundTimeTypes.includes(parsedTime.timeType)) {
               parsedTimesIndexes.splice(i);
               break;
            } else {
               indexes.push(...parsedTime.indexes);
               foundTimeTypes.push(parsedTime.timeType);
            }
         }
         let i = parsedTimesIndexes.length;
         while (i--) {
            const index = parsedTimesIndexes[i];
            let parsedTime = parsedTimes[index];
            parsedTime.dateType = DateTypes.period;
            parsedTime.indexes = indexes;
            parsedTime.validMode = ValidModes.certified;
            parsedTime.prevalence += prevalence;
            if (parsedTime.timeType == TimeTypes.nMonth) {
               parsedTime.number *= 30;
               parsedTime.timeType = TimeTypes.dates;
            }
         }
      }
      return parsedTimes;
   }),
   //Searchs for "every N minutes N times"
   new ParseCase(80, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/f{0,1}ntf{0,1}/g)];
      for (const match of matches) {
         const length = match[0].length;
         if (length == 4) {
            continue;
         }
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.nMonth, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, -1, match.index, this.expressions, parsedTimes, ValidModes.none);
         if (parsedTimesIndexes.length == 0) {
            parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index + length - 1, this.expressions, parsedTimes, ValidModes.none);
         }
         parsedTimesIndexes.sort();
         if (parsedTimesIndexes.length == 0) {
            continue;
         }
         let indexes = markIndexes.call(this, match.index, length, true, false);
         let foundTimeTypes = [];
         let proceed = true;
         for (const i in parsedTimesIndexes) {
            const index = parsedTimesIndexes[i];
            let parsedTime = parsedTimes[index];
            if (foundTimeTypes.includes(parsedTime.timeType)) {
               parsedTimesIndexes.splice(i);
               break;
            } else {
               foundTimeTypes.push(parsedTime.timeType);
               if (parsedTime.dateType == DateTypes.max) {
                  proceed = false;
               } else if (parsedTime.dateType == DateTypes.target) {
                  parsedTime.dateType = DateTypes.period;
               }
            }
         }
         if (!proceed) {
            continue;
         }

         if (parsedTimesIndexes.length > 0) {
            let context = processContexts(contextsData, indexes);
            let value;
            let first = this.expressions[match.index];
            if (first.regex_char == 'n') {
               value = +first.text
            } else {
               value = +this.expressions[match.index + 1].text;
            }
            let dependents = [];
            for (const index of parsedTimesIndexes) {
               dependents.push(parsedTimes[index]);
            }
            let parsedTime = new ParsedTime(DateTypes.max, TimeTypes.none, value, indexes, context, 50, { isOffset: true, dependents });
            for (const index of parsedTimesIndexes) {
               parsedTimes[index].owner = parsedTime;
            }
            parsedTimes.push(parsedTime);
         }
      }
      return parsedTimes;
   }),
   // Search for "in next X"
   new ParseCase(60, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/[CpP]{0,1}F/g)];
      for (const match of matches) {
         const allowedTypes = [TimeTypes.years, TimeTypes.dates, TimeTypes.hours, TimeTypes.minutes, TimeTypes.seconds];
         const length = match[0].length;
         parsedTimes.sort((a, b) => {
            return a.indexes[0] - b.indexes[0];
         });
         let parsedTimesIndexes = findAllMatchingParsedTimes(allowedTypes, 1, match.index + length - 1, this.expressions, parsedTimes, ValidModes.none);
         if (parsedTimesIndexes.length == 0) {
            continue;
         }
         parsedTimesIndexes = parsedTimesIndexes.sort();
         parsedTime = parsedTimes[parsedTimesIndexes[0]];
         if (parsedTime.validMode != ValidModes.notValid) {
            continue;
         }
         let indexes = markIndexes.call(this, match.index, length, true, false);
         parsedTime.indexes.unshift(...indexes);
         indexes = parsedTime.indexes;
         const context = processContexts(contextsData, indexes);
         const now = new Date();
         parsedTime.validMode = ValidModes.certified;
         parsedTime.isOffset = true;
         parsedTime.number = getDateProperty(now, parsedTime.timeType, true) + 1;
         let notFoundTimeTypes = [TimeTypes.dates, TimeTypes.hours, TimeTypes.minutes, TimeTypes.months, TimeTypes.seconds, TimeTypes.years];
         notFoundTimeTypes.splice(notFoundTimeTypes.indexOf(parsedTime.timeType), 1);
      }
      return parsedTimes;
   })
];

module.exports = {
   parseCases
}