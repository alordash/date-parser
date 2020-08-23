const { Expression, LoadExpressions, LoadSeparators } = require('./loader');
const { DateTypes, TimeTypes, ParsedTime, ContextsData, extractTime } = require('./date-cases');
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

class TimeSet {
    /**@type {TimeList} */
    target_date;
    /**@type {TimeList} */
    period_time;
    /**@type {TimeList} */
    repeat_date;
    /**@type {TimeList} */
    max_date;
    /**@type {Number} */
    context;
    constructor(context) {
        this.target_date = new TimeList();
        this.period_time = new TimeList();
        this.repeat_date = new TimeList();
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
                    let match = word.match(expression.text);
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
 * @param {Date} date 
 * @param {ParsedTime} parsedTime 
 * @param {TimeTypes} timeType 
 * @returns {Date}
 */
function setDateProperty(date, parsedTime, timeType) {
    if (typeof (date) == 'undefined') {
        date = new Date();
    }
    switch (timeType) {
        case TimeTypes.seconds:
            date.setSeconds(parsedTime.number);
            break;
        case TimeTypes.minutes:
            date.setMinutes(parsedTime.number);
            break;
        case TimeTypes.hours:
            date.setHours(parsedTime.number);
            break;
        case TimeTypes.dates:
            date.setDate(parsedTime.number);
            break;
        case TimeTypes.months:
            if (parsedTime.number != 0) {
                date.setDate(parsedTime.number);
            }
            if (parsedTime.value != 0) {
                date.setMonth(parsedTime.value - 1);
            }
            break;
        case TimeTypes.years:
            date.setFullYear(parsedTime.number);
            break;
        default:
            break;
    }
    return date
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
 * @returns {Array.<Expression>}
 */
function FixComposedWordsEdges(composedWords) {
    if (composedWords[0].regex_char == 'I') {
        composedWords = composedWords.slice(1);
    }
    if (composedWords[composedWords.length - 1].regex_char == 'I') {
        composedWords = composedWords.slice(0, composedWords.length - 1);
    }
    return composedWords;
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
    let expressionsForExtracting = [];
    for (const expr of expressions) {
        expressionsForExtracting.push(Object.assign(new Expression(), expr));
    }
    let casesResult = extractTime(expressionsForExtracting, minimumPrevalence);
    let parsedTimes = casesResult.parsedTimes;
    let contextsData = casesResult.contextsData;
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
    for (timeSet of timeSets) {
        let result = {
            target_date: undefined,
            period_time: undefined,
            repeat_date: undefined,
            max_date: undefined
        }

        let confidence = 0;
        let indexes = [];
        for (const dateType in timeSet) {
            if (timeSet.hasOwnProperty(dateType)) {
                const timeList = timeSet[dateType]
                for (const timeProperty in timeList) {
                    if (timeList.hasOwnProperty(timeProperty)) {
                        const time = timeList[timeProperty];
                        if (typeof (time) != 'undefined') {
                            result[dateType] = setDateProperty(result[dateType], time, timeProperty);
                            indexes.push(...time.indexes);
                            confidence += time.prevalence;
                        }
                    }
                }
            }
        }
        let composedWords = [];
        let composedString = '';
        let context = contextsData.contexts[timeSet.context];
        const start = context.start;
        const end = context.end;
        for (let j = 0; j < expressions.length; j++) {
            const expression = expressions[j];
            if (indexes.indexOf(j) == -1
                && ((start <= j && j <= end) || IsSuitableContext(timeSet.context, expression.context, contextsData))) {
                composedWords.push(expression);
            }
        }
        if (composedWords.length > 0) {
            composedWords = FixComposedWordsEdges(composedWords);
            composedWords.forEach(v => {
                composedString += v.text + ' ';
            });
        }
        parsedDates.push(new ParsedDate(
            result.target_date,
            result.period_time,
            result.repeat_date,
            result.max_date,
            composedString.trim(),
            confidence
        ));
    }
    return parsedDates;
}

module.exports = {
    extractWords,
    parseDate
}