const { Expression, LoadExpressions } = require('./loader');
const { DateTypes, ParsedTime, extractTime, setDateProperty } = require('./date-cases');
const { distance } = require('@alordash/damerau-levenshtein');

const MaxDistanceBetweenWords = 7;

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
 * @this {Array.<TimeList>} 
 * @param {ParsedTime} parsedTime 
 * @returns {Number} Index of suitable list
 */
function findSuitableTimeList(parsedTime) {
    let pos = 0;
    for (const index of parsedTime.indexes) {
        pos += index;
    }
    pos /= parsedTime.indexes.length;
    let index = 0;
    for (const timeList of this) {
        let _pos = 0;
        let count = 0;
        for (const _timeType in timeList) {
            if (timeList.hasOwnProperty(_timeType) && typeof (timeList[_timeType]) != 'undefined') {
                const time = timeList[_timeType];
                for (const index of time.indexes) {
                    _pos += index;
                    count++;
                }
            }
        }
        _pos /= Math.max(1, count);
        if (Math.abs(pos - _pos) <= MaxDistanceBetweenWords) {
            if (timeList.hasOwnProperty(parsedTime.timeType)) {
                if (typeof (timeList[parsedTime.timeType]) == 'undefined') {
                    timeList[parsedTime.timeType] = parsedTime;
                    break;
                }
            }
        }
        index++;
    }
    return index;
}

/**
 * @this {Array.<TimeList>}
 * @param {ParsedTime} parsedTime 
 */
function addNewParsedTime(parsedTime) {
    let index = findSuitableTimeList.call(this, parsedTime);
    if (index == this.length) {
        let timeList = new TimeList();
        timeList[parsedTime.timeType] = parsedTime;
        this.push(timeList);
    } else {
        this[index][parsedTime.timeType] = parsedTime;
    }
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
    let parsedTimes = extractTime(expressions, 100);
    let timeLists = [];
    for (const parsedTime of parsedTimes) {
        addNewParsedTime.call(timeLists, parsedTime);
    }
    let parsedDates = [];
    for (timeList of timeLists) {
        let target_date = new Date();
        let confidence = 0;
        let indexes = [];
        let dateString = '';
        for (const timeProperty in timeList) {
            if (timeList.hasOwnProperty(timeProperty)) {
                const time = timeList[timeProperty];
                if (typeof (time) != 'undefined') {
                    setDateProperty(target_date, time, timeProperty);
                    indexes.push(...time.indexes);
                    confidence += time.prevalence;
                }
            }
        }
        for (let j = 0; j < expressions.length; j++) {
            if (indexes.indexOf(j) == -1) {
                dateString += expressions[j].text + ' ';
            }
        }
        parsedDates.push(new ParsedDate(target_date, 0, new Date(), dateString.trim(), confidence));
    }
    return parsedDates;
}

module.exports = {
    extractWords,
    parseDate
}