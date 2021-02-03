const fs = require('fs');
const separatorsFilename = 'separators.csv';
const monthSizesFilename = 'months_size.csv'
class ConvertedWord {
   /**@type {String} */
   text;
   /**@type {Array.<Number>} */
   indexes;

   /**@param {String} text 
    * @param {Array.<Numbe>} indexes 
    */
   constructor(text, indexes) {
      this.text = `${text}`;
      this.indexes = indexes;
   }
}

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
	maximum;
	/**@type {Number} */
	context;
	/**@type {Boolean} */
	is_separator;
	/**@type {Boolean} */
	is_regex;
	/**@type {ConvertedWord} */
	convertedWord;

	/**
	 * @param {String} text 
	 * @param {String} regex_char 
	 * @param {Number} errors_limit 
	 * @param {Number} value 
	 * @param {Number} maximum 
	 * @param {Boolean} is_regex 
	 * @param {ConvertedWord} convertedWord 
	 */
	constructor(text, regex_char, errors_limit, value, maximum, is_regex, convertedWord) {
		this.text = text;
		this.regex_char = regex_char;
		this.errors_limit = errors_limit;
		this.value = value;
		this.maximum = maximum;
		this.is_separator = false;
		this.is_regex = is_regex;
		this.convertedWord = convertedWord;
	}
}

class ParsingRules {
	/**@type {Array.<Expression>} */
	expressions;

	/** @param {Array.<Expression>} expressions */
	constructor(expressions) {
		this.expressions = expressions;
	}
}

class MonthSize {
	/**@type {Number} */
	value;
	/**@type {Number} */
	normal_count;
	/**@type {Number} */
	leap_count;
	/**
	 * @param {Number} value
	 * @param {Number} normal_count
	 * @param {Number} leap_count
	 */
	constructor(value, normal_count, leap_count) {
		this.value = value;
		this.normal_count = normal_count;
		this.leap_count = leap_count;
	}
}

/**
 * Loads expressions
 * @param {String} fileName name of file containting expressions (.csv)
 * @returns {ParsingRules} Parsing Rules
 */
function LoadExpressionsFile(fileName) {
	let raw = fs.readFileSync(__dirname + `/expressions/${fileName}`, { encoding: 'utf-8' }).split(/\n/);
	let metadata = {};
	let params = raw[1].split(';');
	let values = raw[2].split(';');
	for (const i in params) {
		if (params[i] != '') {
			metadata[params[i]] = values[i];
		}
	}
	let arr = raw.slice(4);
	for (const i in arr) {
		let val = arr[i].split(';');
		arr[i] = new Expression(val[0], val[1], +val[2], +val[3], +val[4], +val[5] > 0);
	}
	return new ParsingRules(arr);
}

/**
 * Loads all expressions from .csv files in ./lib/expressions/
 * @returns {Array<ParsingRules>} array of expression clusters
 */
function LoadExpressions() {
	let filenames = fs.readdirSync(__dirname + '/expressions/');
	let parsingRules = [];
	for (const filename of filenames) {
		if (filename.split('.').pop() == 'csv' && filename != separatorsFilename) {
			parsingRules.push(LoadExpressionsFile(filename));
		}
	}
	return parsingRules;
}

/**
 * Loads all separating regexs from separators.csv
 * @returns {ParsingRules}
 */
function LoadSeparators() {
	let raw = fs.readFileSync(__dirname + `/expressions/${separatorsFilename}`, { encoding: 'utf-8' }).split(/\n/);
	let metadata = {};
	let params = raw[1].split(';');
	let values = raw[2].split(';');
	for (const i in params) {
		if (params[i] != '') {
			metadata[params[i]] = values[i];
		}
	}
	let arr = raw.slice(4);
	for (const i in arr) {
		let val = arr[i].split(';');
		arr[i] = new Expression(val[0], val[1], +val[2], +val[3], +val[4], +val[5] > 0);
	}
	return new ParsingRules(arr);
}

/**
 * @param {Number} month
 * @returns {MonthSize}
 */
function LoadMonthSize(month) {
	let raw = fs.readFileSync(__dirname + `/constants/${monthSizesFilename}`, { encoding: 'utf-8' }).split(/\n/);
	let arr = raw.slice(1);
	for (const i in arr) {
		let val = arr[i].split(';');
		if ((val[0] = +val[0]) == month) {
			return new MonthSize(+val[0], val[1], +val[2]);
		}
	}
	return null;
}

module.exports = {
	ConvertedWord,
	Expression,
	ParsingRules,
	MonthSize,
	LoadExpressionsFile,
	LoadExpressions,
	LoadSeparators,
	LoadMonthSize
}