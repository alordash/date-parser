const { parseDate } = require('../lib/date-parser');
const { isTimeType, isDateType } = require('../lib/date-cases');

const now = new Date();
const day = now.getUTCDay();
console.log('day :>> ', day);
const stringTests = [
   {
      in: 'завтра 31 декабря в без 1 минут 9 вечера напомни позвонить послезавтра в центр',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: '31 декабря напомни позвонить послезавтра в центр',
            target_date: {
               dates: now.getUTCDate() + 1,
               hours: 20,
               minutes: 59,
               months: now.getUTCMonth(),
               isFixed: true
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'завтра в без 1 минут 9 вечера напомни позвонить послезавтра в центр',
            target_date: {
               dates: 31,
               months: 11
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'завтра 31 декабря в без 1 минут 9 вечера напомни позвонить в центр',
            target_date: {
               dates: now.getUTCDate() + 2,
               months: now.getUTCMonth()
            }
         }
      ]
   },
   {
      in: '6 апреля в 15:59, 9 марта за водой в 40 секунд и за хлебом, 20 минут 6 часов 50 июля 45 года и 2010 года но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей. Это новый контекст в 15:00, а то другой, и рядом с ним еще один на 10:00 января.',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: '',
            target_date: {
               dates: 6,
               hours: 15,
               minutes: 59,
               months: 3,
               isFixed: true
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'за водой и за хлебом',
            target_date: {
               dates: 9,
               months: 2,
               seconds: 40
            }
         },
         {
            max_date: {},
            period_time: {},
            string: '50 июля',
            target_date: {
               hours: 6,
               minutes: 20,
               years: 45
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей',
            target_date: {
               years: 2010
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'Это новый контекст а то другой',
            target_date: {
               hours: 15,
               minutes: 0,
               isFixed: true
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'рядом с ним еще один января',
            target_date: {
               hours: 10,
               minutes: 0,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'а 20.12.2020 и 5.05 что-то. то что в 10:20',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'а',
            target_date: {
               dates: 20,
               months: 11,
               years: 2020
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'что-то',
            target_date: {
               dates: 5,
               months: 4
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'то что',
            target_date: {
               hours: 10,
               minutes: 20,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'Сходить на улицу в среду без 59 20 утра',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Сходить на улицу',
            target_date: {
               dates: now.getUTCDate() + (day > 3 ? 7 + 3 - day : 3 - day),
               hours: 7,
               minutes: 1,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'Полить цветы в 10 часов 40 минут 30 секунд утра 13 ноября 2022 года',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Полить цветы',
            target_date: {
               dates: 13,
               hours: 10,
               minutes: 40,
               months: 10,
               seconds: 30,
               years: 2022,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'Полить цветы вечером в 10 часов 40 минут 30 секунд 13 ноября 2022 года',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Полить цветы',
            target_date: {
               dates: 13,
               hours: 22,
               minutes: 40,
               months: 10,
               seconds: 30,
               years: 2022
            }
         }
      ]
   },
   {
      in: '6 апреля в 15.00 Посылка',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Посылка',
            target_date: {
               dates: 6,
               hours: 15,
               minutes: 0,
               months: 3,
               isFixed: true
            }
         }
      ]
   },
   {
      in: '17 декабря в 15.30 к врачу',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'к врачу',
            target_date: {
               dates: 17,
               hours: 15,
               minutes: 30,
               months: 11,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'купить в без 20 10 вечера 13 декабря 2030 года',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'купить',
            target_date: {
               dates: 13,
               hours: 21,
               minutes: 40,
               months: 11,
               years: 2030,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'test',
      outs: []
   },
   {
      in: 'запустить пк послезавтра 30 августа в 5:06 в 2037 году',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'запустить пк 30 августа',
            target_date: {
               dates: now.getUTCDate() + 2,
               hours: 5,
               minutes: 6,
               months: now.getUTCMonth(),
               years: 2037,
               isFixed: true
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'запустить пк послезавтра в 5:06 в 2037 году',
            target_date: {
               dates: 30,
               months: 7
            }
         }
      ]
   },
   {
      in: 'Полить цветы через 34 года 2 месяца 10 часов 40 минут 30 секунд 13 ноября 2022 года',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'Полить цветы 13 ноября 2022 года',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours() + 10,
               minutes: now.getUTCMinutes() + 40,
               months: now.getUTCMonth() + 2,
               seconds: now.getUTCSeconds() + 30,
               years: now.getUTCFullYear() + 34,
               isOffset: true
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'Полить цветы через 34 года 2 месяца 10 часов 40 минут 30 секунд',
            target_date: {
               dates: 13,
               months: 10,
               years: 2022,
               isOffset: false
            }
         }
      ]
   },
   {
      in: 'Через 10 минут купить цветы, С 10 часов 40 минут 30 секунд вечера 13 ноября 2021 года до 15 января 2023 года Поливать цветы ',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'купить цветы',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours(),
               minutes: now.getUTCMinutes() + 10,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear(),
               isOffset: true
            }
         },
         {
            max_date: {
               dates: 15,
               months: 0,
               years: 2023
            },
            period_time: {},
            string: 'Поливать цветы',
            target_date: {
               dates: 13,
               hours: 22,
               minutes: 40,
               months: 10,
               seconds: 30,
               years: 2021,
               isOffset: false,
               isFixed: true
            }
         }
      ]
   },
   {
      in: 'что-то каждый понедельник',
      outs: [
         {
            max_date: {},
            period_time: {
               dates: 7
            },
            string: 'что-то',
            target_date: {
               dates: now.getUTCDate() + (day > 1 ? 7 + 1 - day : 1 - day),
            }
         }
      ]
   },
   {
      in: 'не что-то каждый день',
      outs: [
         {
            max_date: {},
            period_time: {
               dates: 1
            },
            string: 'не что-то'
         }
      ]
   },
   {
      in: 'то, что каждые 5 секунд 10 минут 23 часов с 5 часов до 7 часов, 123 в 25 году',
      outs: [
         {
            max_date: {
               hours: 7
            },
            period_time: {
               hours: 23,
               minutes: 10,
               seconds: 5
            },
            string: 'то, что',
            target_date: {
               hours: 5
            }
         },
         {
            max_date: {},
            period_time: {},
            string: '123',
            target_date: {
               years: 25
            }
         }
      ]
   },
   {
      in: 'что-то до 10 числа 5 часов 20 минут',
      outs: [
         {
            max_date: {
               dates: 10,
               hours: 5,
               minutes: 20
            },
            period_time: {},
            string: 'что-то',
            target_date: {}
         }
      ]
   },
   {
      in: 'азбука через полчаса',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'азбука',
            target_date: {
               dates: now.getUTCDate(),
               hours: now.getUTCHours(),
               minutes: now.getUTCMinutes() + 30,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds(),
               years: now.getUTCFullYear(),
               isOffset: true
            }
         }
      ]
   },
   {
      in: 'тест на без 15 10 вечера',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'тест',
            target_date: {
               hours: 21,
               minutes: 45
            }
         }
      ]
   },
   {
      in: 'кратко через 20С 2ч 5м 5д 20г и в 6М что-то',
      outs: [
         {
            max_date: {},
            period_time: {},
            string: 'кратко',
            target_date: {
               dates: now.getUTCDate() + 5,
               hours: now.getUTCHours() + 2,
               isOffset: true,
               minutes: now.getUTCMinutes() + 5,
               months: now.getUTCMonth(),
               seconds: now.getUTCSeconds() + 20,
               years: now.getUTCFullYear() + 20
            }
         },
         {
            max_date: {},
            period_time: {},
            string: 'что-то',
            target_date: {
               months: 5
            }
         }
      ]
   }
];

describe('[RU]', function () {
   for (const test of stringTests) {
      const results = parseDate(test.in);
      let i = results.length;
      it(test.in, function () {
         while (i--) {
            const result = results[i];
            const out = test.outs[i];
            for (const key in out) {
               if (out.hasOwnProperty(key)) {
                  const res_property = result[key];
                  const out_property = out[key];
                  if (!isDateType(key)) {
                     expect(res_property).toBe(out_property);
                  } else {
                     for (const time_property in res_property) {
                        if (res_property.hasOwnProperty(time_property)) {
                           if (typeof (out_property[time_property]) == 'undefined') {
                              if (isTimeType(time_property)) {
                                 expect(res_property[time_property]).toBe(undefined);
                              }
                           } else {
                              expect(res_property[time_property]).toBe(out_property[time_property]);
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