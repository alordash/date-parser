const { Expression, LoadExpressions } = require('./loader');
const { extractDates } = require('./date-cases');
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
    let expressions = [];
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
            let expressions = parsingRule.expressions;
            while (j-- && !found) {
                expression = Object.assign({}, expressions[j]);
                if (parsingRule.is_regex) {
                    let match = word.match(expression.text);
                    if (match != null && match.length == 1) {
                        found = true;
                        expression.text = word;
                    }
                } else if (distance(expression.text, word) <= expression.errors_limit * errorLimit) {
                    found = true;
                    expression.text = word;
                }
            }
        }
        if (!found) {
            expression = new Expression(word, '.', 0, 0, 0);
        }
        expressions[k] = expression;
    }
    return expressions;
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
    let expressions = extractWords(string, errorLimit);
    return extractDates(expressions, 100);
}

module.exports = {
    extractWords,
    parseDate
}