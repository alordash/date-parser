const { ConvertedWord, Expression, LoadExpressions } = require('./loader');
const { distance } = require('@alordash/damerau-levenshtein');

/**
 * Converts string to array of Expressions according to rules in ./expressions/*.csv files
 * @param {Array.<ConvertedWord>} words 
 * @param {Number} errorLimit 
 * @returns {Array.<Expression>} array of Expressions
 */
function extractRegexChars(words, errorLimit = 1) {
    let expressions = [];
    const parsingRules = LoadExpressions();
    for (let k = 0; k < words.length; k++) {
        let word = words[k].text;
        let match = word.match(/[,.;:!?]/);
        if (match != null && (match.index + match[0].length == word.length)) {
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
                if (expression.is_regex) {
                    let match = word.match(new RegExp(expression.text, 'g'));
                    if (match != null && match.length == 1) {
                        found = true;
                        expression.text = words[k].text;
                        expression.convertedWord = words[k];
                    }
                } else {
                    if (distance(expression.text, word.toLowerCase()) <= expression.errors_limit * errorLimit) {
                        found = true;
                        expression.text = words[k].text;
                        expression.convertedWord = words[k];
                    }
                }
            }
        }
        if (!found) {
            expression = new Expression(words[k].text, '.', 0, 0, 0, undefined, words[k]);
        }
        expressions.push(expression);
    }
    return expressions;
}

module.exports = {
    extractRegexChars
}