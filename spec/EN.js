const { UT, UTResult } = require('./UnitTest');


const now = new Date();

const second = now.getUTCSeconds();
const minute = now.getUTCMinutes();
const hour = now.getUTCHours();
const date = now.getUTCDate();
const day = now.getUTCDay();
const month = now.getUTCMonth();
const year = now.getUTCFullYear();

const nextSaturday = (day >= 6 ? 7 + 6 - day : 6 - day);

/**@type {Array.<UT>} */
const tests = [
   new UT("something at 6 o'clock pm", [
      new UTResult({
         string: 'something',
         target_date: {
            hours: 18,
            isFixed: true
         }
      })
   ]),
   new UT("something at 6 o'clock pm", [
      new UTResult({
         string: 'something',
         target_date: {
            hours: 18,
            isFixed: true
         }
      })
   ]),
   new UT('go to the cinema on next   thursday at 12:30 34 seconds', [
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
   new UT('open window on submarine at      5 minutes to 7 pm', [
      new UTResult({
         string: 'open window on submarine',
         target_date: {
            hours: 18,
            minutes: 55,
            isFixed: true
         }
      })
   ]),
   new UT('visit doctor from 9 a.m.  to 11 p.m. on next Saturday and go to shop at 7 p.m.', [
      new UTResult({
         max_date: {
            dates: date + (nextSaturday == 0 ? 7 : nextSaturday),
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
   new UT('come home in 10  seconds 20 minutes  30 hours. Buy milk  and wash car on monday Wash my car ', [
      new UTResult({
         string: 'come home',
         target_date: {
            hours: hour + 30,
            minutes: minute + 20,
            seconds: second + 10,
            isOffset: true
         },
         precisely: false
      }),
      new UTResult({
         string: 'Buy  milk and wash car Wash my car',
         target_date: {
            dates: date + (day > 1 ? 7 + 1 - day : 1 - day),
            isOffset: false
         },
         precisely: false
      }),
   ]),
   new UT('come  home at half past 12', [
      new UTResult({
         string: 'come home',
         target_date: {
            hours: 12,
            minutes: 30
         }
      })
   ]),
   new UT('Turn off the gas in 1 hour 20  minutes', [
      new UTResult({
         string: 'Turn off the gas',
         target_date: {
            hours: hour + 1,
            minutes: minute + 20
         },
         precisely: false
      })
   ]),
   new UT('On 19 of September From 9:00 to 20:00 Get up from the computer every 15 minutes and do a warm-up', [
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
   new UT('every 5 minutes until 20 hours', [
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
   new UT('Water flowers after tomorrow at 10 minutes to 7 p.m.', [
      new UTResult({
         string: 'Water flowers',
         target_date: {
            dates: date + 2,
            hours: 18,
            isFixed: true,
            minutes: 50
         },
         precisely: false
      })
   ]),
   new UT('cake in 20S 2H 5m 5D 20Y and at 7M something', [
      new UTResult({
         string: 'cake',
         target_date: {
            dates: date + 5,
            hours: hour + 2,
            isOffset: true,
            minutes: minute + 5,
            seconds: second + 20,
            years: year + 20
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
   new UT('testset read every 7 days 1 year 5 hours for 3 times', [
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
   new UT('multy every minute 5 times, test every 4 days 2 year for 2 times, ok in 1 month', [
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
            months: month + 1,
            isOffset: true
         }
      })
   ]),
   new UT('drink water 10 times every 40 minutes', [
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
   new UT('gest 10 times every half hour and something in 10 minutes', [
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
            minutes: minute + 10
         },
         precisely: false
      })
   ]),
   new UT('---——— in next day, and ———--- in next year', [
      new UTResult({
         string: '---———',
         target_date: {
            dates: date + 1,
            isOffset: true
         },
         precisely: false
      }),
      new UTResult({
         string: '———---',
         target_date: {
            isOffset: true,
            years: year + 1
         },
         precisely: false
      })
   ]),
   new UT('Today at half past 20 will be evening', [
      new UTResult({
         string: 'will be evening',
         target_date: {
            dates: date,
            hours: 20,
            minutes: 30,
            months: month
         },
      })
   ]),
   new UT('test every 3 months 4 hours 10 minutes 5 seconds', [
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
   new UT('test every 3 months 4 hours 10 minutes 5 seconds until 9 a.m.', [
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
   new UT('12 o\'clock', [
      new UTResult({
         string: '',
         target_date: {
            hours: 12,
            isFixed: true
         }
      })
   ]),
   new UT('test at 3pm', [
      new UTResult({
         string: 'test',
         target_date: {
            hours: 15,
            isFixed: true
         }
      })
   ]),
   new UT('test2 at 3a.m.', [
      new UTResult({
         string: 'test2',
         target_date: {
            hours: 3,
            isFixed: true
         }
      })
   ]),
   new UT('test at 9.43534 p.m.', [
      new UTResult({
         string: 'test',
         target_date: {
            hours: 21.43534,
            isFixed: true
         }
      })
   ]),
   new UT('test at 9 Dec and something at 30 Sept', [
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
   new UT('Jun 25 13:02:30 (none)', [
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
   new UT('test in 19 0 8', [
      new UTResult({
         string: 'test',
         target_date: {
            hours: 19,
            minutes: 8
         }
      })
   ], 20),
   new UT('is in 16 0 5', []),
   new UT('not test in 23 33', [
      new UTResult({
         string: 'not test',
         target_date: {
            hours: 23,
            minutes: 33
         }
      })
   ], 20),
   new UT('extra at 22 77', [], 20),
   new UT('at 17:33 and in 10 days something', [
      new UTResult({
         string: 'something',
         target_date: {
            hours: 17,
            minutes: 33
         }
      }),
      new UTResult({
         string: 'something',
         target_date: {
            dates: date + 10
         }
      })
   ]),
   new UT('on 55 august something and 17 september', [
      new UTResult({
         string: 'on 55 august something',
         target_date: {
            dates: 17,
            months: 8
         }
      })
   ]),
   new UT('test in 2 days', [
      new UTResult({
         string: 'test',
         target_date: {
            dates: date + 2,
            isOffset: true
         }
      })
   ]),
   new UT('•◘♠♣♦♥☻☺ every minute 2 days until after tomorrow', [
      new UTResult({
         string: '•◘♠♣♦♥☻☺',
         period_time: {
            dates: 2,
            minutes: 1
         },
         max_date: {
            dates: date + 2
         }
      })
   ]),
   new UT(
      `Aug 18 15:49:04 the test 1
Aug 19 15:48:04 the test 2
Aug 20 15:47:04 the test 3
Aug 21 15:46:04 the test 4
Aug 22 15:45:04 the test 5
Aug 23 15:44:04 the test 6
Aug 24 15:43:04 the test 7
Aug 25 15:42:04 the test 8
Aug 26 15:41:03 the test 9`, [
      new UTResult({
         string: 'the test 1',
         target_date: {
            dates: 18,
            hours: 15,
            minutes: 49,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 2',
         target_date: {
            dates: 19,
            hours: 15,
            minutes: 48,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 3',
         target_date: {
            dates: 20,
            hours: 15,
            minutes: 47,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 4',
         target_date: {
            dates: 21,
            hours: 15,
            minutes: 46,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 5',
         target_date: {
            dates: 22,
            hours: 15,
            minutes: 45,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 6',
         target_date: {
            dates: 23,
            hours: 15,
            minutes: 44,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 7',
         target_date: {
            dates: 24,
            hours: 15,
            minutes: 43,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 8',
         target_date: {
            dates: 25,
            hours: 15,
            minutes: 42,
            seconds: 4,
            months: 7
         }
      }),
      new UTResult({
         string: 'the test 9',
         target_date: {
            dates: 26,
            hours: 15,
            minutes: 41,
            seconds: 3,
            months: 7
         }
      })
   ]),
   new UT('tset in even seconds', [
      new UTResult({
         string: 'tset',
         target_date: {
            seconds: (second & 1) == 0 ? second + 2 : second + 1
         },
         period_time: {
            seconds: 2
         },
         precisely: false
      })
   ]),
   new UT('tset every even minute until 5 hours pm', [
      new UTResult({
         string: 'tset',
         target_date: {
            minutes: (minute & 1) == 0 ? minute + 2 : minute + 1
         },
         period_time: {
            minutes: 2
         },
         max_date: {
            hours: 17
         }
      })
   ]),
   new UT('tset in even hours', [
      new UTResult({
         string: 'tset',
         target_date: {
            hours: (hour & 1) == 0 ? hour + 2 : hour + 1
         },
         period_time: {
            hours: 2
         }
      })
   ]),
   new UT('tset in even days', [
      new UTResult({
         string: 'tset',
         target_date: {
            dates: (date & 1) == 0 ? date + 2 : date + 1
         },
         period_time: {
            dates: 2
         }
      })
   ]),
   new UT('tset every even month', [
      new UTResult({
         string: 'tset',
         target_date: {
            months: month == 0 ? 1 : ((month & 1) == 0 ? month + 2 : month + 1) + 1
         },
         period_time: {
            months: 2
         }
      })
   ]),
   new UT('tset in odd years until 9 may', [
      new UTResult({
         string: 'tset',
         target_date: {
            years: (year & 1) == 1 ? year + 2 : year + 1
         },
         period_time: {
            years: 2
         },
         max_date: {
            dates: 9,
            months: 4
         }
      })
   ]),
   new UT('tst at 9th o\'clock', [
      new UTResult({
         string: 'tst',
         target_date: {
            hours: 9
         }
      })
   ]),
   new UT('tst on 1st of july', [
      new UTResult({
         string: 'tst',
         target_date: {
            dates: 1,
            months: 6
         }
      })
   ]),
   new UT('smth on 2nd friday of december', [
      new UTResult({
         string: 'smth',
         target_date: {
            dates: 6 - (new Date(year, 11)).getDay() + 14,
            months: 11
         }
      })
   ]),
   new UT('n in last day of november', [
      new UTResult({
         string: 'n',
         target_date: {
            dates: new Date(Date.UTC(now.getUTCFullYear(), 11, 0)).getUTCDate(),
            months: 10
         }
      })
   ]),
   new UT('something annYaly', [
      new UTResult({
         string: 'something',
         period_time: {
            years: 1
         }
      })
   ])
];

module.exports = tests;