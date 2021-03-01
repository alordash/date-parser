const { parseDate } = require('../lib/date-parser');
const { isTimeType, isDateType } = require('../lib/date-cases');

const now = new Date();
const day = now.getDay();
const nextSaturday = (day >= 6 ? 7 + 6 - day : 6 - day);

const stringTests = [
   {
      in: "something at 6 o'clock pm",
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'something',
            target_date: {
               hours: 18,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'go to the cinema on next   thursday at 12:30 34 seconds',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'go to the cinema',
            target_date: {
               dates: now.getDate() + (day >= 4 ? 7 + 4 - day : 4 - day),
               hours: 12,
               minutes: 30,
               seconds: 34,
               isFixed: true
            },
            precisely: false
         }
      ]
   },
   {
      in: 'open window on submarine at      5 minutes to 7 pm',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'open window on submarine',
            target_date: {
               hours: 18,
               minutes: 55,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'visit doctor from 9 a.m.  to 11 p.m. on next Saturday and go to shop at 7 p.m.',
      outs: [
         {
            max_date: {
               dates: now.getUTCDate() + (nextSaturday == 0 ? 7 : nextSaturday),
               hours: 23,
               isFixed: true
            },
            period_time: {},
            string: 'visit doctor',
            target_date: {
               hours: 9,
               isFixed: true
            },
            precisely: false
         },
         {
            max_date: {},
            period_time: {},
            string: 'go to shop',
            target_date: {
               hours: 19,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'come home in 10  seconds 20 minutes  30 hours. Buy milk  and wash car on monday Wash my car ',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'come home',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours() + 30,
               minutes: now.getUTCMinutes() + 20,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds() + 10,
               years: now.getUTCFullYear(),
               isOffset: true
            },
            precisely: false
         },
         {
            max_date: {},
            period_time: {},
            string: 'Buy  milk and wash car Wash my car',
            target_date: {
               dates: now.getUTCDate() + (day > 1 ? 7 + 1 - day : 1 - day),
               isOffset: false
            },
            precisely: false
         },
      ]
   },
   {
      in: 'come  home at half past 12',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'come home',
            target_date: {
               hours: 12,
               minutes: 30
            }
         }
      ]
   },
   {
      in: 'Turn off the gas in 1 hour 20  minutes',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Turn off the gas',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours() + 1,
               minutes: now.getUTCMinutes() + 20,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear()
            },
            precisely: false
         }
      ]
   },
   {
      in: 'On 19 of September From 9:00 to 20:00 Get up from the computer every 15 minutes and do a warm-up',
      outs: [
         {
            max_date: {
               hours: 20,
               minutes: 0,
               isFixed: true
            },
            period_time: {
               minutes: 15
            },
            string: 'Get up from the computer and do a warm-up',
            target_date: {
               dates: 19,
               hours: 9,
               minutes: 0,
               months: 8,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'every 5 minutes until 20 hours',
      outs: [
         {
            max_date: {
               hours: 20
            },
            period_time: {
               minutes: 5
            },
            string: '',
            target_date: {}
         }
      ]
   },
   {
      in: 'Water flowers after tomorrow at 10 minutes to 7 p.m.',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Water flowers',
            target_date: {
               dates: now.getUTCDate() + 2,
               hours: 18,
               isFixed: true,
               minutes: 50
            },
            precisely: false
         }
      ]
   },
   {
      in: 'cake in 20S 2H 5m 5D 20Y and at 7M something',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'cake',
            target_date: {
               dates: now.getUTCDate() + 5,
               hours: now.getUTCHours() + 2,
               isOffset: true,
               minutes: now.getUTCMinutes() + 5,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds() + 20,
               years: now.getUTCFullYear() + 20
            },
            precisely: false
         },
         {
            max_date: {},
            period_time: {},
            string: 'something',
            target_date: {
               months: 6
            }
         }
      ]
   },
   {
      in: 'testset read every 7 days 1 year 5 hours for 3 times',
      outs: [
         {
            max_date: {
               dates: 21,
               years: 3,
               hours: 15,
               isOffset: true
            },
            period_time: {
               dates: 7,
               years: 1,
               hours: 5
            },
            string: 'testset read',
            target_date: {}
         }
      ]
   },
   {
      in: 'multy every minute 5 times, test every 4 days 2 year for 2 times, ok in 1 month',
      outs: [
         {
            max_date: {
               minutes: 5,
               isOffset: true
            },
            period_time: {
               minutes: 1
            },
            string: 'multy',
            target_date: {}
         },
         {
            max_date: {
               dates: 8,
               years: 4,
               isOffset: true
            },
            period_time: {
               dates: 4,
               years: 2
            },
            string: 'test',
            target_date: {}
         },
         {
            max_date: {},
            period_time: {},
            string: 'ok',
            target_date: {
               months: 1,
               isOffset: true
            }
         }
      ]
   },
   {
      in: 'drink water 10 times every 40 minutes',
      outs: [
         {
            max_date: {
               minutes: 400,
               isOffset: true
            },
            period_time: {
               minutes: 40
            },
            string: 'drink water',
            target_date: {}
         }
      ]
   },
   {
      in: 'gest 10 times every half hour and something in 10 minutes',
      outs: [
         {
            max_date: {
               minutes: 300,
               isOffset: true
            },
            period_time: {
               minutes: 30
            },
            string: 'gest',
            target_date: {}
         },
         {
            max_date: {},
            period_time: {},
            string: 'something',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours(),
               isOffset: true,
               minutes: now.getUTCMinutes() + 10,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear()
            },
            precisely: false
         }
      ]
   },
   {
      in: '---——— in next day, and ———--- in next year',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: '---———',
            target_date: {
               dates: now.getUTCDate() + 1,
               hours: now.getUTCHours(),
               isOffset: true,
               minutes: now.getUTCMinutes(),
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear()
            },
            precisely: false
         },
         {
            max_date: {},
            period_time: {},
            string: '———---',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours(),
               isOffset: true,
               minutes: now.getUTCMinutes(),
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear() + 1
            },
            precisely: false
         }
      ]
   },
   {
      in: 'Today at half past 20 will be evening',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'will be evening',
            target_date: {
               dates: now.getUTCDate(),
               hours: 20,
               minutes: 30,
               months: now.getUTCMonth()
            },
         }
      ]
   }
];

