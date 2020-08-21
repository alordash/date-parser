const { Expression, LoadExpressions } = require('./loader');
const { extractTime, setDateProperty } = require('./date-cases');
const { distance } = require('@alordash/damerau-levenshtein');

class ParsedDate {
    /**@type {Date} */
    target_date;
    /**@type {Number} */
    period_time;
    /**@type {Date} */
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
 * @returns {Array.<ParsedDate>} parsed date.
 */
function parseDate(string, errorLimit) {
    if (typeof (errorLimit) == 'undefined') {
        errorLimit = 1;
    }
    let expressions = extractWords(string, errorLimit);
    let timeList = extractTime(expressions, 100);
    let min = Number.MAX_SAFE_INTEGER;
    for (const timeProperty in timeList) {
        if (timeList.hasOwnProperty(timeProperty)) {
            const length = timeList[timeProperty].length;
            if(length < min && length > 0) {
                min = length;
            }
        }
    }
    let parsedDates = [];
    for (let i = 0; i < min; i++) {
        let date = new Date();
        let confidence = 0;
        let indexes = [];
        let dateString = '';
        for (const timeProperty in timeList) {
            if (timeList.hasOwnProperty(timeProperty)) {
                const time = timeList[timeProperty];
                if(time.length > 0) {
                    setDateProperty(date, time[i], timeProperty);
                    indexes.push(...time[i].indexes);
                    confidence += time[i].prevalence;
                }
            }
        }
        for (let j = 0; j < expressions.length; j++) {
            if(indexes.indexOf(j) == -1) {
                dateString += expressions[j].text + ' ';
            }
        }
        parsedDates.push(new ParsedDate(date, 0, new Date(), dateString.trim(), confidence));
    }
    return parsedDates;
}

module.exports = {
    extractWords,
    parseDate
}