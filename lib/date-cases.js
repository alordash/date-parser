const { Expression, LoadMonthSize, LoadSeparators } = require('./loader');

function numLength(num) {
	return Math.ceil(Math.log10(num + 1));
}

/**
 * @param {String} str 
 * @param {Number} index 
 * @param {String} char 
 */
function replaceAt(str, index, char) {
	return str.substring(0, index) + char + str.substring(index + 1);
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

class ContextsData {
	/**@type Array.<Context> */
	contexts = [];
	/**@type Array.<Number> */
	usedContexts = [];

	constructor() {
	}
}

/**
 * @this {Array.<Expression>} 
 * @returns {{separatingWords: Array.<Number>, contexts: Array.<Context>}}
 */
function splitContext() {
	const separators = LoadSeparators();
	let contexts = [];
	let separatingWords = [];
	let start = 0;
	let i = 0;
	while (i < this.length) {
		const expression = this[i];
		if (expression.regex_char == 'I') {
			contexts.push(new Context(start, i));
			start = i + 1;
		} else {
			for (const separator of separators.expressions) {
				let matches = [...expression.text.matchAll(new RegExp(separator.text))];
				if (matches.length == 1 && matches[0].index == matches[0].input.length - 1) {
					expression.text = expression.text.substring(0, expression.text.length - 1);
					contexts.push(new Context(start, i));
					start = i + 1;
					separatingWords.push(i);
				}
			}
		}
		i++
	}
	if (start < this.length) {
		contexts.push(new Context(start, this.length - 1));
	}
	return { separatingWords, contexts };
}

/**
 * @this {{regchars: String, expressions: Array.<Expression>}}
 * @param {Number} index 
 * @param {Boolean} replacePrepositions 
 * @returns {Array.<Number>}
 */
function markIndexes(index, end, replacePrepositions) {
	if (replacePrepositions && this.regchars[index - 1] == 'p') {
		this.regchars = replaceAt(this.regchars, index - 1, '.');
		index--;
		end++;
	}
	let indexes = [];
	for (let i = Math.max(0, index); i < Math.min(index + end, this.expressions.length); i++) {
		this.regchars = replaceAt(this.regchars, i, '.');
		indexes.push(i);
	}
	return indexes;
}

/**
 * @param {ContextsData} contextsData
 * @param {Array.<Number>} indexes 
 * @returns {Number} 
 */
function findCorrespondingContext(contextsData, indexes) {
	let i = indexes.length;
	const contexts = contextsData.contexts;
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

/**
 * @param {ContextsData} contextsData
 * @param {Array.<Number>} indexes 
 * @returns {Number} 
 */
function processContexts(contextsData, indexes) {
	let context = findCorrespondingContext(contextsData, indexes);
	if (!contextsData.usedContexts.includes(context)) {
		contextsData.usedContexts.push(context);
	}
	return context;
}

const numberAndWordPrevalence = 50;
const numberAndWordParseCases = [
	new ParseCase(numberAndWordPrevalence, function findSeconds(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/ns/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findMinutes(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/nm/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findHours(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/nh/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findDates(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/nd/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findMonths(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/nM/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findYears(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/Ny/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, num, this.expressions[match.index + 1].value, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	new ParseCase(numberAndWordPrevalence, function findYearsSmall(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/ny/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index].text;
			let base = Math.pow(10, numLength(num));
			num += Math.floor(new Date().getFullYear() / base) * base;
			let max = this.expressions[match.index + 1].maximum;
			if (num <= max || max == 0) {
				let indexes = markIndexes.call(this, match.index, 2, true);
				let context = processContexts(contextsData, indexes);
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
function isLeapYear(year) {
	return (year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0);
}
function checkDate(date, month, year) {
	const monthSize = LoadMonthSize(month);
	return 0 <= date && date <= (isLeapYear(year) ? monthSize.leap_count : monthSize.normal_count);
}
function checkMonth(month) {
	return 0 <= month && month <= 12;
}
function checkYear(year) {
	return 0 <= year;
}
function processHour(hour, partOfDay) {
	let l1 = (6 * partOfDay) % 24;
	let l2 = (6 * (partOfDay + 1)) % 24;
	if ((l1 < hour && hour <= l1 + 6) || (l2 <= hour && hour <= l2 + 6)) {
		if (hour >= 12) {
			return hour - 12;
		} else {
			return hour + 12;
		}
	}
	return hour;
}

const parseCases = [
	//Searchs for HH:MM cases
	new ParseCase(75, function (parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/t/g)];
		for (const match of matches) {
			let vals = this.expressions[match.index].text.split(/[:\.]/);
			let hours = +vals[0];
			let minutes = +vals[1];
			if (checkHours(hours) && checkMinutes(minutes)) {
				let indexes = markIndexes.call(this, match.index, 1, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, hours, 0, indexes, context, prevalence));
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for DD.MM.Y-YYYY cases
	new ParseCase(75, function (parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/D/g)];
		for (const match of matches) {
			let vals = this.expressions[match.index].text.split(/\./);
			let date = +vals[0];
			let month = +vals[1];
			let year = +vals[2];
			if (
				checkDate(date, month, year)
				&& checkMonth(month)
				&& checkYear(year)
			) {
				let indexes = markIndexes.call(this, match.index, 1, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, date, 0, indexes, context, prevalence));
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, 0, month, indexes, context, prevalence));
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, year, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for weeks cases
	new ParseCase(80, function (parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/F{0,1}d/g)];
		for (const match of matches) {
			const length = match[0].length;
			let value = this.expressions[match.index + length - 1].value;
			if (value != 0) {
				let now = new Date();
				let dif = value - (now.getDay() + 1);
				if (dif < 0) {
					dif += 7;
				}
				let indexes = markIndexes.call(this, match.index, length, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, now.getDate() + dif, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for without X minutes cases
	new ParseCase(90, function findHours(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/Bnm{0,1}n[Oh]/g)];
		for (const match of matches) {
			const length = match[0].length;
			let minutes = +this.expressions[match.index + 1].text;
			let num = +this.expressions[match.index + length - 2].text;
			if (1 <= num <= 25 && 0 < minutes && minutes < 60) {
				if (match[0][length - 1] == 'O') {
					num = processHour(num, this.expressions[match.index + length - 1].value);
				}
				num--;
				minutes = 60 - minutes;
				let indexes = markIndexes.call(this, match.index, length, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, 0, indexes, context, prevalence));
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, minutes, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for specified time of day hours
	new ParseCase(90, function findHours(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/O{0,1}nhO{0,1}/g)];
		for (const match of matches) {
			let index = match.index;
			let count = 2;
			let value = 0;
			if (match[0][0] == 'O') {
				index++;
				count++;
				value = +this.expressions[index - 1].value;
			} else {
				count++;
				value = +this.expressions[index + 2].value
			}
			let num = +this.expressions[index].text;
			if (0 <= num <= 24) {
				num = processHour(num, value);
				let indexes = markIndexes.call(this, match.index, count, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for half of hour
	new ParseCase(90, function findHours(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/Hn(O{1}|h{0,1})/g)];
		for (const match of matches) {
			let num = +this.expressions[match.index + 1].text;
			if (1 <= num <= 25) {
				if (match[0].length == 3) {
					num = processHour(num, this.expressions[match.index + 2].value);
				}
				num--;
				let indexes = markIndexes.call(this, match.index, match[0].length, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, 0, indexes, context, prevalence));
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, 30, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	}),
	//Searchs for simplified specification of hours and time of day
	new ParseCase(75, function findHours(parsedTimes, contextsData, prevalence) {
		let matches = [...this.regchars.matchAll(/nO/g)];
		for (const match of matches) {
			let value = this.expressions[match.index + 1].value;
			let num = +this.expressions[match.index].text;
			if (0 <= num <= 24) {
				num = processHour(num, value);
				let indexes = markIndexes.call(this, match.index, match[0].length, true);
				let context = processContexts(contextsData, indexes);
				parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, 0, indexes, context, prevalence));
			}
		}
		return parsedTimes;
	})
];

/**
 * @param {Array.<Expression>} expressions 
 * @param {Number} minimumPrevalence the less — the more results
 * @returns {{parsedTimes: Array.<ParsedTime>, contextsData: ContextsData, separatingWords: Array.<Number>}} object containing all found times 
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
	let contextsData = new ContextsData();
	let res = splitContext.call(expressions);
	contextsData.contexts = res.contexts;
	let separatingWords = res.separatingWords;
	for (const parseCase of parseCases) {
		if (parseCase.prevalence >= minimumPrevalence) {
			parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contextsData, parseCase.prevalence);
		}
	}
	if (numberAndWordPrevalence >= minimumPrevalence) {
		for (const parseCase of numberAndWordParseCases) {
			parsedTimes = parseCase.parseFunction.call(expressionsSet, parsedTimes, contextsData, parseCase.prevalence);
		}
	}
	return { parsedTimes, contextsData, separatingWords };
}

module.exports = {
	DateTypes,
	TimeTypes,
	ParsedTime,
	ContextsData,
	extractTime
}