function formatText(string) {
   return string.replace(/  +/g, ' ');
}

let matchers = {
   toEqual: function (matchersUtil) {
      return {
         compare: function (actual, expected, isPrecise) {
            let result = {};
            if (isPrecise) {
               result.pass = actual == expected;
            } else {
               result.pass = Math.abs(actual - expected) <= 1;
            }
            if (!result.pass) {
               result.message = `Expected ${expected} to equal ${actual}.`;
            }
            return result;
         }
      };
   }
}

describe('[EN]', function () {
   beforeEach(function () {
      jasmine.addMatchers(matchers);
   });

   for (const test of stringTests) {
      const results = parseDate(test.in);
      it(test.in, function () {
         for (let i = 0; i < results.length / 2; i++) {
            const result = results[i];
            const out = test.outs[i];
            let precise = false;
            if (typeof (out.precisely) != 'undefined') {
               precise = out.precisely;
            }
            for (const key in out) {
               if (out.hasOwnProperty(key)) {
                  const res_property = result[key];
                  const out_property = out[key];
                  if (!isDateType(key)) {
                     var type = typeof (out_property);
                     if (type == 'string') {
                        expect(res_property).toBe(formatText(out_property));
                     } else if (type != 'boolean') {
                        expect(res_property).toBe(out_property);
                     }
                  } else {
                     for (const time_property in res_property) {
                        if (res_property.hasOwnProperty(time_property)) {
                           if (typeof (out_property[time_property]) == 'undefined') {
                              if (isTimeType(time_property)) {
                                 expect(res_property[time_property]).toBe(undefined);
                              }
                           } else {
                              if (typeof (out_property[time_property]) == 'boolean') {
                                 expect(res_property[time_property]).toBe(out_property[time_property]);
                              } else {
                                 expect(res_property[time_property]).toEqual(out_property[time_property], precise);
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      });
   }
});