const { Expression, LoadSeparators } = require('./loader');

function numLength(num) {
    return Math.ceil(Math.log10(num + 1));
}

const DateTypes = Object.freeze({
    target: "target_date",
    period: "period_time",
    repeat: "repeat_date",
    max: "max_date"
});

const TimeTypes = Object.freeze({
    seconds: "seconds",
    minutes: "minutes",
    hours: "hours",
    dates: "dates",
    months: "months",
    years: "years"
});

class ParsedTime {
    /**@type {DateTypes} */
    dateType;
    /**@type {TimeTypes} */
    timeType;
    /**@type {Number} */
    number;
    /**@type {Number} */
    value;
    /**@type {Array.<Number>} */
    indexes;
    /**@type {Number} */
    context;
    /**@type {Number} */
    prevalence;
    /**
     * @param {DateTypes} dateType 
     * @param {String} timeType 
     * @param {Number} number 
     * @param {Number} value 
     * @param {Array.<Number>} indexes 
     * @param {Number} context
     * @param {Number} prevalence 
     */
    constructor(dateType, timeType, number, value, indexes, context, prevalence) {
        this.dateType = dateType;
        this.timeType = timeType;
        this.number = number;
        this.value = value;
        this.indexes = indexes;
        this.context = context;
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

class Context {
    /**@type {Number} */
    start;
    /**@type {Number} */
    end;
    /**
     * @param {Number} start 
     * @param {Number} end 
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

/**
 * @this {Array.<Expression>} 
 * @returns {Array.<Context>}
 */
function splitContext() {
    const separators = LoadSeparators();
    let result = [];
    let start = 0;
    let i = 0;
    while (i < this.length) {
        const expression = this[i];
        for (const separator of separators.expressions) {
            let matches = [...expression.text.matchAll(new RegExp(separator.text))];
            if (matches.length == 1 && matches[0].index == matches[0].input.length - 1) {
                expression.text = expression.text.substring(0, expression.text.length - 1);
                result.push(new Context(start, i));
                start = i + 1;
            }
        }
        i++
    }
    if (start < this.length) {
        result.push(new Context(start, this.length - 1));
    }
    return result;
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

/**
 * 
 * @param {Array.<Number>} indexes 
 * @param {Array.<Context>} contexts 
 * @returns {Number} 
 */
function findCorrespondingContext(indexes, contexts) {
    let i = indexes.length;
    while (i--) {
        let index = indexes[i];
        let j = contexts.length;
        while (j--) {
            let start = contexts[j].start;
            let end = contexts[j].end;
            if (start <= index && index <= end) {
                return j;
            }
        }
    }
    return -1;
}

const numberAndWordPrevalence = 50;
const numberAndWordParseCases = [
    new ParseCase(numberAndWordPrevalence, function findSeconds(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/ns/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findMinutes(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/nm/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findHours(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/nh/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findDates(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/nd/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findMonths(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/nM/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findYears(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/Ny/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    }),
    new ParseCase(numberAndWordPrevalence, function findYearsSmall(parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/ny/g)];
        for (const match of matches) {
            let num = +this.expressions[match.index].text;
            let base = Math.pow(10, numLength(num));
            num += Math.floor(new Date().getFullYear() / base) * base;
            let max = this.expressions[match.index + 1].maximum;
            if (num <= max || max == 0) {
                let indexes = markIndexes.call(this, match.index, 2, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    })
];

/**
 * @param {Number} value 
 */
function checkHours(value) {
    return 0 <= value && value <= 24;
}
/**
 * @param {Number} value 
 */
function checkMinutes(value) {
    return 0 <= value && value <= 59;
}

const parseCases = [
    //Searchs for HH:MM cases
    new ParseCase(100, function (parsedTimes, contexts, prevalence) {
        let matches = [...this.regchars.matchAll(/t/g)];
        for (const match of matches) {
            let vals = this.expressions[match.index].text.split(/[:.]/);
            let hours = +vals[0];
            let minutes = +vals[1];
            if (checkHours(hours) && checkMinutes(minutes)) {
                let indexes = markIndexes.call(this, match.index, 1, true);
                let context = findCorrespondingContext(indexes, contexts);
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, hours, 0, indexes, context, prevalence));
                parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, 0, indexes, context, prevalence));
            }
        }
        return parsedTimes;
    })
];

/**
 * @param {Array.<Expression>} expressions 
 * @param {Number} minimumPrevalence the less — the more results
 * @returns {Array.<ParsedTime>} object containing all found times 
 */
function extractTime(expressions, minimumPrevalence) {
    let parsedTimes = [];
    let expressionsSet = {
        regchars: '',
        expressions
    };
    for (const expression of expressions) {
        expressionsSet.regchars += expression.regex_char;
    }
    let contexts = splitContext.call(expressions);

    for (const parseCase of parseCases) {
        if (parseCase.prevalence >= minimumPrevalence) {
            parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contexts, parseCase.prevalence);
        }
    }
    if (numberAndWordPrevalence >= minimumPrevalence) {
        for (const parseCase of numberAndWordParseCases) {
            parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contexts, parseCase.prevalence);
        }
    }
    return parsedTimes;
}

module.exports = {
    DateTypes,
    TimeTypes,
    ParsedTime,
    extractTime
}