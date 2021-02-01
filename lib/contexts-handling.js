const { Expression } = require('./loader');
const { ContextsData } = require('./date-cases');

/**
 * @param {Number} contextIndex 
 * @param {Array.<ParsedDate>} parsedDates 
 * @returns {Number}
 */
function findParsedDateByContext(contextIndex, parsedDates) {
    let i = parsedDates.length;
    while (i--) {
        const parsedDate = parsedDates[i];
        if (parsedDate.contexts.includes(contextIndex)) {
            return i;
        }
    }
    return -1;
}

/**
 * @this {Array.<ParsedDate>} 
 * @param {Number} parsedDateIndex 
 * @param {Number} index 
 * @param {ContextsData} contextsData 
 * @param {Array.<Expression>} expressions 
 * @param {Boolean} atEnd 
 * @param {String} regexChar 
 * @param {String} endChar 
 * @returns {Boolean} 
 */
function addWordsFromContext(parsedDateIndex, index, contextsData, expressions, atEnd, regexChar, endChar) {
    let result = false;
    let lastChar;
    let lastExpression;
    if (atEnd) {
        lastExpression = expressions[contextsData.contexts[index - 1].end];
        lastChar = lastExpression.text;
    } else {
        lastExpression = expressions[contextsData.contexts[index].end];
        lastChar = lastExpression.text;
    }
    lastChar = lastChar[lastChar.length - 1];
    if (typeof (regexChar) != 'undefined') {
        if (lastExpression.regex_char == regexChar) {
            let words = [];
            let context = contextsData.contexts[index];
            for (let i = context.start; i <= context.end; i++) {
                words.push(expressions[i]);
            }
            if (atEnd) {
                this[parsedDateIndex].string.push(...words);
            } else {
                this[parsedDateIndex].string.unshift(...words);
            }
            result = true;
        }
    } else if (typeof (endChar) != 'undefined') {
        if (lastChar == endChar) {
            let words = [];
            let context = contextsData.contexts[index];
            for (let i = context.start; i <= context.end; i++) {
                words.push(expressions[i]);
            }
            if (atEnd) {
                this[parsedDateIndex].string.push(...words);
            } else {
                this[parsedDateIndex].string.unshift(...words);
            }
            result = true;
        }
    }
    if (result) {
        this[parsedDateIndex].contexts.push(index);
    }
    return result;
}

/** 
 * @this {Array.<ParsedDate>} 
 * @param {Array.<Number>} notUsedContexts 
 * @param {ContextsData} contextsData 
 * @param {Array.<Expression>} expressions 
 * @param {String} regexChar 
 * @param {String} endChar 
 * @returns {Array.<Number>} 
 */
function fillNotUsedContexts(notUsedContexts, contextsData, expressions, regexChar, endChar) {
    let result = [];
    for (const index of notUsedContexts) {
        let proceed = true;
        if (index > 0) {
            let parsedDateIndex = findParsedDateByContext(index - 1, this);
            if (parsedDateIndex != -1) {
                if (addWordsFromContext.call(this, parsedDateIndex, index, contextsData, expressions, true, regexChar, endChar)) {
                    proceed = false;
                }
            }
        }
        if (proceed && index < contextsData.contexts.length - 1) {
            let parsedDateIndex = findParsedDateByContext(index + 1, this);
            if (parsedDateIndex != -1) {
                if (addWordsFromContext.call(this, parsedDateIndex, index, contextsData, expressions, false, regexChar, endChar)) {
                    proceed = false;
                }
            }
        }
        if (proceed) {
            result.push(index);
        }
    }
    return result;
}

/**
 * @this {Array.<ParsedDate>} 
 * @param {ParsingRules} separators 
 * @param {Array.<Number>} notUsedContexts 
 * @param {ContextsData} contextsData 
 * @param {Array.<Expression>} expressions 
 * @returns {Array.<Number>} 
 */
function proceedNotUsedContexts(separators, notUsedContexts, contextsData, expressions) {
    let newContexts = fillNotUsedContexts.call(this, notUsedContexts, contextsData, expressions, 'I', undefined);
    if (newContexts.length != notUsedContexts.length) {
        newContexts = proceedNotUsedContexts.call(this, separators, newContexts, contextsData, expressions);
    }
    notUsedContexts = newContexts;
    for (const separator of separators.expressions) {
        newContexts = fillNotUsedContexts.call(this, newContexts, contextsData, expressions, undefined, separator.text[separator.text.length - 1]);
        if (newContexts.length != notUsedContexts.length) {
            newContexts = proceedNotUsedContexts.call(this, separators, newContexts, contextsData, expressions);
        }
        notUsedContexts = newContexts;
    }
    return notUsedContexts;
}

module.exports = {
    findParsedDateByContext,
    addWordsFromContext,
    fillNotUsedContexts,
    proceedNotUsedContexts
}