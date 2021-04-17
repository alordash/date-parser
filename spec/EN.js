const { UnitTest } = require('./UnitTest');

const now = new Date();
const day = now.getDay();
const nextSaturday = (day >= 6 ? 7 + 6 - day : 6 - day);

/**@type {Array.<UnitTest>} */
const tests = [
   {
      in: "something at 6 o'clock pm",
      outs: [
         {
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
            string: 'visit doctor',
            target_date: {
               hours: 9,
               isFixed: true
            },
            precisely: false
         },
         {
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
            string: 'come home',
            target_date: {
               hours: now.getUTCHours() + 30,
               minutes: now.getUTCMinutes() + 20,
               seconds: now.getUTCSeconds() + 10,
               isOffset: true
            },
            precisely: false
         },
         {
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
            string: 'Turn off the gas',
            target_date: {
               hours: now.getUTCHours() + 1,
               minutes: now.getUTCMinutes() + 20
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
         }
      ]
   },
   {
      in: 'Water flowers after tomorrow at 10 minutes to 7 p.m.',
      outs: [
         {
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
            string: 'cake',
            target_date: {
               dates: now.getUTCDate() + 5,
               hours: now.getUTCHours() + 2,
               isOffset: true,
               minutes: now.getUTCMinutes() + 5,
               seconds: now.getUTCSeconds() + 20,
               years: now.getUTCFullYear() + 20
            },
            precisely: false
         },
         {
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
            string: 'multy'
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
            string: 'test'
         },
         {
            string: 'ok',
            target_date: {
               months: now.getUTCMonth() + 1,
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
            string: 'drink water'
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
            string: 'gest'
         },
         {
            string: 'something',
            target_date: {
               isOffset: true,
               minutes: now.getUTCMinutes() + 10
            },
            precisely: false
         }
      ]
   },
   {
      in: '---——— in next day, and ———--- in next year',
      outs: [
         {
            string: '---———',
            target_date: {
               dates: now.getUTCDate() + 1,
               isOffset: true
            },
            precisely: false
         },
         {
            string: '———---',
            target_date: {
               isOffset: true,
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
            string: 'will be evening',
            target_date: {
               dates: now.getUTCDate(),
               hours: 20,
               minutes: 30,
               months: now.getUTCMonth()
            },
         }
      ]
   },
   {
      in: 'test every 3 months 4 hours 10 minutes 5 seconds',
      outs: [
         {
            period_time: {
               dates: 90,
               hours: 4,
               minutes: 10,
               seconds: 5
            },
            string: 'test'
         }
      ]
   },
   {
      in: 'test every 3 months 4 hours 10 minutes 5 seconds until 9 a.m.',
      outs: [
         {
            max_date: {
               hours: 9,
               isFixed: true
            },
            period_time: {
               dates: 90,
               hours: 4,
               minutes: 10,
               seconds: 5
            },
            string: 'test'
         }
      ]
   },
   {
      in: '12 o\'clock',
      outs: [
         {
            string: '',
            target_date: {
               hours: 12,
               isFixed: true
            }
         }
      ]
   }
];

module.exports = tests;