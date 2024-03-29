const { ConvertedWord, Expression, LoadSeparators, SetSeparatorsDirectoryPath, SetExpressionsDirectoryPath } = require('./loader');
const { isDateType, isTimeType, getDateProperty, ValidModes, ParsedTime, ContextsData, extractTime, TimeTypes, DateTypes } = require('./date-cases/date-cases');
const { extractRegexChars } = require('./regex-extractor');
const { proceedNotUsedContexts } = require('./contexts-handling');
const MaxDistanceBetweenWords = 3;

class ParsedDate {
   /**@type {TimeList} */
   target_date;
   /**@type {TimeList} */
   period_time;
   /**@type {TimeList} */
   max_date;
   /**@type {String} */
   string;
   /**@type {Number} */
   confidence;
   /**@type {Array.<Number>} */
   contexts;

   /**
    * @param {TimeList} target_date 
    * @param {TimeList} period_time 
    * @param {TimeList} max_date 
    * @param {String} string 
    * @param {Number} confidence 
    * @param {Array.<Number>} contexts 
    */
   constructor(target_date, period_time, max_date, string, confidence, contexts) {
      this.target_date = target_date;
      this.period_time = period_time;
      this.max_date = max_date;
      this.string = string;
      this.confidence = confidence;
      this.contexts = contexts;
   }

   /**@returns {String} */
   toString() {
      return this.string;
   }

   /**@returns {{target_date: Date, period_time: Date, max_date: Date}} */
   valueOf() {
      const now = new Date();
      const date0 = new Date(0);

      let target_date = new TimeList();
      let period_time = new TimeList();
      let max_date = new TimeList();
      for (const timeType in this.target_date) {
         if (this.target_date[timeType] == undefined) {
            target_date[timeType] = getDateProperty(now, timeType, false);
         } else {
            target_date[timeType] = this.target_date[timeType];
         }
      }
      for (const timeType in this.period_time) {
         if (this.period_time[timeType] == undefined) {
            period_time[timeType] = getDateProperty(date0, timeType, false);
         } else {
            period_time[timeType] = this.period_time[timeType];
            if (timeType == TimeTypes.dates) {
               period_time[timeType]++;
            }
         }
      }
      for (const timeType in this.max_date) {
         if (this.max_date[timeType] == undefined) {
            max_date[timeType] = getDateProperty(now, timeType, false);
         } else {
            max_date[timeType] = this.max_date[timeType];
         }
      }
      target_date = new Date(
         target_date.years,
         target_date.months,
         target_date.dates,
         target_date.hours,
         target_date.minutes,
         target_date.seconds
      );
      period_time = new Date(
         period_time.years,
         period_time.months,
         period_time.dates,
         period_time.hours,
         period_time.minutes,
         period_time.seconds
      );
      max_date = new Date(
         max_date.years,
         max_date.months,
         max_date.dates,
         max_date.hours,
         max_date.minutes,
         max_date.seconds
      );
      return {
         target_date,
         period_time,
         max_date
      };
   }
}

class TimeList {
   /**@type {Number} */
   seconds;
   /**@type {Number} */
   minutes;
   /**@type {Number} */
   hours;
   /**@type {Number} */
   dates;
   /**@type {Number} */
   months;
   /**@type {Number} */
   years;
   /**@type {Boolean} */
   isOffset;
   /**@type {Boolean} */
   isFixed;
   constructor() {
      this.isOffset = false;
      this.isFixed = false;
   }
}

class TimeSet {
   /**@type {TimeList} */
   target_date;
   /**@type {TimeList} */
   period_time;
   /**@type {TimeList} */
   max_date;
   /**@type {Number} */
   context;
   constructor(context) {
      this.target_date = new TimeList();
      this.period_time = new TimeList();
      this.max_date = new TimeList();
      this.context = context;
   }
}

/**
 * @param {ParsedTime} PT 
 * @param {TimeSet} TS 
 * @returns {Number}
 */
function distanceBetweenParsedTimeAndTimeList(PT, TS) {
   let indexes = [];
   for (const timeType in TS[PT.dateType]) {
      if (isTimeType(timeType)) {
         if (TS[PT.dateType].hasOwnProperty(timeType)) {
            const timeProperty = TS[PT.dateType][timeType];
            if (timeProperty != undefined) {
               indexes = indexes.concat(timeProperty.indexes);
            }
         }
      }
   }
   if (!PT.indexes.some(v => {
      return indexes.indexOf(v) != -1;
   })) {
      let max = Math.max.apply(null, PT.indexes);
      let min = Math.min.apply(null, indexes);
      if (min == Infinity) {
         return 0;
      }
      return min > max ? min - max : Math.min.apply(null, PT.indexes) - Math.max.apply(null, indexes);
   }
   return 0;
}

