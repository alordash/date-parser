const { Expression, LoadExpressions } = require('./loader');
const { DateTypes, ParsedTime, extractTime } = require('./date-cases');
const { distance } = require('@alordash/damerau-levenshtein');

const MaxDistanceBetweenWords = 3;

class ParsedDate {
    /**@type {Date} */
    target_date;
    /**@type {Number} */
    period_time;
    /**@type {Date} */
    repeat_date;
    /**@type {Date} */
    max_date;
    /**@type {String} */
    string;
    /**@type {Number} */
    confidence;

    /**
     * @param {Date} target_date 
     * @param {Number} period_time 
     * @param {Number} repeat_date
     * @param {Date} max_date 
     * @param {String} string
     * @param {Number} confidence
     */
    constructor(target_date, period_time, repeat_date, max_date, string, confidence) {
        this.target_date = target_date;
        this.period_time = period_time;
        this.repeat_date = repeat_date;
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
 * @param {ParsedTime} PT 
 * @param {TimeList} TL 
 * @returns {Number}
 */
function distanceBetweenParsedTimeAndTimeList(PT, TL) {
    let indexes = [];
    for (const timeType in TL) {
        if (TL.hasOwnProperty(timeType)) {
            const timeProperty = TL[timeType];
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
        return min > max ? min - max : Math.min.apply(null, PT.indexes) - Math.max.apply(null, indexes);
    }
    return 0;
}

/**
 * @this {Array.<TimeList>} 
 * @param {ParsedTime} parsedTime 
 * @returns {Number} Index of suitable list
 */
function findSuitableTimeList(parsedTime) {
    let index = 0;
    for (const timeList of this) {
        if (distanceBetweenParsedTimeAndTimeList(parsedTime, timeList) <= MaxDistanceBetweenWords) {
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
 * @param {Date} date 
 * @param {ParsedTime} parsedTime 
 * @param {String} timeProperty 
 * @returns {Date}
 */
function setDateProperty(date, parsedTime, timeProperty) {
    if (typeof (date) == 'undefined') {
        date = new Date();
    }
    switch (timeProperty) {
        case 'seconds':
            date.setSeconds(parsedTime.number);
            break;
        case 'minutes':
            date.setMinutes(parsedTime.number);
            break;
        case 'hours':
            date.setHours(parsedTime.number);
            break;
        case 'dates':
            date.setDate(parsedTime.number);
            break;
        case 'months':
            if (parsedTime.number != 0) {
                date.setDate(parsedTime.number);
            }
            if (parsedTime.value != 0) {
                date.setMonth(parsedTime.value - 1);
            }
            break;
        case 'years':
            date.setFullYear(parsedTime.number);
            break;
        default:
            break;
    }
    return date
}

/**
 * Extracts date from string with defined precision.
 * @param {String} string 
 * @param {Number} errorLimit the less — the less results
 * @param {Number} minimumPrevalence the less — the more results
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
    let parsedTimes = extractTime(expressions, minimumPrevalence);
    let timeLists = [];
    for (const parsedTime of parsedTimes) {
        addNewParsedTime.call(timeLists, parsedTime);
    }
    let parsedDates = [];
    for (timeList of timeLists) {
        let target_date;
        let period_time;
        let repeat_date;
        let max_date;

        let confidence = 0;
        let indexes = [];
        let dateString = '';
        for (const timeProperty in timeList) {
            if (timeList.hasOwnProperty(timeProperty)) {
                const time = timeList[timeProperty];
                if (typeof (time) != 'undefined') {
                    target_date = setDateProperty(target_date, time, timeProperty);
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
        parsedDates.push(new ParsedDate(target_date, period_time, repeat_date, max_date, dateString.trim(), confidence));
    }
    return parsedDates;
}

module.exports = {
    extractWords,
    parseDate
}