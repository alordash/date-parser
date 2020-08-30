# @alordash/date-parser

``` 
$ npm i @alordash/date-parser
```  

## Links

* [Описание на русском языке](README.md)  

# Description

Extracts dates of any event from human spoken message with **seconds** precision.  
Can return event description without date-related words.  
It uses my realization of **[Damerau-Levenshtein algorithm](https://github.com/alordash/damerau-levenshtein)** to properly parse words even if they are written with mistakes.  
**Supports Russian and English languages.**  

# Documentaion

To use this library correctly, read information about its classes.  

### TimeList class:

Each property is *Number* that represents value of specific time type.  
If value is *undefined*, then source string does not contain definition of that time type.  

#### Properties:  

* TimeList.dates   {**Number**} —   Date.setDate(TimeList.dates);  
* TimeList.hours   {**Number**} —   Date.setHours(TimeList.hours);  
* TimeList.minutes {**Number**} —   Date.setMinutes(TimeList.minutes);  
* TimeList.months  {**Number**} —   Date.setMonth(TimeList.months);  
* TimeList.seconds {**Number**} —   Date.setSeconds(TimeList.seconds);  
* TimeList.years   {**Number**} —   Date.setFullYear(TimeList.years);  

### ParsedDate class:

Every ParsedDate object represents particular date and event retrieved from source string.

#### Properties:  

* ParsedDate.confidence     {**Number**}         — confidence level of this **ParsedDate**.  
* ParsedDate.contexts       {**Array.\<Number\>**} — technical property.  
* ParsedDate.target_date    {**TimeList**}       — contains all information about target date of event.  
* ParsedDate.period_time    {**TimeList**}       — contains all information about periodicity of event.  
* ParsedDate.max_date       {**TimeList**}       — contains all information about maximum date of event.  
* ParsedDate.string         {**String**}         — event description without date-related words.  

### Function parseDate(): {Array.\<ParsedDates\>}

#### Arguments

1. string {**String**} — source string.  
2. errorLimit {**Number**} — From 0.0 to 1.0, the less — the less results. Used for recognizing words with mistakes.  
3. minimumPrevalence {**Number**} — From 0 to 100, the less — the more results. Used to filter rare date cases.  

# Usage

```javascript
const { parseDate } = require('@alordash/date-parser');

let string = 'Come home at 8:30 p.m. and cook dinner. Buy milk and wash car on monday.';
let result = parseDate(string);

console.log('time 1 :>> ', JSON.stringify(result[0].target_date));
//=> time 1 :>>  {"minutes":30,"hours":20}

console.log('event 1 :>> ', result[0].string);
//=> event 1 :>> Come home and cook dinner

console.log('time 2 :>> ', JSON.stringify(result[1].target_date));
//=> time 2 :>>  {"dates":31} //30.08.20 atm., 31.08.20 is Monday

console.log('event 2 :>> ', result[1].string);
//=> event 2 :>> Buy milk and wash car

//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
string = 'Visit doctor from 9 a.m. to 11 p.m. on next Saturday and go to shop at 7 p.m.';
result = parseDate(string);

console.log('maximum date 1 :>> ', JSON.stringify(result[0].max_date));
//=> maximum date 1 :>>  {"dates":36,"hours":23} //30.08.20 atm., next saturday is on 05.09.20, which is technically 36.08.20

console.log('target date 1 :>> ', JSON.stringify(result[0].target_date));
//=> target date 1 :>>  {"hours":9}

console.log('event 1 :>> ', result[0].string);
//=> event 1 :>> Visit doctor

console.log('target date 2 :>> ', JSON.stringify(result[1].target_date));
//=> target date 2 :>>  {"hours":19}

console.log('event 2 :>> ', result[1].string);
//=> event 2 :>> go to shop

//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
string = 'On 19 of September From 9:00 to 20:00 Get up from the computer every 15 minutes and do a warm-up';
result = parseDate(string);

console.log('target date :>> ', JSON.stringify(result[0].target_date));
//=> target date :>>  {"dates":19,"hours":9,"minutes":0,"months":9}

console.log('period time :>> ', JSON.stringify(result[0].period_time));
//=> period time :>>  {"hours":9,"minutes":0}

console.log('maximum date :>> ', JSON.stringify(result[0].maximum_date));
//=> maximum date :>>  {"hours":20,"minutes":0}

console.log('event :>> ', JSON.stringify(result[0].string));
//=> event :>> Get up from the computer and do a warm-up
```

# Features

### ParsedDate.toString(): {String}

Returns event description.

### ParsedDate.valueOf(): {{target_date: Date, period_time: Date, max_date: Date}}

Composes all found time types to dates and returns {

    target_date: Date,  
    period_time: Date,  
    max_date: Date  

} object.  
  
Using current time values (**new Date()**) for not found target_dates' and max_dates' time types.  
Using null time values (**new Date(0)**) for not found period_time time types.  