/**
 * @param {Array} a 
 * @param {Array} b 
 * @returns {Boolean} 
 */
function arrayEqual(a, b) {
   if (a.length != b.length) {
      return false;
   }
   for (const i in a) {
      if (a[i] !== b[i]) {
         return false;
      }
   }
   return true;
}

/**
 * @param {ParsedTime} parsedTime 
 * @param {Array.<ParsedTime>} parsedTimes 
 * @returns {Array.<ParsedTime>} 
 */
function findNeighbourParsedTimes(parsedTime, parsedTimes) {
   let res = [];
   for (const checkPT of parsedTimes) {
      if (parsedTime !== checkPT
         && arrayEqual(checkPT.indexes, parsedTime.indexes)) {
         res.push(checkPT);
      }
   }
   return res;
}

/**
 * @param {ParsedTime} parsedTime 
 * @param {TimeSet} timeSet 
 * @returns {Boolean} 
 */
function parsedTimeIsSuitable(parsedTime, timeSet) {
   return distanceBetweenParsedTimeAndTimeList(parsedTime, timeSet) <= MaxDistanceBetweenWords
      && parsedTime.context == timeSet.context
      && timeSet[parsedTime.dateType].hasOwnProperty(parsedTime.timeType)
      && timeSet[parsedTime.dateType][parsedTime.timeType] == undefined;
}

/**
 * @this {Array.<TimeSet>} 
 * @param {ParsedTime} parsedTime 
 * @param {ContextsData} contextsData 
 * @param {Array.<ParsedTime>} parsedTimes
 * @returns {Number} Index of suitable list
 */
function findSuitableTimeList(parsedTime, contextsData, parsedTimes) {
   let index = 0;
   for (let timeSet of this) {
      if (parsedTimeIsSuitable(parsedTime, timeSet)) {
         let neighbours = findNeighbourParsedTimes(parsedTime, parsedTimes);
         let proceed = true;
         for (const neighbour of neighbours) {
            if (!parsedTimeIsSuitable(neighbour, timeSet) && !neighbour.isUsed) {
               proceed = false;
               break;
            }
         }
         if (proceed) {
            timeSet[parsedTime.dateType][parsedTime.timeType] = parsedTime;
            break;
         }
      }
      index++;
   }
   return index;
}

/**
 * @this {Array.<TimeSet>} 
 * @param {ParsedTime} parsedTime 
 * @param {ContextsData} contextsData 
 * @param {Array.<ParsedTime>} parsedTimes 
 */
function addNewParsedTime(parsedTime, contextsData, parsedTimes) {
   if (parsedTime.owner != undefined) {
      return;
   }
   if (parsedTime.dateType == DateTypes.max
      && parsedTime.dependents.length > 0) {
      let timeSet = new TimeSet(parsedTime.context);
      let periodTimeList = new TimeList();
      let maxTimeList = new TimeList();
      var m = parsedTime.number;
      for (const dependentParsedTime of parsedTime.dependents) {
         let timeType = dependentParsedTime.timeType;
         periodTimeList[timeType] = dependentParsedTime;
         maxTimeList[timeType] = Object.assign(new ParsedTime(), parsedTime);
         maxTimeList[timeType].number = dependentParsedTime.number * m;
      }
      maxTimeList.isFixed = parsedTime.isFixed;
      maxTimeList.isOffset = parsedTime.isOffset;
      timeSet[DateTypes.period] = periodTimeList;
      timeSet[DateTypes.max] = maxTimeList;
      this.push(timeSet);
      return;
   }

   parsedTime.isUsed = true;
   let index = findSuitableTimeList.call(this, parsedTime, contextsData, parsedTimes);
   if (index == this.length) {
      let timeSet = new TimeSet(parsedTime.context);
      let timeList = new TimeList();
      timeList[parsedTime.timeType] = parsedTime;
      timeSet[parsedTime.dateType] = timeList;
      if (parsedTime.isOffset) {
         timeSet[parsedTime.dateType].isOffset = true;
      }
      if (parsedTime.isFixed) {
         timeSet[parsedTime.dateType].isFixed = true;
      }
      this.push(timeSet);
   } else {
      this[index][parsedTime.dateType][parsedTime.timeType] = parsedTime;
      if (parsedTime.isOffset) {
         this[index][parsedTime.dateType].isOffset = true;
      }
      if (parsedTime.isFixed) {
         this[index][parsedTime.dateType].isFixed = true;
      }
   }
}

