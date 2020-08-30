const { parseDate } = require('../lib/date-parser');

const now = new Date();
const date = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const month = now.getMonth();
const seconds = now.getSeconds();
const year = now.getFullYear();
const day = now.getDay();
const nextSaturday = (day > 6 ? 7 + 6 - day : 6 - day);
console.log('day :>> ', day);
const stringTests = [
   {
      in: "something at 6 o'clock pm",
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'something',
            target_date: {
               hours: 18
            }
         }
      ]
   },
   {
      in: 'go to the cinema on next thursday at 12:30 34 seconds',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'go to the cinema',
            target_date: {
               dates: date + (day > 4 ? 7 + 4 - day : 4 - day),
               hours: 12,
               minutes: 30,
               seconds: 34
            }
         }
      ]
   },
   {
      in: 'open window on submarine at 5 minutes to 7 pm',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'open window on submarine',
            target_date: {
               hours: 18,
               minutes: 55,
            }
         }
      ]
   },
   {
      in: 'visit doctor from 9 a.m. to 11 p.m. on next Saturday and go to shop at 7 p.m.',
      outs: [
         {
            max_date: {
               dates: date + (nextSaturday == 0 ? 7 : nextSaturday),
               hours: 23
            },
            period_time: {},
            string: 'visit doctor',
            target_date: {
               hours: 9
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'go to shop',
            target_date: {
               hours: 19
            }
         }
      ]
   },
   {
      in: 'come home in 10 seconds 20 minutes 30 hours. Buy milk and wash car on monday Wash my car ',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'come home',
            target_date: {
               dates: date,
               hours: hours + 30,
               minutes: minutes + 20,
               months: month + 1,
               seconds: seconds + 10,
               years: year
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'Buy milk and wash car Wash my car',
            target_date: {
               dates: date + (day > 1 ? 7 + 1 - day : 1 - day),
            }
         },
      ]
   },
   {
      in: 'come home at half past 12',
      outs: [{
         max_date: {},
         period_time: {},
         string: 'come home',
         target_date: {
            hours: 12,
            minutes: 30
         }
      }
      ]
   }
];

describe('[EN]', function () {
   for (const test of stringTests) {
      const results = parseDate(test.in, 1, 50);
      let i = results.length;
      it(test.in, function () {
         while (i--) {
            const result = results[i];
            const out = test.outs[i];
            for (const key in out) {
               if (out.hasOwnProperty(key)) {
                  const res_property = result[key];
                  const out_property = out[key];
                  if (key == 'string') {
                     expect(res_property).toBe(out_property);
                  } else {
                     for (const time_property in res_property) {
                        if (res_property.hasOwnProperty(time_property)) {
                           if (typeof (out_property[time_property]) == 'undefined') {
                              expect(res_property[time_property]).toBe(undefined);
                           } else {
                              expect(res_property[time_property].number).toBe(out_property[time_property]);
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