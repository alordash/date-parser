const { ConvertedWord, Expression, LoadMonthSize, LoadSeparators } = require('../loader');

/**
 * @param {String} str 
 * @param {Number} index 
 * @param {String} char 
 */
function replaceAt(str, index, char) {
   return str.substring(0, index) + char + str.substring(index + 1);
}

const DateTypes = Object.freeze({
   target: "target_date",
   period: "period_time",
   max: "max_date"
});

/**
 * 
 * @param {*} property 
 * @returns {Boolean} 
 */
function isDateType(property) {
   for (const dateType in DateTypes) {
      if (DateTypes.hasOwnProperty(dateType) && DateTypes[dateType] == property) {
         return true;
      }
   }
   return false;
}

const TimeTypes = Object.freeze({
   seconds: "seconds",
   minutes: "minutes",
   hours: "hours",
   dates: "dates",
   months: "months",
   nMonth: "nMonth",
   years: "years",
   none: "none"
});

/**
 * 
 * @param {*} property 
 * @returns {Boolean} 
 */
function isTimeType(property) {
   for (const timeType in TimeTypes) {
      if (TimeTypes.hasOwnProperty(timeType)) {
         if (TimeTypes[timeType] == property) {
            return true;
         }
      }
   }
   return false;
}

/**
 * @param {Date} date 
 * @param {TimeTypes} timeType 
 * @param {Number} value 
 * @returns {Date} 
 */
function setDateProperty(date, timeType, value) {
   switch (timeType) {
      case TimeTypes.dates:
         date.setUTCDateDate(value);
         break;
      case TimeTypes.hours:
         date.setUTCHours(value);
         break;
      case TimeTypes.minutes:
         date.setUTCMinutes(value);
         break;
      case TimeTypes.months:
         date.setUTCMonth(value);
         break;
      case TimeTypes.seconds:
         date.setUTCSeconds(value);
         break;
      case TimeTypes.years:
         date.setUTCFullYear(value);
         break;
      default:
         break;
   }
   return date;
}

/**
 * @param {Date} date  
 * @param {TimeTypes} timeType 
 * @param {Boolean} 
 * @returns {Number}
 */
function getDateProperty(date, timeType, increaseMonth) {
   switch (timeType) {
      case TimeTypes.seconds:
         return date.getUTCSeconds();
      case TimeTypes.minutes:
         return date.getUTCMinutes();
      case TimeTypes.hours:
         return date.getUTCHours();
      case TimeTypes.dates:
         return date.getUTCDate();
      case TimeTypes.months:
         return date.getUTCMonth() + +increaseMonth;
      case TimeTypes.years:
         return date.getUTCFullYear();
      default:
         return -1;
   }
}

const ValidModes = Object.freeze({
   certified: 1,
   notCertified: 0,
   notValid: -1,
   none: -100
});

class ParsedTime {
   /**@type {DateTypes} */
   dateType;
   /**@type {TimeTypes} */
   timeType;
   /**@type {Number} */
   number;
   /**@type {Array.<Number>} */
   indexes;
   /**@type {Number} */
   context;
   /**@type {Number} */
   prevalence;
   /**@type {ValidModes} */
   validMode;
   /**@type {Boolean} */
   isOffset;
   /**@type {Boolean} */
   isFixed;
   /**@type {ParsedTime} */
   owner;
   /**@type {Array.<ParsedTime>} */
   dependents;
   /**@type {Boolean} */
   isUsed;
   /**
    * @param {DateTypes} dateType 
    * @param {TimeTypes} timeType 
    * @param {Number} number 
    * @param {Array.<Number>} indexes 
    * @param {Number} context 
    * @param {Number} prevalence 
    * @param {{}} options 
    */
   constructor(dateType, timeType, number, indexes, context, prevalence, options) {
      this.dateType = dateType;
      this.timeType = timeType;
      this.number = number;
      this.indexes = indexes;
      this.context = context;
      this.prevalence = prevalence;
      if (options != undefined) {
         this.validMode = options.validMode == undefined ? ValidModes.notCertified : options.validMode;
         this.isOffset = options.isOffset == undefined ? false : options.isOffset;
         this.isFixed = options.isFixed == undefined ? false : options.isFixed;
         this.owner = options.owner == undefined ? undefined : options.owner;
         this.dependents = options.dependents == undefined ? [] : options.dependents;
      } else {
         this.validMode = ValidModes.notCertified;
         this.isOffset = this.isFixed = false;
         this.owner = undefined;
         this.dependents = [];
      }
      this.isUsed = false;
   }
}