/**
 * @param {Array.<Expression>} composedWords
 * @param {Array.<String>} originalWords 
 * @returns {Array.<Expression>}
 */
function FixComposedWordsEdges(composedWords, originalWords) {
   if (composedWords[0].regex_char == '!' || composedWords[0].regex_char == 'I') {
      composedWords = composedWords.slice(1);
   }
   if (composedWords.length > 0) {
      let end = composedWords.length - 1;
      let lastWord = composedWords[end];
      if (lastWord.regex_char == '!' || lastWord.regex_char == 'I') {
         composedWords = composedWords.slice(0, end);
         end = composedWords.length - 1;
         lastWord = composedWords[end];
      }
      if (lastWord.is_separator) {
         let indexes = lastWord.convertedWord.indexes;
         var text = originalWords[indexes[indexes.length - 1]];
         originalWords[indexes[indexes.length - 1]] = text.substring(0, text.length - 1);
      }
   }
   return composedWords;
}

/**
 * @param {Array.<String>} words 
 * @returns {Array.<String>}
 */
function splitNewLines(words) {
   for (let i = 0; i < words.length; i++) {
      let word = words[i];
      if (word != '\n') {
         let index = word.indexOf('\n');
         if (index != -1) {
            let p1 = word.substring(0, index);
            let p2 = word.substring(index, index + 1);
            let p3 = word.substring(index + 1);
            words.splice(i + 1, 0, p2, p3);
            words[i] = word = p1;
         }
      }
   }
   return words;
}

/**
 * Extracts date from string with defined precision.
 * @param {String} string 
 * @param {Number} errorLimit From 0.0 to 1.0, the less — the less results
 * @param {Number} minimumPrevalence From 0 to 100, the less — the more results
 * @returns {Array.<ParsedDate>} parsed date.
 */
function parseDate(string, errorLimit = 1, minimumPrevalence = 50) {
   let words = splitNewLines(string.split(/ +/));
   let convertedWords = [];
   for (let i = 0; i < words.length; i++) {
      let word = words[i];
      convertedWords[i] = new ConvertedWord(word, [i]);
   }
   return parse(convertedWords, words, errorLimit, minimumPrevalence);
}

/**
 * Extracts date from array of ConvertedWord with defined precision.
 * @param {Array.<ConvertedWord>} words 
 * @param {Number} errorLimit From 0.0 to 1.0, the less — the less results
 * @param {Number} minimumPrevalence From 0 to 100, the less — the more results
 * @param {String} originalString Words from this string will be used for forming schedule's text
 * @returns {Array.<ParsedDate>} parsed date.
 */
function wordsParseDate(words, errorLimit = 1, minimumPrevalence = 50, originalString) {
   let originalWords = splitNewLines(originalString.split(/ +/));
   return parse(words, originalWords, errorLimit, minimumPrevalence);
}

/**
 * @param {Array.<ConvertedWord>} words 
 * @param {Array.<String>} originalWords 
 * @param {Number} errorLimit 
 * @param {Number} minimumPrevalence 
 * @returns {Array.<ParsedDate>}
 */
