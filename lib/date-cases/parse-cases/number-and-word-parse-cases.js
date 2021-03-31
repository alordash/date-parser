const {
   DateTypes,
   TimeTypes,
   ValidModes,
   ParsedTime,
   Context,
   ContextsData,

   ParseCase,
   markIndexes,
   processContexts,
   GetDaysToDayOfWeek,
} = require('../parse-cases-processing');

const { ConvertedWord, Expression } = require('../../loader');

const prevalence = 50;
const parseCases = [
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/X/g)];
      for (const match of matches) {
         let regchars = this.regchars;
         this.regchars = `${regchars.substring(0, match.index)}nm${regchars.substring(match.index + 1)}`;
         let expression = this.expressions[match.index];
         expression.regex_char = 'n';
         expression.is_regex = true;
         expression.text = '30';
         this.expressions.splice(match.index + 1, 0, new Expression('~', 'm', 0, 0, 0, false, new ConvertedWord('~', [])));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/Hh/g)];
      for (const match of matches) {
         let regchars = this.regchars;
         this.regchars = `${regchars.substring(0, match.index)}nm${regchars.substring(match.index + 2)}`;
         let expression = this.expressions[match.index];
         expression.regex_char = 'n';
         expression.is_regex = true;
         expression.text = '30';
         let nextExpression = this.expressions[match.index + 1];
         nextExpression.regex_char = 'm';
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/ns/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nm/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nh/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/n[dS]/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nw/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text * 7;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nQ{0,1}M/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, indexes, context, prevalence, { validMode }));
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, this.expressions[match.index + match[0].length - 1].value, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/nK/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         if (0 < num) {
            let indexes = markIndexes.call(this, match.index, match[0].length, true, true);
            let context = processContexts(contextsData, indexes);
            parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.nMonth, num, indexes, context, prevalence));
         }
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/[nN]y/g)];
      for (const match of matches) {
         let num = +this.expressions[match.index].text;
         let max = this.expressions[match.index + match[0].length - 1].maximum;
         let validMode = ValidModes.notCertified;
         if (num > max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/s/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, 1, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/m/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, 1, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/h/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, 1, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/w/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, 7, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/K/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.nMonth, 1, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/y/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, 1, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/d/g)];
      for (const match of matches) {
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         let value = this.expressions[match.index].value;;
         if (value == 0) {
            value = 1;
         } else {
            const now = new Date();
            value = now.getDate() + GetDaysToDayOfWeek(value);
         }
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, value, indexes, context, prevalence, { validMode: ValidModes.notValid }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/0/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.seconds, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/1/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.minutes, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/2/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.hours, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/3/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.dates, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/4/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.months, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   }),
   new ParseCase(prevalence, function (parsedTimes, contextsData, prevalence) {
      let matches = [...this.regchars.matchAll(/5/g)];
      for (const match of matches) {
         let text = this.expressions[match.index].text
         let num = +text.substring(0, text.length - 1);
         let max = this.expressions[match.index].maximum;
         let validMode = ValidModes.notCertified;
         if (num >= max && max != 0) {
            validMode = ValidModes.notValid;
         }
         let indexes = markIndexes.call(this, match.index, match[0].length, true, false);
         let context = processContexts(contextsData, indexes);
         parsedTimes.push(new ParsedTime(DateTypes.target, TimeTypes.years, num, indexes, context, prevalence, { validMode }));
      }
      return parsedTimes;
   })
];

module.exports = {
   prevalence,
   parseCases
}