const { Expression, LoadSeparators } = require('./loader');
const { isDateType, ValidModes, ParsedTime, ContextsData, extractTime } = require('./date-cases');
const { extractRegexChars } = require('./regex-extractor');
const { proceedNotUsedContexts } = require('./contexts-handling');
const MaxDistanceBetweenWords = 3;

class ParsedDate {
   /**@type {TimeSet} */
   target_date;
   /**@type {TimeSet} */
   period_time;
   /**@type {TimeSet} */
   max_date;
   /**@type {String} */
   string;
   /**@type {Number} */
   confidence;
   /**@type {Array.<Number>} */
   contexts;

	/**
	 * @param {Date} target_date 
	 * @param {Number} period_time 
	 * @param {Date} max_date 
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
}

class TimeList {
   /**@type {ParsedTime} */
   seconds;
   /**@type {ParsedTime} */
   minutes;
   /**@type {ParsedTime} */
   hours;
   /**@type {ParsedTime} */
   dates;
   /**@type {ParsedTime} */
   months;
   /**@type {ParsedTime} */
   years;
   constructor() {
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
      if (TS[PT.dateType].hasOwnProperty(timeType)) {
         const timeProperty = TS[PT.dateType][timeType];
         if (typeof (timeProperty) != 'undefined') {
            indexes = indexes.concat(timeProperty.indexes);
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
 * @param {Array.<ParsedTime>} parsedTimes 
 * @returns {Array.<ParsedTime>}
 */
function clearNotValidParsedTimes(parsedTimes) {
   let i = parsedTimes.length;
   while (i--) {
      if (parsedTimes[i].validMode == ValidModes.notValid) {
         parsedTimes.splice(i, 1);
      }
   }
   return parsedTimes;
}

/**
 * @this {Array.<TimeSet>} 
 * @param {ParsedTime} parsedTime 
 * @param {ContextsData} contextsData 
 * @returns {Number} Index of suitable list
 */
function findSuitableTimeList(parsedTime, contextsData) {
   let index = 0;
   for (const timeSet of this) {
      if (distanceBetweenParsedTimeAndTimeList(parsedTime, timeSet) <= MaxDistanceBetweenWords
         && parsedTime.context == timeSet.context) {
         if (timeSet[parsedTime.dateType].hasOwnProperty(parsedTime.timeType)) {
            if (typeof (timeSet[parsedTime.dateType][parsedTime.timeType]) == 'undefined') {
               timeSet[parsedTime.dateType][parsedTime.timeType] = parsedTime;
               break;
            }
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
 */
function addNewParsedTime(parsedTime, contextsData) {
   let index = findSuitableTimeList.call(this, parsedTime, contextsData);
   if (index == this.length) {
      let timeSet = new TimeSet(parsedTime.context);
      let timeList = new TimeList();
      timeList[parsedTime.timeType] = parsedTime;
      timeSet[parsedTime.dateType] = timeList
      this.push(timeSet);
   } else {
      this[index][parsedTime.dateType][parsedTime.timeType] = parsedTime;
   }
}

/**
 * @param {Array.<Expression>} composedWords
 * @returns {Array.<Expression>}
 */
function FixComposedWordsEdges(composedWords) {
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
      if (lastWord.isSeparator) {
         lastWord.text = lastWord.text.substring(0, lastWord.text.length - 1);
      }
   }
   return composedWords;
}

/**
 * Extracts date from string with defined precision.
 * @param {String} string 
 * @param {Number} errorLimit From 0.0 to 1.0, the less — the less results
 * @param {Number} minimumPrevalence From 0 to 100, the less — the more results
 * @returns {Array.<ParsedDate>} parsed date.
 */
function parseDate(string, errorLimit, minimumPrevalence) {
   if (typeof (errorLimit) == 'undefined') {
      errorLimit = 1;
   }
   if (typeof (minimumPrevalence) == 'undefined') {
      minimumPrevalence = 100;
   }
   let expressions = extractRegexChars(string, errorLimit);
   let expressionsForExtracting = [];
   for (const expr of expressions) {
      expressionsForExtracting.push(Object.assign(new Expression(), expr));
   }
   let casesResult = extractTime(expressionsForExtracting, minimumPrevalence);
   let parsedTimes = casesResult.parsedTimes;
   parsedTimes = clearNotValidParsedTimes(parsedTimes);
   parsedTimes.sort(function (a, b) {
      return a.indexes[0] - b.indexes[0];
   })
   let contextsData = casesResult.contextsData;
   for (const index of casesResult.separatingWords) {
      expressions[index].isSeparator = true;
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
      addNewParsedTime.call(timeSets, parsedTime, contextsData);
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
               if (timeList.hasOwnProperty(timeProperty)) {
                  const time = timeList[timeProperty];
                  if (typeof (time) != 'undefined') {
                     indexes.push(...time.indexes);
                     confidence += time.prevalence;
                  }
               }
            }
         }
      }
      let contexts = [];
      let composedWords = [];
      const context = contextsData.contexts[timeSet.context];
      const start = context.start;
      const end = context.end;
      for (let j = start; j <= end; j++) {
         let expression = expressions[j];
         if (indexes.indexOf(j) == -1) {
            composedWords.push(expression);
            if (!contexts.includes(expression.context)) {
               contexts.push(expression.context);
            }
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
         composedWords = FixComposedWordsEdges(composedWords);
         composedWords.forEach(v => {
            composedString += v.text + ' ';
         });
      }
      parsedDate.string = composedString.trim();
   }
   return parsedDates;
}

module.exports = {
   TimeSet,
   extractRegexChars,
   parseDate
}