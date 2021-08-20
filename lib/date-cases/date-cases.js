const { ConvertedWord, Expression, LoadMonthSize, LoadSeparators } = require('../loader');
const numberAndWordParseCases = require('./parse-cases/number-and-word-parse-cases');
const defaultParseCases = require('./parse-cases/common-parse-cases');
const finalParseCases = require('./parse-cases/final-parse-cases');

const {
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
   splitContext
} = require('./parse-cases-processing');

/**
 * @param {Array.<Expression>} expressions 
 * @returns {{parsedTimes: Array.<ParsedTime>, contextsData: ContextsData, separatingWords: Array.<Number>}} object containing all found times 
 */
function extractTime(expressions) {
   let parsedTimes = [];
   let expressionsSet = {
      regchars: '',
      expressions
   };
   for (const expression of expressions) {
      expressionsSet.regchars += expression.regex_char;
   }
   let contextsData = new ContextsData();
   let res = splitContext.call(expressions);
   contextsData.contexts = res.contexts;
   let separatingWords = res.separatingWords;
   for (const parseCase of defaultParseCases.parseCases) {
      parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contextsData, parseCase.prevalence);
   }
   for (const parseCase of numberAndWordParseCases.parseCases) {
      parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contextsData, parseCase.prevalence);
   }
   for (const parseCase of finalParseCases.parseCases) {
      parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contextsData, parseCase.prevalence);
   }
   return { parsedTimes, contextsData, separatingWords };
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
   extractTime
};