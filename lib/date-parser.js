const { Expression, LoadExpressions } = require('./loader');
const { distance } = require('@alordash/damerau-levenshtein');

class ParsedDate {
    /**@type {Number} */
    confidence;
    /**@type {Date} */
    target_date;
    /**@type {Number} */
    period_time;
    /**@type {Date} */
    max_date;

    /**
     * @param {Date} target_date 
     * @param {Number} period_time 
     * @param {Date} max_date 
     */
    constructor(target_date, period_time, max_date) {
        this.target_date = target_date;
        this.period_time = period_time;
        this.max_date = max_date;
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
    let parsingRules = LoadExpressions();
    let k = words.length;
    while (k--) {
        let word = words[k].toLowerCase();
        let found = false;
        let i = parsingRules.length;
        let expression;
        while (i-- && !found) {
            let parsingRule = parsingRules[i];
            let j = parsingRule.expressions.length;
            while (j-- && !found) {
                expression = parsingRule.expressions[j];
                if (parsingRule.is_regex) {
                    let match = word.match(expression.text);
                    if(match != null && match.length == 1) {
                        found = true;
                    }
                } else if (distance(expression.text, word) <= expression.errors_limit * errorLimit) {
                    found = true;
                }
            }
        }
        if (!found) {
            expression = new Expression(words[k], '.', 0, 0);
        }
        words[k] = expression;
    }
    return words;
}

/**
 * Extracts date from string with defined precision.
 * @param {String} string 
 * @param {Number} errorLimit 
 * @returns {ParsedDate} parsed date.
 */
function parseDate(string, errorLimit) {
    if (typeof (errorLimit) == 'undefined') {
        errorLimit = 1;
    }
    let words = extractWords(string, errorLimit);
    return 0;
}

module.exports = {
    extractWords,
    parseDate
}