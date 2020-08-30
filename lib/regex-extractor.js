const { Expression, LoadExpressions } = require('./loader');
const { distance } = require('@alordash/damerau-levenshtein');

/**
 * Converts string to array of Expressions according to rules in ./expressions/*.csv files
 * @param {String} string 
 * @param {Number} errorLimit 
 * @returns {Array.<Expression>} array of Expressions
 */
function extractRegexChars(string, errorLimit) {
    if (typeof (errorLimit) == 'undefined') {
        errorLimit = 1;
    }
    let words = string.split(' ');
    let expressions = [];
    const parsingRules = LoadExpressions();
    let k = words.length;
    while (k--) {
        let word = words[k].toLowerCase();
        let match = word.match(/[,.;:!?]/);
        if (match != null && match.index + match[0].length == word.length) {
            word = word.substring(0, match.index);
        }
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
                    let regexp = new RegExp(expression.text, 'g');
                    let match = word.match(regexp);
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

module.exports = {
    extractRegexChars
}