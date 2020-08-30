const { Expression, LoadExpressions, LoadSeparators } = require('./loader');
const { isDateType, ValidModes, ParsedTime, ContextsData, extractTime } = require('./date-cases');
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
 * Converts string to array of Expressions according to rules in ./expressions/*.csv files
 * @param {String} string 
 * @param {Number} errorLimit 
 * @returns {Array.<Expression>} array of Expressions
 */
function extractRegexChars(string, errorLimit) {
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
 * @param {Number} contextIndex 
 * @param {Array.<ParsedDate>} parsedDates 
 * @returns {Number}
 */
function findParsedDateByContext(contextIndex, parsedDates) {
   let i = parsedDates.length;
   while (i--) {
      const parsedDate = parsedDates[i];
      if (parsedDate.contexts.includes(contextIndex)) {
         return i;
      }
   }
   return -1;
}

/**
 * @this {Array.<ParsedDate>} 
 * @param {Number} parsedDateIndex 
 * @param {Number} index 
 * @param {ContextsData} contextsData 
 * @param {Array.<Expression>} expressions 
 * @param {Boolean} atEnd 
 * @param {String} regexChar 
 * @param {String} endChar 
 * @returns {Boolean} 
 */
function addWordsFromContext(parsedDateIndex, index, contextsData, expressions, atEnd, regexChar, endChar) {
   let result = false;
   let lastChar;
   let lastExpression;
   if (atEnd) {
      lastExpression = expressions[contextsData.contexts[index - 1].end];
      lastChar = lastExpression.text;
   } else {
      lastExpression = expressions[contextsData.contexts[index].start];
      lastChar = lastExpression.text;
   }
   lastChar = lastChar[lastChar.length - 1];
   if (typeof (regexChar) != 'undefined') {
      if (lastExpression.regex_char == regexChar) {
         let words = [];
         let context = contextsData.contexts[index];
         for (let i = context.start; i <= context.end; i++) {
            words.push(expressions[i]);
         }
         if (atEnd) {
            this[parsedDateIndex].string.push(...words);
         } else {
            this[parsedDateIndex].string.unshift(...words);
         }
         result = true;
      }
   } else if (typeof (endChar) != 'undefined') {
      if (lastChar == endChar) {
         let words = [];
         let context = contextsData.contexts[index];
         for (let i = context.start; i <= context.end; i++) {
            words.push(expressions[i]);
         }
         if (atEnd) {
            this[parsedDateIndex].string.push(...words);
         } else {
            if (endChar == '.') {
               this[parsedDateIndex].string.unshift(...words);
               let nextWordText = this[parsedDateIndex].string[1].text;
               this[parsedDateIndex].string[1].text = nextWordText[0].toUpperCase() + nextWordText.substring(1);
            } else {
               this[parsedDateIndex].string.unshift(...words);
            }
         }
         result = true;
      }
   }
   if (result) {
      this[parsedDateIndex].contexts.push(index);
   }
   return result;
}

/** 
 * @this {Array.<ParsedDate>} 
 * @param {Array.<Number>} notUsedContexts 
 * @param {ContextsData} contextsData 
 * @param {Array.<Expression>} expressions 
 * @param {String} regexChar 
 * @param {String} endChar 
 * @returns {Array.<Number>} 
 */
function fillNotUsedContexts(notUsedContexts, contextsData, expressions, regexChar, endChar) {
   let result = [];
   for (const index of notUsedContexts) {
      let proceed = true;
      if (index > 0) {
         let parsedDateIndex = findParsedDateByContext(index - 1, this);
         if (parsedDateIndex != -1) {
            if (addWordsFromContext.call(this, parsedDateIndex, index, contextsData, expressions, true, regexChar, endChar)) {
               proceed = false;
            }
         }
      }
      if (proceed && index < contextsData.contexts.length - 1) {
         let parsedDateIndex = findParsedDateByContext(index + 1, this);
         if (parsedDateIndex != -1) {
            if (addWordsFromContext.call(this, parsedDateIndex, index, contextsData, expressions, false, regexChar, endChar)) {
               proceed = false;
            }
         }
      }
      if (proceed) {
         result.push(index);
      }
   }
   return result;
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
   let newContexts = [];
   let separators = LoadSeparators();
   let started = false;
   while (!started || newContexts.length != notUsedContexts.length) {
      if (started) {
         notUsedContexts = newContexts;
      }
      newContexts = fillNotUsedContexts.call(parsedDates, notUsedContexts, contextsData, expressions, 'I', undefined);
      for (const separator of separators.expressions) {
         newContexts = fillNotUsedContexts.call(parsedDates, newContexts, contextsData, expressions, undefined, separator.text[separator.text.length - 1]);
      }
      started = true;
   }
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