class ParseCase {
   /**@type {Number} */
   prevalence;
   /**@type {Function} */
   parseFunction;
   /**
    * @param {Number} prevalence 
    * @param {Function} parseFunction 
    */
   constructor(prevalence, parseFunction) {
      this.prevalence = prevalence;
      this.parseFunction = parseFunction;
   }
}

class Context {
   /**@type {Number} */
   start;
   /**@type {Number} */
   end;
   /**
    * @param {Number} start 
    * @param {Number} end 
    */
   constructor(start, end) {
      this.start = start;
      this.end = end;
   }
}

class ContextsData {
   /**@type {Array.<Context>} */
   contexts = [];
   /**@type {Array.<Number>} */
   usedContexts = [];

   constructor() {
   }
}

/**
 * @this {Array.<Expression>} 
 * @returns {{separatingWords: Array.<Number>, contexts: Array.<Context>}}
 */
function splitContext() {
   const separators = LoadSeparators();
   let contexts = [];
   let separatingWords = [];
   let start = 0;
   let i = 0;
   while (i < this.length) {
      let expression = this[i];
      if (expression.regex_char == '!' || expression.regex_char == 'I') {
         contexts.push(new Context(start, i));
         start = i + 1;
      } else {
         for (const separator of separators.expressions) {
            let matches = [...expression.text.matchAll(new RegExp(separator.text, 'g'))];
            if (matches.length == 1 && matches[0].index == matches[0].input.length - 1) {
               expression.text = expression.text.substring(0, expression.text.length - 1);
               contexts.push(new Context(start, i));
               start = i + 1;
               separatingWords.push(i);
            }
         }
      }
      i++
   }
   if (start < this.length) {
      contexts.push(new Context(start, this.length - 1));
   }
   return { separatingWords, contexts };
}

/**
 * @this {{regchars: String, expressions: Array.<Expression>}}
 * @param {Number} index 
 * @param {Number} end 
 * @param {Boolean} replacePrepositions 
 * @param {Boolean} allPrepositions 
 * @param {boolean} includeOffsetPrepositions
 * @returns {Array.<Number>}
 */
function markIndexes(index, end, replacePrepositions, allPrepositions, includeOffsetPrepositions = false) {
   let prevChar = this.regchars[index - 1];
   if (replacePrepositions && (prevChar == 'p' || (allPrepositions && prevChar == 'P') || (includeOffsetPrepositions && prevChar == 'C'))) {
      this.regchars = replaceAt(this.regchars, index - 1, '.');
      index--;
      end++;
   }
   let indexes = [];
   for (let i = Math.max(0, index); i < Math.min(index + end, this.expressions.length); i++) {
      this.regchars = replaceAt(this.regchars, i, '.');
      indexes.push(i);
   }
   return indexes;
}

/**
 * @param {ContextsData} contextsData
 * @param {Array.<Number>} indexes 
 * @returns {Number} 
 */
function findCorrespondingContext(contextsData, indexes) {
   let i = indexes.length;
   const contexts = contextsData.contexts;
   while (i--) {
      let index = indexes[i];
      let j = contexts.length;
      while (j--) {
         let start = contexts[j].start;
         let end = contexts[j].end;
         if (start <= index && index <= end) {
            return j;
         }
      }
   }
   return -1;
}

/**
 * @param {ContextsData} contextsData
 * @param {Array.<Number>} indexes 
 * @returns {Number} 
 */
function processContexts(contextsData, indexes) {
   let context = findCorrespondingContext(contextsData, indexes);
   if (!contextsData.usedContexts.includes(context)) {
      contextsData.usedContexts.push(context);
   }
   return context;
}

function checkHours(value) {
   return 0 <= value && value <= 24;
}
function checkMinutes(value) {
   return 0 <= value && value <= 59;
}
function isLeapYear(year) {
   return (year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0);
}
function checkDate(date, month, year) {
   const monthSize = LoadMonthSize(month);
   return monthSize != null && 0 <= date && date <= (isLeapYear(year) ? monthSize.leap_count : monthSize.normal_count);
}
function checkMonth(month) {
   return 0 <= month && month <= 12;
}
function checkYear(year) {
   return 0 <= year;
}
function processHour(hour, partOfDay) {
   if (0 < partOfDay) {
      if (partOfDay <= 4) {
         let l1 = (6 * partOfDay) % 24;
         let l2 = (6 * (partOfDay + 1)) % 24;
         if ((l1 < hour && hour <= l1 + 6) || (l2 <= hour && hour <= l2 + 6)) {
            if (hour >= 12) {
               return hour - 12;
            } else {
               return hour + 12;
            }
         }
      } else if (partOfDay <= 6) {
         if (hour >= 12 && partOfDay == 5) {
            return hour - 12;
         } else if (hour < 12 && partOfDay == 6) {
            return hour + 12;
         }
      }
      return hour;
   }
}

