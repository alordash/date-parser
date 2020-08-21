const { Expression } = require('./loader');

function numLength(num) {
    return Math.ceil(Math.log10(num + 1));
}

const MaxDistanceBetweenWords = 7;

var DateTypes = Object.freeze({ "target": 0, "periodic": 1, "end": 2 });

class ParsedTime {
    /**@type {DateTypes} */
    dateType;
    /**@type {Number} */
    number;
    /**@type {Number} */
    value;
    /**@type {Array.<Number>} */
    indexes;
    /**@type {Number} */
    prevalence;
    /**
     * @param {DateTypes} dateType 
     * @param {Number} number 
     * @param {Number} value 
     * @param {Array.<Number>} indexes 
     * @param {Number} prevalence 
     */
    constructor(dateType, number, value, indexes, prevalence) {
        this.dateType = dateType;
        this.number = number;
        this.value = value;
        this.indexes = indexes;
        this.prevalence = prevalence;
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

/**
 * @param {Date} date 
 * @param {ParsedTime} value 
 */
function setDateProperty(date, value, timeProperty) {
    switch (timeProperty) {
        case 'seconds':
            date.setSeconds(value.number);
            break;
        case 'minutes':
            date.setMinutes(value.number);
            break;
        case 'hours':
            date.setHours(value.number);
            break;
        case 'dates':
            date.setDate(value.number);
            break;
        case 'months':
            if (value.number != 0) {
                date.setDate(value.number);
            }
            date.setMonth(value.value - 1);
            break;
        case 'years':
            date.setFullYear(value.number);
            break;
        default:
            break;
    }
}

/**
 * @this {Array.<TimeList>} 
 * @param {ParsedTime} parsedTime 
 * @param {String} timeType 
 * @returns {Number} Index of suitable list
 */
function findSuitableTimeList(parsedTime, timeType) {
    let pos = 0;
    for (let index of parsedTime.indexes) {
        pos += index;
    }
    pos /= parsedTime.indexes.length;
    let index = 0;
    for (let timeList of this) {
        let _pos = 0;
        let count = 0;
        for (const _timeType in timeList) {
            if (timeList.hasOwnProperty(_timeType) && typeof (timeList[_timeType]) != 'undefined') {
                const time = timeList[_timeType];
                for (let index of time.indexes) {
                    _pos += index;
                    count++;
                }
            }
        }
        _pos /= Math.max(1, count);
        if (Math.abs(pos - _pos) <= MaxDistanceBetweenWords) {
            if (timeList.hasOwnProperty(timeType)) {
                if (typeof (timeList[timeType]) == 'undefined') {
                    timeList[timeType] = parsedTime;
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
 * @param {String} timeType 
 */
function addNewParsedTime(parsedTime, timeType) {
    let index = findSuitableTimeList.call(this, parsedTime, timeType);
    if (index == this.length) {
        let timeList = new TimeList();
        timeList[timeType] = parsedTime;
        this.push(timeList);
    } else {
        this[index][timeType] = parsedTime;
    }
}

/**
 * @this {{regchars: String, expressions: Array.<Expression>}}
 * @param {Number} index 
 * @param {Boolean} replacePrepositions 
 * @returns {Array.<Number>}
 */
function markIndexes(index, end, replacePrepositions) {
    if (replacePrepositions && this.regchars[index - 1] == 'p') {
        index--;
        end++;
    }
    let indexes = [];
    for (let i = Math.max(0, index); i < Math.min(index + end, this.expressions.length); i++) {
        indexes.push(i);
    }
    return indexes;
}

let parseCases = [
    new ParseCase(10, function findSeconds(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/ns/g)];
        for (let match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "seconds");
        }
        return timeLists;
    }),
    new ParseCase(10, function findMinutes(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/nm/g)];
        for (let match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "minutes");
        }
        return timeLists;
    }),
    new ParseCase(10, function findDates(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/nd/g)];
        for (let match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "dates");
        }
        return timeLists;
    }),
    new ParseCase(10, function findMonths(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/nM/g)];
        for (let match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "months");
        }
        return timeLists;
    }),
    new ParseCase(10, function findYears(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/Ny/g)];
        for (let match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "years");
        }
        return timeLists;
    }),
    new ParseCase(10, function findYearsSmall(timeLists, prevalence) {
        let matches = [...this.regchars.matchAll(/ny/g)];
        for (let match of matches) {
            let num = +this.expressions[match.index].text;
            let base = Math.pow(10, numLength(num));
            num += Math.floor(new Date().getFullYear() / base) * base;
            let indexes = markIndexes.call(this, match.index, 2, true);
            let parsedTime = new ParsedTime(DateTypes.target, num, this.expressions[match.index + 1].value, indexes, prevalence);
            addNewParsedTime.call(timeLists, parsedTime, "years");
        }
        return timeLists;
    })
];

/**
 * @param {Array.<Expression>} expressions 
 * @param {Number} prevalence 
 * @returns {Array.<TimeList>} object containing all found times 
 */
function extractTime(expressions, prevalence) {
    let timeLists = [];
    let expressionsSet = {
        regchars: '',
        expressions
    };
    for (const expression of expressions) {
        expressionsSet.regchars += expression.regex_char;
    }

    for (let parseCase of parseCases) {
        if (prevalence > parseCase.prevalence) {
            timeLists = parseCase.parseFunction.call(expressionsSet, timeLists, parseCase.prevalence);
        }
    }
    console.log(expressionsSet.regchars);
    return timeLists;
}

module.exports = {
    DateTypes,
    extractTime,
    setDateProperty
}