const { Expression } = require('./loader');

function numLength(num) {
    return Math.ceil(Math.log10(num + 1));
}

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
    /**@type {Array.<ParsedTime>} */
    seconds = [];
    /**@type {Array.<ParsedTime>} */
    minutes = [];
    /**@type {Array.<ParsedTime>} */
    hours = [];
    /**@type {Array.<ParsedTime>} */
    dates = [];
    /**@type {Array.<ParsedTime>} */
    months = [];
    /**@type {Array.<ParsedTime>} */
    years = [];
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
 * @this {{regchars: String, expressions: Array.<Expression>}}
 * @param {Number} index 
 * @param {Boolean} replacePrepositions 
 * @returns {Array.<Number>}
 */
function replaceWithDots(index, end, replacePrepositions) {
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
    new ParseCase(10, function findSeconds(timeList, prevalence) {
        let matches = this.regchars.matchAll(/ns/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.seconds.push(new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    }),
    new ParseCase(10, function findMinutes(timeList, prevalence) {
        let matches = this.regchars.matchAll(/nm/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.minutes.push(new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    }),
    new ParseCase(10, function findDates(timeList, prevalence) {
        let matches = this.regchars.matchAll(/nd/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.dates.push(new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    }),
    new ParseCase(10, function findMonths(timeList, prevalence) {
        let matches = this.regchars.matchAll(/nM/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.months.push(new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    }),
    new ParseCase(10, function findYears(timeList, prevalence) {
        let matches = this.regchars.matchAll(/Ny/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.years.push(new ParsedTime(DateTypes.target, +this.expressions[match.index].text, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    }),
    new ParseCase(10, function findYearsSmall(timeList, prevalence) {
        let matches = this.regchars.matchAll(/ny/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let num = +this.expressions[match.index].text;
                let base = Math.pow(10, numLength(num));
                num += Math.floor(new Date().getFullYear() / base) * base;
                let indexes = replaceWithDots.call(this, match.index, 2, true);
                timeList.years.push(new ParsedTime(DateTypes.target, num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
            return timeList;
        }
        return 0;
    })
];

/**
 * @param {Array.<Expression>} expressions 
 * @param {Number} prevalence 
 * @returns {TimeList} object containing all found times 
 */
function extractTime(expressions, prevalence) {
    let timeList = new TimeList();
    let expressionsSet = {
        regchars: '',
        expressions
    };
    for (const expression of expressions) {
        expressionsSet.regchars += expression.regex_char;
    }

    for (let parseCase of parseCases) {
        if (prevalence > parseCase.prevalence) {
            timeList = parseCase.parseFunction.call(expressionsSet, timeList, parseCase.prevalence);
        }
    }
    console.log(expressionsSet.regchars);
    return timeList;
}

module.exports = {
    DateTypes,
    extractTime,
    setDateProperty
}