function GetDaysToDayOfWeek(dayOfWeek) {
   let now = new Date();
   let dif = dayOfWeek - (now.getDay() + 1);
   if (dif < 0) {
      dif += 7;
   }
   return dif;
}

/**
 * @param {Array.<ParsedTime>} parsedTimes 
 * @param {Number} index 
 * @returns {Array.<Number>}
 */
function findParsedTimesByIndex(parsedTimes, index) {
   let i = parsedTimes.length;
   let result = [];
   while (i--) {
      if (parsedTimes[i].indexes.includes(index)) {
         result.push(i);
      }
   }
   return result;
}

/**
 * @param {ParsedTime} parsedTime 
 * @param {Array.<TimeTypes>} allowedTypes 
 * @param {ValidModes} ignoreValidMode 
 * @param {Boolean} ignorePrepositions 
 * @param {Array.<Expression>} expressions 
 * @param {Array.<Number>} newIndexes 
 * @returns {Boolean} 
 */
function parsedTimeMatches(parsedTime, allowedTypes, ignoreValidMode, ignorePrepositions, expressions, newIndexes) {
   return allowedTypes.includes(parsedTime.timeType) && parsedTime.validMode != ignoreValidMode
      && (!ignorePrepositions || (ignorePrepositions && expressions[parsedTime.indexes[0]].regex_char != 'p'));
}

/**
 * @param {Array.<TimeTypes>} allowedTypes 
 * @param {Number} step 
 * @param {Number} start 
 * @param {Array.<Expression>} expressions 
 * @param {Array.<ParsedTime>} parsedTimes 
 * @param {ValidModes} ignoreValidMode 
 * @param {Boolean} ignorePrepositions 
 * @returns {Array.<Number>}
 */
function findAllMatchingParsedTimes(allowedTypes, step, start, expressions, parsedTimes, ignoreValidMode = ValidModes.certified, ignorePrepositions = false) {
   let i = start + step;
   let proceed = true;
   let result = [];
   while (proceed && (0 <= i && i < expressions.length)) {
      let indexes = findParsedTimesByIndex(parsedTimes, i);
      if (indexes.length > 0) {
         let newIndexes = [];
         for (const index of indexes) {
            const parsedTime = parsedTimes[index];
            if (parsedTimeMatches(parsedTime, allowedTypes, ignoreValidMode, ignorePrepositions, expressions, newIndexes)) {
               if (!result.includes(index) && proceed) {
                  newIndexes.push(index);
               }
            } else {
               proceed = false;
               newIndexes = [];
               break;
            }
         }
         if (newIndexes.length > 0) {
            result.push(...newIndexes);
         }
      } else {
         proceed = false;
      }
      i += step;
   }
   return result;
}


/**
 * @param {Array.<ParsedTime>} parsedTimes 
 * @param {Array.<Number>} indexes 
 * @returns {Array.<Number>}
 */
function findParsedTimesIndexByIndexes(parsedTimes, indexes) {
   let result = [];
   for (const i in parsedTimes) {
      const parsedTime = parsedTimes[i];
      if (parsedTime.indexes.every((x, i) => {
         return x == indexes[i];
       })) {
         result.push(i);
      }
   }
   return result;
}

module.exports = {
   DateTypes,
   isDateType,
   TimeTypes,
   isTimeType,
   setDateProperty,
   getDateProperty,
   ValidModes,
   ParsedTime,
   Context,
   ContextsData,

   replaceAt,
   ParseCase,
   splitContext,
   markIndexes,
   findCorrespondingContext,
   processContexts,
   checkHours,
   checkMinutes,
   checkDate,
   checkMonth,
   checkYear,
   processHour,
   GetDaysToDayOfWeek,
   findParsedTimesByIndex,
   parsedTimeMatches,
   findAllMatchingParsedTimes,
   findParsedTimesIndexByIndexes
}