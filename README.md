# @alordash/date-parser

``` 
$ npm i @alordash/date-parser
```  

## Links

* [English version](README-EN.md)  

# Описание

Извлекает даты о разных событиях из человеческого сообщения с точностью до секунды.  
Способна возвращать описание события без слов, используемых для определения даты.  
В библиотеке используется моя реализация **[алгоритма Дамерау-Левенштейна](https://github.com/alordash/damerau-levenshtein)**, чтобы верно распознавать слова, написанные с ошибками.  
**Поддерживает Русский и Английский языки.**  

# Документация

Чтобы правильно использовать эту библиотеку, прочтите документацию по её классам.

### TimeList class:

Каждый параметер типа *Number*, который отражает значение определенного типа времени.  
Если тип значения *undefined*, то это означает что в исходной строке не было дано определение для данного типа времени.  

#### Параметры:  

* TimeList.dates   {**Number**} —   Date.setDate(TimeList.dates);  
* TimeList.hours   {**Number**} —   Date.setHours(TimeList.hours);  
* TimeList.minutes {**Number**} —   Date.setMinutes(TimeList.minutes);  
* TimeList.months  {**Number**} —   Date.setMonth(TimeList.months);  
* TimeList.seconds {**Number**} —   Date.setSeconds(TimeList.seconds);  
* TimeList.years   {**Number**} —   Date.setFullYear(TimeList.years);  

### ParsedDate class:

Каждый объект типа ParsedDate отражает определенные дату и событие, извлеченные из исходной строки.  

#### Параметры:  

* ParsedDate.confidence     {**Number**}         — уровень верности этого **ParsedDate**.  
* ParsedDate.contexts       {**Array.\<Number\>**} — технический параметр.  
* ParsedDate.target_date    {**TimeList**}       — содержит всю информацию о целевой дате события. 
* ParsedDate.period_time    {**TimeList**}       — содержит всю информацию о периодичности события.  
* ParsedDate.max_date       {**TimeList**}       — содержит всю информацию о максимальной дате события.  
* ParsedDate.string         {**String**}         — описание события без слов, использованных для определения даты.  

### Функция parseDate()

#### Аргументы

1. string {**String**} — исходная строка.  
2. errorLimit {**Number**} — От 0.0 до 1.0, чем меньше — тем меньше результатов. Используется для распознавания слов с ошибками.  
3. minimumPrevalence {**Number**} — От 0 до 100, чем меньше — тем больше результатов. Используется для фильтрации редких типов определения времени.  

#### Возвращаемое значение

Возвращает массив **ParsedDates**.  
{**Array.\<ParsedDates\>**}

# Использование

```javascript
const { parseDate } = require('@alordash/date-parser');

let string = 'Вернуться домой в 8:30 вечера и приготовить ужин. Купить молоко и помыть машину в понедельник.';
let result = parseDate(string);

console.log('время 1 :>> ', JSON.stringify(result[0].target_date));
//=> вреия 1 :>>  {"minutes":30,"hours":20}

console.log('событие 1 :>> ', result[0].string);
//=> событие 1 :>> Вернуться домой и приготовить ужин

console.log('время 2 :>> ', JSON.stringify(result[1].target_date));
//=> время 2 :>>  {"dates":31} //сейчас 30.08.20., 31.08.20 это понедельник

console.log('событие 2 :>> ', result[1].string);
//=> событие 2 :>> Купить молоко и помыть машину

//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
string = 'Сходить к врачу с 9 утра до 11 вечера в следующую субботу и сходить в магазин в 7 вечера';
result = parseDate(string);

console.log('максимальная дата 1 :>> ', JSON.stringify(result[0].max_date));
//=> максимальная дата 1 :>>  {"dates":36,"hours":23} //сейчас 30.08.20, следующая суббота в 05.09.20, что, технически, и есть 36.08.20

console.log('целевая дата 1 :>> ', JSON.stringify(result[0].target_date));
//=> целевая дата 1 :>>  {"hours":9}

console.log('событие 1 :>> ', result[0].string);
//=> событие 1 :>> Сходить к врачу

console.log('целевая дата 2 :>> ', JSON.stringify(result[1].target_date));
//=> целевая дата 2 :>>  {"hours":19}

console.log('событие 2 :>> ', result[1].string);
//=> событие 2 :>> сходить в магазин

//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
string = 'На 19 Сентября с 9:00 до 20:00 вставать из-за компьютера каждые 15 минут и делать разминку';
result = parseDate(string);

console.log('целевая дата :>> ', JSON.stringify(result[0].target_date));
//=> целевая дата :>>  {"dates":19,"hours":9,"minutes":0,"months":9}

console.log('период :>> ', JSON.stringify(result[0].period_time));
//=> период :>>  {"hours":9,"minutes":0}

console.log('максимальная дата :>> ', JSON.stringify(result[0].maximum_date));
//=> максимальная дата :>>  {"hours":20,"minutes":0}

console.log('событие :>> ', JSON.stringify(result[0].string));
//=> событие :>> 'вставать из-за компьютера и делать разминку'
```