function parse(words, originalWords, errorLimit, minimumPrevalence) {
   let expressions = extractRegexChars(words, errorLimit);
   let expressionsForExtracting = [];
   for (const expr of expressions) {
      expressionsForExtracting.push(Object.assign(new Expression(), expr));
   }
   let casesResult = extractTime(expressionsForExtracting);
   let parsedTimes = casesResult.parsedTimes;
   parsedTimes = parsedTimes.filter(x => {
      return x.validMode != ValidModes.notValid && x.prevalence >= minimumPrevalence;
   });
   parsedTimes.sort(function (a, b) {
      return a.indexes[0] - b.indexes[0];
   });
   let contextsData = casesResult.contextsData;
   for (let i = 0; i < contextsData.usedContexts.length; i++) {
      let index = contextsData.usedContexts[i];
      if (!parsedTimes.find(x => { return x.context == index; })) {
         contextsData.usedContexts.splice(contextsData.usedContexts.indexOf(index), 1);
         i--;
      }
   }
   for (const index of casesResult.separatingWords) {
      expressions[index].is_separator = true;
   }
   let i = contextsData.contexts.length;
   while (i--) {
      const context = contextsData.contexts[i];
      for (let j = context.start; j <= context.end; j++) {
         expressions[j].context = i;
      }
   }
   let timeSets = [];
   for (const parsedTime of parsedTimes) {
      addNewParsedTime.call(timeSets, parsedTime, contextsData, parsedTimes);
   }
   let parsedDates = [];
   contextsData.usedContexts.sort((a, b) => {
      return a - b;
   });
   for (timeSet of timeSets) {
      let confidence = 0;
      let indexes = [];
      for (const dateType in timeSet) {
         if (isDateType(dateType) && timeSet.hasOwnProperty(dateType)) {
            const timeList = timeSet[dateType]
            for (const timeProperty in timeList) {
               if (isTimeType(timeProperty) && timeList.hasOwnProperty(timeProperty)) {
                  const time = timeList[timeProperty];
                  if (time != undefined) {
                     indexes.push(...time.indexes);
                     confidence += time.prevalence;
                  }
               }
            }
         }
      }
      let contexts = [timeSet.context];
      let composedWords = [];
      const context = contextsData.contexts[timeSet.context];
      const start = context.start;
      const end = context.end;
      for (let j = start; j <= end; j++) {
         let expression = expressions[j];
         if (indexes.indexOf(j) == -1) {
            composedWords.push(expression);
         }
      }
      for (const composedWord of composedWords) {
         if (!contextsData.usedContexts.includes(composedWord.context)) {
            contextsData.usedContexts.push(composedWord.context);
         }
      }
      parsedDates.push(new ParsedDate(
         timeSet.target_date,
         timeSet.period_time,
         timeSet.max_date,
         composedWords,
         confidence,
         contexts
      ));
   }
   let notUsedContexts = [];
   i = contextsData.contexts.length;
   while (i--) {
      notUsedContexts.push(i);
   }
   for (usedContextIndex of contextsData.usedContexts) {
      notUsedContexts.splice(notUsedContexts.indexOf(usedContextIndex), 1);
   }
   let separators = LoadSeparators();
   proceedNotUsedContexts.call(parsedDates, separators, notUsedContexts, contextsData, expressions);
   for (let parsedDate of parsedDates) {
      let composedString = '';
      let composedWords = parsedDate.string;
      if (composedWords.length > 0) {
         composedWords = FixComposedWordsEdges(composedWords, originalWords);
         for (const composedWord of composedWords) {
            for (const index of composedWord.convertedWord.indexes) {
               composedString += originalWords[index] + ' ';
            }
         }
      }
      parsedDate.string = composedString.trim();
      for (const timeType in parsedDate.target_date) {
         let val = parsedDate.target_date[timeType];
         if (val != undefined && val.number != undefined) {
            if (timeType == TimeTypes.months) {
               val.number--;
            }
            parsedDate.target_date[timeType] = val.number;
         }
      }
      for (const timeType in parsedDate.period_time) {
         let val = parsedDate.period_time[timeType];
         if (val != undefined && val.number != undefined) {
            if (timeType == TimeTypes.months) {
               val.number--;
            }
            parsedDate.period_time[timeType] = val.number;
         }
      }
      for (const timeType in parsedDate.max_date) {
         let val = parsedDate.max_date[timeType];
         if (val != undefined && val.number != undefined) {
            if (timeType == TimeTypes.months) {
               val.number--;
            }
            parsedDate.max_date[timeType] = val.number;
         }
      }
   }
   for (let i = 0; i < parsedDates.length; i++) {
      let parsedDate = parsedDates[i];
      if (parsedDate.string == '') {
         if (i > 0) {
            let prev = parsedDates[i - 1];
            if (prev.string != '') {
               parsedDate.string = prev.string;
               continue;
            }
         }
         if (i < parsedDates.length - 1) {
            let next = parsedDates[i + 1];
            if (next.string != '') {
               parsedDate.string = next.string;
            }
         }
      }
   }
   return parsedDates;
}

module.exports = {
   TimeSet,
   ParsedDate,
   TimeList,
   extractRegexChars,
   parseDate,
   wordsParseDate,
   SetSeparatorsDirectoryPath,
   SetExpressionsDirectoryPath
}