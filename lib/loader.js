const fs = require('fs');
const separatorsFilename = 'separators.csv';
const monthSizesFilename = 'months_size.csv'

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
	isSeparator;

	/**
	 * @param {String} text 
	 * @param {String} regex_char 
	 * @param {Number} errors_limit 
	 * @param {Number} value 
	 * @param {Number} maximum
	 */
	constructor(text, regex_char, errors_limit, value, maximum) {
		this.text = text;
		this.regex_char = regex_char;
		this.errors_limit = errors_limit;
		this.value = value;
		this.maximum = maximum;
		this.isSeparator = false;
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
	let raw = fs.readFileSync(`./lib/expressions/${fileName}`, { encoding: 'utf-8' }).split(/\r\n/);
	let metadata = {};
	let params = raw[1].split(';');
	let values = raw[2].split(';');
	for (const i in params) {
		if (params[i] != '') {
			metadata[params[i]] = values[i];
		}
	}
	metadata.is_regex = +metadata.is_regex > 0;
	let arr = raw.slice(4);
	for (const i in arr) {
		let val = arr[i].split(';');
		if (metadata.is_regex) {
			arr[i] = new Expression(val[0], val[1], 0, 0, 0);
		} else {
			arr[i] = new Expression(val[0], val[1], +val[2], +val[3], +val[4]);
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
	let raw = fs.readFileSync(`./lib/expressions/${separatorsFilename}`, { encoding: 'utf-8' }).split(/\r\n/);
	let metadata = {};
	let params = raw[1].split(';');
	let values = raw[2].split(';');
	for (const i in params) {
		if (params[i] != '') {
			metadata[params[i]] = values[i];
		}
	}
	metadata.is_regex = +metadata.is_regex > 0;
	let arr = raw.slice(4);
	for (const i in arr) {
		let val = arr[i].split(';');
		arr[i] = new Expression(val[0], val[1], 0, 0, 0);
	}
	return new ParsingRules(arr, metadata.is_regex);
}

/**
 * @param {Number} month
 * @returns {MonthSize}
 */
function LoadMonthSize(month) {
	let raw = fs.readFileSync(`./lib/constants/${monthSizesFilename}`, { encoding: 'utf-8' }).split(/\r\n/);
	let arr = raw.slice(1);
	for(const i in arr) {
		let val = arr[i].split(';');
		if((val[0] = +val[0]) == month) {
			return new MonthSize(+val[0], val[1], +val[2]);
		}
	}
	return null;
}

module.exports = {
	Expression,
	ParsingRules,
	MonthSize,
	LoadExpressionsFile,
	LoadExpressions,
	LoadSeparators,
	LoadMonthSize
}