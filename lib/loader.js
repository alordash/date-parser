const fs = require('fs');

class Expression {
    /**@type {String} */
    text;
    /**@type {String} */
    regex_char;
    /**@type {Number} */
    errors_limit;
    /**@type {Number} */
    value;
    /**@type {Number} */
    priority;

    /**
     * @param {String} text 
     * @param {String} regex_char 
     * @param {Number} errors_limit 
     * @param {Number} value 
     * @param {Number} priority 
     */
    constructor(text, regex_char, errors_limit, value, priority) {
        this.text = text;
        this.regex_char = regex_char;
        this.errors_limit = errors_limit;
        this.value = value;
        this.priority = priority;
    }
}

class ParsingRules {
    /**@type {Array.<Expression>} */
    expressions;
    /**@type {Boolean} */
    is_regex;

    /**
     * @param {Array.<Expression>} expressions 
     * @param {Boolean} is_regex
     */
    constructor(expressions, is_regex) {
        this.expressions = expressions;
        this.is_regex = is_regex;
    }
}

/**
 * Loads expressions
 * @param {String} fileName name of file containting expressions (.csv)
 * @returns {ParsingRules} Parsing Rules
 */
function LoadExpressionsFile(fileName) {
    let raw = fs.readFileSync(`./lib/expressions/${fileName}`, { encoding: 'utf-8' }).split(/\r\n/);
    let metadata = {};
    let params = raw[1].split(';');
    let values = raw[2].split(';');
    for (let i in params) {
        if (params[i] != '') {
            metadata[params[i]] = values[i];
        }
    }
    metadata.is_regex = +metadata.is_regex > 0;
    let arr = raw.slice(4);
    for (let i in arr) {
        let val = arr[i].split(';');
        if (metadata.is_regex) {
            arr[i] = new Expression(val[0], val[1], 0, +val[2]);
        } else {
            arr[i] = new Expression(val[0], val[1], +val[2], +val[3]);
        }
    }
    return new ParsingRules(arr, metadata.is_regex);
}

/**
 * Loads all expressions from .csv files in ./lib/expressions/
 * @returns {Array<ParsingRules>} array of expression clusters
 */
function LoadExpressions() {
    let filenames = fs.readdirSync('./lib/expressions/');
    let parsingRules = [];
    for (let filename of filenames) {
        if (filename.split('.').pop() == 'csv') {
            parsingRules.push(LoadExpressionsFile(filename));
        }
    }
    return parsingRules;
}

module.exports = {
    Expression,
    ParsingRules,
    LoadExpressionsFile,
    LoadExpressions
}