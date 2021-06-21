const { UT, UTResult } = require('./UnitTest');

const now = new Date();
const day = now.getDay();
const nextSaturday = (day >= 6 ? 7 + 6 - day : 6 - day);

/**@type {Array.<UT>} */
const tests = [
   new UT("something at 6 o'clock pm",
      [
         new UTResult({
            string: 'something',
            target_date: {
               hours: 18,
               isFixed: true
            }
         })
      ]),
   new UT("something at 6 o'clock pm",
      [
         new UTResult({
            string: 'something',
            target_date: {
               hours: 18,
               isFixed: true
            }
         })
      ]),
   new UT('go to the cinema on next   thursday at 12:30 34 seconds',
      [
         new UTResult({
            string: 'go to the cinema',
            target_date: {
               dates: now.getDate() + (day >= 4 ? 7 + 4 - day : 4 - day),
               hours: 12,
               minutes: 30,
               seconds: 34,
               isFixed: true
            },
            precisely: false
         })
      ]),
   new UT('open window on submarine at      5 minutes to 7 pm',
      [
         new UTResult({
            string: 'open window on submarine',
            target_date: {
               hours: 18,
               minutes: 55,
               isFixed: true
            }
         })
      ]),
   new UT('visit doctor from 9 a.m.  to 11 p.m. on next Saturday and go to shop at 7 p.m.',
      [
         new UTResult({
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
         }),
         new UTResult({
            string: 'go to shop',
            target_date: {
               hours: 19,
               isFixed: true
            }
         })
      ]),
   new UT('come home in 10  seconds 20 minutes  30 hours. Buy milk  and wash car on monday Wash my car ',
      [
         new UTResult({
            string: 'come home',
            target_date: {
               hours: now.getUTCHours() + 30,
               minutes: now.getUTCMinutes() + 20,
               seconds: now.getUTCSeconds() + 10,
               isOffset: true
            },
            precisely: false
         }),
         new UTResult({
            string: 'Buy  milk and wash car Wash my car',
            target_date: {
               dates: now.getUTCDate() + (day > 1 ? 7 + 1 - day : 1 - day),
               isOffset: false
            },
            precisely: false
         }),
      ]),
   new UT('come  home at half past 12',
      [
         new UTResult({
            string: 'come home',
            target_date: {
               hours: 12,
               minutes: 30
            }
         })
      ]),
   new UT('Turn off the gas in 1 hour 20  minutes',
      [
         new UTResult({
            string: 'Turn off the gas',
            target_date: {
               hours: now.getUTCHours() + 1,
               minutes: now.getUTCMinutes() + 20
            },
            precisely: false
         })
      ]),
   new UT('On 19 of September From 9:00 to 20:00 Get up from the computer every 15 minutes and do a warm-up',
      [
         new UTResult({
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
         })
      ]),
   new UT('every 5 minutes until 20 hours',
      [
         new UTResult({
            max_date: {
               hours: 20
            },
            period_time: {
               minutes: 5
            },
            string: '',
         })
      ]),
   new UT('Water flowers after tomorrow at 10 minutes to 7 p.m.',
      [
         new UTResult({
            string: 'Water flowers',
            target_date: {
               dates: now.getUTCDate() + 2,
               hours: 18,
               isFixed: true,
               minutes: 50
            },
            precisely: false
         })
      ]),
   new UT('cake in 20S 2H 5m 5D 20Y and at 7M something',
      [
         new UTResult({
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
         }),
         new UTResult({
            string: 'something',
            target_date: {
               months: 6
            }
         })
      ]),
   new UT('testset read every 7 days 1 year 5 hours for 3 times',
      [
         new UTResult({
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
         })
      ]),
   new UT('multy every minute 5 times, test every 4 days 2 year for 2 times, ok in 1 month',
      [
         new UTResult({
            max_date: {
               minutes: 5,
               isOffset: true
            },
            period_time: {
               minutes: 1
            },
            string: 'multy'
         }),
         new UTResult({
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
         }),
         new UTResult({
            string: 'ok',
            target_date: {
               months: now.getUTCMonth() + 1,
               isOffset: true
            }
         })
      ]),
   new UT('drink water 10 times every 40 minutes',
      [
         new UTResult({
            max_date: {
               minutes: 400,
               isOffset: true
            },
            period_time: {
               minutes: 40
            },
            string: 'drink water'
         })
      ]),
   new UT('gest 10 times every half hour and something in 10 minutes',
      [
         new UTResult({
            max_date: {
               minutes: 300,
               isOffset: true
            },
            period_time: {
               minutes: 30
            },
            string: 'gest'
         }),
         new UTResult({
            string: 'something',
            target_date: {
               isOffset: true,
               minutes: now.getUTCMinutes() + 10
            },
            precisely: false
         })
      ]),
   new UT('---——— in next day, and ———--- in next year',
      [
         new UTResult({
            string: '---———',
            target_date: {
               dates: now.getUTCDate() + 1,
               isOffset: true
            },
            precisely: false
         }),
         new UTResult({
            string: '———---',
            target_date: {
               isOffset: true,
               years: now.getUTCFullYear() + 1
            },
            precisely: false
         })
      ]),
   new UT('Today at half past 20 will be evening',
      [
         new UTResult({
            string: 'will be evening',
            target_date: {
               dates: now.getUTCDate(),
               hours: 20,
               minutes: 30,
               months: now.getUTCMonth()
            },
         })
      ]),
   new UT('test every 3 months 4 hours 10 minutes 5 seconds',
      [
         new UTResult({
            period_time: {
               dates: 90,
               hours: 4,
               minutes: 10,
               seconds: 5
            },
            string: 'test'
         })
      ]),
   new UT('test every 3 months 4 hours 10 minutes 5 seconds until 9 a.m.',
      [
         new UTResult({
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
         })
      ]),
   new UT('12 o\'clock',
      [
         new UTResult({
            string: '',
            target_date: {
               hours: 12,
               isFixed: true
            }
         })
      ]),
   new UT('test at 3pm',
      [
         new UTResult({
            string: 'test',
            target_date: {
               hours: 15,
               isFixed: true
            }
         })
      ]),
   new UT('test2 at 3a.m.',
      [
         new UTResult({
            string: 'test2',
            target_date: {
               hours: 3,
               isFixed: true
            }
         })
      ]),
   new UT('test at 9.43534 p.m.',
      [
         new UTResult({
            string: 'test',
            target_date: {
               hours: 21.43534,
               isFixed: true
            }
         })
      ]),
   new UT('test at 9 Dec and something at 30 Sept',
      [
         new UTResult({
            string: 'test',
            target_date: {
               dates: 9,
               months: 11
            }
         }),
         new UTResult({
            string: 'something',
            target_date: {
               dates: 30,
               months: 8
            }
         })
      ]),
   new UT('Jun 25 13:02:30 (none)',
      [
         new UTResult({
            string: '(none)',
            target_date: {
               dates: 25,
               hours: 13,
               minutes: 2,
               months: 5,
               seconds: 30,
               isFixed: true
            }
         })
      ]),
   new UT('test in 19 0 8',
      [
         new UTResult({
            string: 'test',
            target_date: {
               hours: 19,
               minutes: 8
            }
         })
      ], 20),
   new UT('is in 16 0 5', []),
   new UT('not test in 23 33',
      [
         new UTResult({
            string: 'not test',
            target_date: {
               hours: 23,
               minutes: 33
            }
         })
      ], 20),
   new UT('extra at 22 77', [], 20)
];

module.exports = tests;