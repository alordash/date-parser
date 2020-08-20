const { Expression } = require('./loader');

function numLength(num) {
    return Math.ceil(Math.log10(num + 1));
}

class ParsedTime {
    /**@type {Number} */
    number;
    /**@type {Number} */
    value;
    /**@type {Number} */
    index;
    constructor(number, value, index) {
        this.number = number;
        this.value = value;
        this.index = index;
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
            if(value.number != 0) {
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

let parseCases = [
    new ParseCase(10, function findSeconds(timeList) {
        let matches = this.regchars.matchAll(/ns/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                timeList.seconds.push(new ParsedTime(+this.words[match.index].text, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
    }),
    new ParseCase(10, function findMinutes(timeList) {
        let matches = this.regchars.matchAll(/nm/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                timeList.minutes.push(new ParsedTime(+this.words[match.index].text, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
    }),
    new ParseCase(10, function findDates(timeList) {
        let matches = this.regchars.matchAll(/nd/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                timeList.dates.push(new ParsedTime(+this.words[match.index].text, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
    }),
    new ParseCase(10, function findMonths(timeList) {
        let matches = this.regchars.matchAll(/nM/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                timeList.months.push(new ParsedTime(+this.words[match.index].text, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
    }),
    new ParseCase(10, function findYears(timeList) {
        let matches = this.regchars.matchAll(/Ny/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                timeList.years.push(new ParsedTime(+this.words[match.index].text, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
    }),
    new ParseCase(10, function findYearsSmall(timeList) {
        let matches = this.regchars.matchAll(/ny/g);
        if (matches != null) {
            let match;
            while (!(match = matches.next()).done) {
                match = match.value;
                let num = +this.words[match.index].text;
                let base = Math.pow(10, numLength(num));
                num += Math.floor(new Date().getFullYear() / base) * base;
                timeList.years.push(new ParsedTime(num, this.words[match.index + 1].value, match.index));
                this.regchars = this.regchars.substring(0, match.index) + '..' + this.regchars.substring(match.index + 2);
            }
        }
        return timeList;
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
        words: expressions
    };
    for (const expression of expressions) {
        expressionsSet.regchars += expression.regex_char;
    }

    for (let parseCase of parseCases) {
        if (prevalence > parseCase.prevalence) {
            timeList = parseCase.parseFunction.call(expressionsSet, timeList);
        }
    }
    console.log(expressionsSet.regchars);
    return timeList;
}

module.exports = {
    extractTime,
    setDateProperty
}