const { Expression } = require('./loader');

function numLength(num) {
    return Math.ceil(Math.log10(num + 1));
}

const DateTypes = Object.freeze({
    "target": 0,
    "periodic": 1,
    "end": 2
});

class ParsedTime {
    /**@type {DateTypes} */
    dateType;
    /**@type {String} */
    timeType;
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
    constructor(dateType, timeType, number, value, indexes, prevalence) {
        this.dateType = dateType;
        this.timeType = timeType;
        this.number = number;
        this.value = value;
        this.indexes = indexes;
        this.prevalence = prevalence;
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
    new ParseCase(10, function findSeconds(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/ns/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "seconds", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findMinutes(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/nm/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "minutes", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findHours(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/nh/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "hours", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findDates(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/nd/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "dates", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findMonths(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/nM/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "months", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findYears(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/Ny/g)];
        for (const match of matches) {
            let indexes = markIndexes.call(this, match.index, 2, true);
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "years", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(10, function findYearsSmall(parsedTimes, prevalence) {
        let matches = [...this.regchars.matchAll(/ny/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let base = Math.pow(10, numLength(num));
            num += Math.floor(new Date().getFullYear() / base) * base;
            let indexes = markIndexes.call(this, match.index, 2, true);
            let max = this.expressions[match.index + 1].maximum
            if (num <= max || max == 0) {
                parsedTimes.push(new ParsedTime(DateTypes.target, "years", num, this.expressions[match.index + 1].value, indexes, prevalence));
            }
        }
        return parsedTimes;
    })
];

/**
 * @param {Array.<Expression>} expressions 
 * @param {Number} prevalence 
 * @returns {Array.<ParsedTime>} object containing all found times 
 */
function extractTime(expressions, prevalence) {
    let parsedTimes = [];
    let expressionsSet = {
        regchars: '',
        expressions
    };
    for (const expression of expressions) {
        expressionsSet.regchars += expression.regex_char;
    }

    for (const parseCase of parseCases) {
        if (prevalence > parseCase.prevalence) {
            parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, parseCase.prevalence);
        }
    }
    console.log(expressionsSet.regchars);
    return parsedTimes;
}

module.exports = {
    DateTypes,
    ParsedTime,
    extractTime,
    setDateProperty
}