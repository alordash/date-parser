const { Expression, LoadExpressions } = require('./loader');
const { ParsedTime, Context, ContextsData, extractTime } = require('./date-cases');
const { distance } = require('@alordash/damerau-levenshtein');
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

	/**
	 * @param {Date} target_date 
	 * @param {Number} period_time 
	 * @param {Date} max_date 
	 * @param {String} string
	 * @param {Number} confidence
	 */
   constructor(target_date, period_time, max_date, string, confidence) {
      this.target_date = target_date;
      this.period_time = period_time;
      this.max_date = max_date;
      this.string = string;
      this.confidence = confidence;
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
 * Converts string to array of Expressions according to rules in ./expressions/*.csv files
 * @param {String} string 
 * @param {Number} errorLimit 
 * @returns {Array.<Expression>} array of Expressions
 */
function extractWords(string, errorLimit) {
   if (typeof (errorLimit) == 'undefined') {
      errorLimit = 1;
   }
   let words = string.split(' ');
   let expressions = [];
   const parsingRules = LoadExpressions();
   let k = words.length;
   while (k--) {
      let word = words[k].toLowerCase();
      let match = word.match(/[,.;:!?]/);
      if (match != null && match.index + match[0].length == word.length) {
         word = word.substring(0, match.index);
      }
      let found = false;
      let i = parsingRules.length;
      let expression;
      while (i-- && !found) {
         let parsingRule = parsingRules[i];
         let j = parsingRule.expressions.length;
         let expressions = parsingRule.expressions;
         while (j-- && !found) {
            expression = Object.assign(new Expression(), expressions[j]);
            if (parsingRule.is_regex) {
               let regexp = new RegExp(expression.text, 'g');
               let match = word.match(regexp);
               if (match != null && match.length == 1) {
                  found = true;
                  expression.text = words[k];
               }
            } else if (distance(expression.text, word) <= expression.errors_limit * errorLimit) {
               found = true;
               expression.text = words[k];
            }
         }
      }
      if (!found) {
         expression = new Expression(words[k], '.', 0, 0, 0);
      }
      expressions[k] = expression;
   }
   return expressions;
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
 * @param {ContextsData} contextsData 
 * @param {Number} index 
 * @param {Number} step 
 * @returns {Number} 
 */
function findLastSuitableContext(contextsData, index, step) {
   while (index >= 0 && index < contextsData.contexts.length) {
      index += step;
      if (contextsData.usedContexts.includes(index)) {
         return index - step;
      }
   }
   return index - step;
}

/**
 * @param {Number} thisContext 
 * @param {Number} targetContext 
 * @param {ContextsData} contextsData 
 * @returns {Boolean}
 */
function IsSuitableContext(thisContext, targetContext, contextsData) {
   const start = Math.min(thisContext, targetContext) + 1;
   const end = Math.max(thisContext, targetContext);
   for (let i = start; i <= end; i++) {
      if (contextsData.usedContexts.includes(i)) {
         return false;
      }
   }
   return true;
}

/**
 * @param {Array.<Expression>} composedWords
 * @param {Array.<Number>} separatingWords
 * @returns {Array.<Expression>}
 */
function FixComposedWordsEdges(composedWords, separatingWords) {
   if (composedWords[0].regex_char == '!' || composedWords[0].regex_char == 'I') {
      composedWords = composedWords.slice(1);
   }
   let end = composedWords.length - 1;
   let lastWord = composedWords[end];
   if (lastWord.regex_char == '!' || lastWord.regex_char == 'I') {
      composedWords = composedWords.slice(0, end);
      end = composedWords.length - 1;
      lastWord = composedWords[end];
   }
   if (separatingWords.includes(lastWord.index)) {
      lastWord.text = lastWord.text.substring(0, lastWord.text.length - 1);
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
   let expressions = extractWords(string, errorLimit);
   let expressionsForExtracting = [];
   for (const expr of expressions) {
      expressionsForExtracting.push(Object.assign(new Expression(), expr));
   }
   let casesResult = extractTime(expressionsForExtracting, minimumPrevalence);
   let parsedTimes = casesResult.parsedTimes;
   parsedTimes.sort(function (a, b) {
      return a.indexes[0] - b.indexes[0];
   })
   let contextsData = casesResult.contextsData;
   const separatingWords = casesResult.separatingWords;
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
         if (timeSet.hasOwnProperty(dateType)) {
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
      let composedWords = [];
      let composedString = '';
      const startIndex = findLastSuitableContext(contextsData, timeSet.context, -1);
      const start = contextsData.contexts[startIndex].start;
      const endIndex = findLastSuitableContext(contextsData, timeSet.context, 1);
      const end = contextsData.contexts[endIndex].start;
      for (let j = 0; j < expressions.length; j++) {
         const expression = expressions[j];
         if (indexes.indexOf(j) == -1
            && ((start <= j && j <= end) || IsSuitableContext(timeSet.context, expression.context, contextsData))) {
            expression.index = j;
            composedWords.push(expression);
         }
      }
      if (composedWords.length > 0) {
         composedWords = FixComposedWordsEdges(composedWords, separatingWords);
         composedWords.forEach(v => {
            composedString += v.text + ' ';
         });
      }
      for (let i = startIndex; i <= endIndex; i++) {
         if (!contextsData.usedContexts.includes(i)) {
            contextsData.usedContexts.push(i);
         }
      }
      parsedDates.push(new ParsedDate(
         timeSet.target_date,
         timeSet.period_time,
         timeSet.max_date,
         composedString.trim(),
         confidence
      ));
   }
   return parsedDates;
}

module.exports = {
   TimeSet,
   extractWords,
   parseDate
}