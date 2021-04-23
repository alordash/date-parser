const { UnitTest } = require('./UnitTest');

const now = new Date();
const day = now.getUTCDay();

/**@type {Array.<UnitTest>} */
const tests = [
   {
      in: 'завтра 31 декабря в без 1 минут 9 вечера напомни позвонить послезавтра в центр',
      outs: [
         {
            string: '31 декабря напомни позвонить послезавтра в центр',
            target_date: {
               dates: now.getUTCDate() + 1,
               hours: 20,
               minutes: 59,
               months: now.getUTCMonth(),
               isFixed: true
            },
            precisely: false
         },
         {
            string: 'завтра в без 1 минут 9 вечера напомни позвонить послезавтра в центр',
            target_date: {
               dates: 31,
               months: 11
            }
         },
         {
            string: 'завтра 31 декабря в без 1 минут 9 вечера напомни позвонить в центр',
            target_date: {
               dates: now.getUTCDate() + 2,
               months: now.getUTCMonth()
            },
            precisely: false
         }
      ]
   },
   {
      in: '6 апреля в 15:59, 9 марта за водой в 40 секунд и за хлебом, 20 минут 6 часов 50 июля 45 года и 2010 года но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей. Это новый контекст в 15:00, а то другой, и рядом с ним еще один на 10:00 января.',
      outs: [
         {
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
            string: 'за водой и за хлебом',
            target_date: {
               dates: 9,
               months: 2,
               seconds: 40
            }
         },
         {
            string: '50 июля',
            target_date: {
               hours: 6,
               minutes: 20,
               years: 45
            }
         },
         {
            string: 'но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей',
            target_date: {
               years: 2010
            }
         },
         {
            string: 'Это новый контекст а то другой',
            target_date: {
               hours: 15,
               minutes: 0,
               isFixed: true
            }
         },
         {
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
            string: 'а',
            target_date: {
               dates: 20,
               months: 11,
               years: 2020
            }
         },
         {
            string: 'что-то',
            target_date: {
               dates: 5,
               months: 4
            }
         },
         {
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
            string: 'Сходить на улицу',
            target_date: {
               dates: now.getDate() + (day > 3 ? 7 + 3 - day : 3 - day),
               hours: 7,
               minutes: 1,
               isFixed: true
            },
            precisely: false
         }
      ]
   },
   {
      in: 'Полить цветы в 10 часов 40 минут 30 секунд утра 13 ноября 2022 года',
      outs: [
         {
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
      in: 'пусто',
      outs: []
   },
   {
      in: 'запустить пк послезавтра 30 августа в 5:06 в 2037 году',
      outs: [
         {
            string: 'запустить пк 30 августа',
            target_date: {
               dates: now.getUTCDate() + 2,
               hours: 5,
               minutes: 6,
               months: now.getUTCMonth(),
               years: 2037,
               isFixed: true
            },
            precisely: false
         },
         {
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
            string: 'Полить цветы 13 ноября 2022 года',
            target_date: {
               hours: now.getUTCHours() + 10,
               minutes: now.getUTCMinutes() + 40,
               months: now.getUTCMonth() + 2,
               seconds: now.getUTCSeconds() + 30,
               years: now.getUTCFullYear() + 34,
               isOffset: true
            },
            precisely: false
         },
         {
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
            string: 'купить цветы',
            target_date: {
               minutes: now.getUTCMinutes() + 10,
               isOffset: true
            },
            precisely: false
         },
         {
            max_date: {
               dates: 15,
               months: 0,
               years: 2023
            },
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
            period_time: {
               dates: 7
            },
            string: 'что-то',
            target_date: {
               dates: now.getUTCDate() + (day > 1 ? 7 + 1 - day : 1 - day),
            },
            precisely: false
         }
      ]
   },
   {
      in: 'не что-то каждый день',
      outs: [
         {
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
            string: 'что-то',
         }
      ]
   },
   {
      in: 'прогулка через полчаса',
      outs: [
         {
            string: 'прогулка',
            target_date: {
               minutes: now.getUTCMinutes() + 30,
               isOffset: true
            },
            precisely: false
         }
      ]
   },
   {
      in: 'тест на без 15 10 вечера',
      outs: [
         {
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
            string: 'кратко',
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
            string: 'что-то',
            target_date: {
               months: 5
            }
         }
      ]
   },
   {
      in: 'а тут ты 20 минут утром русский написал и всн',
      outs: [
         {
            string: 'а тут ты утром русский написал и всн',
            target_date: {
               isFixed: false,
               isOffset: false,
               minutes: 20
            }
         }
      ]
   },
   {
      in: 'тест в foo. тест 18:30',
      outs: [
         {
            string: 'тест в foo. тест',
            target_date: {
               isFixed: true,
               isOffset: false,
               hours: 18,
               minutes: 30
            }
         }
      ]
   },
   {
      in: 'что-т каждые 3 час 2 дней 5 минут по 5 раз',
      outs: [
         {
            max_date: {
               minutes: 25,
               hours: 15,
               dates: 10,
               isFixed: false,
               isOffset: true
            },
            period_time: {
               minutes: 5,
               hours: 3,
               dates: 2,
               isFixed: false,
               isOffset: false
            },
            string: 'что-т'
         }
      ]
   },
   {
      in: 'тест 5 минут по 20 раз и еще текст, и еще тест через 4 минуты',
      outs: [
         {
            max_date: {
               minutes: 100,
               isFixed: false,
               isOffset: true
            },
            period_time: {
               minutes: 5,
               isFixed: false,
               isOffset: false
            },
            string: 'тест и еще текст'
         },
         {
            string: 'еще тест',
            target_date: {
               minutes: now.getUTCMinutes() + 4,
               isOffset: true
            },
            precisely: false
         }
      ]
   },
   {
      in: 'выпить таблетки 5 раз каждые 30 минут',
      outs: [
         {
            max_date: {
               minutes: 150,
               isOffset: true
            },
            period_time: {
               minutes: 30,
            },
            string: 'выпить таблетки'
         }
      ]
   },
   {
      in: 'тест каждые полчаса до 10 часов вечера',
      outs: [
         {
            max_date: {
               hours: 22,
               isFixed: true
            },
            period_time: {
               minutes: 30
            },
            string: "тест"
         }
      ]
   },
   {
      in: 'ч-т-о-т-о в следующий час',
      outs: [
         {
            string: 'ч-т-о-т-о',
            target_date: {
               hours: now.getUTCHours() + 1,
               isOffset: true
            },
            precisely: false
         }
      ]
   },
   {
      in: 'отложить через день',
      outs: [
         {
            string: 'отложить',
            target_date: {
               dates: now.getUTCDate() + 1,
               isOffset: true,
            },
            precisely: false
         }
      ]
   },
   {
      in: 'Сегодня в 21:00 будет вечер',
      outs: [
         {
            string: 'будет вечер',
            target_date: {
               dates: now.getUTCDate(),
               hours: 21,
               minutes: 0,
               months: now.getUTCMonth()
            },
         }
      ]
   },
   {
      in: 'каждые 10 дней в 23.30 текст',
      outs: [
         {
            period_time: {
               dates: 10
            },
            string: 'текст',
            target_date: {
               hours: 23,
               isFixed: true,
               minutes: 30
            }
         }
      ]
   },
   {
      in: 'тест каждые 3 месяца 4 часа 10 минут 5 секунд',
      outs: [
         {
            period_time: {
               dates: 90,
               hours: 4,
               minutes: 10,
               seconds: 5
            },
            string: 'тест'
         }
      ]
   },
   {
      in: 'тест каждые 3 месяца 4 часа 10 минут 5 секунд до 8 утра',
      outs: [
         {
            max_date: {
               hours: 8,
               isFixed: true
            },
            period_time: {
               dates: 90,
               hours: 4,
               minutes: 10,
               seconds: 5
            },
            string: 'тест'
         }
      ]
   },
   {
      in: '15 часов',
      outs: [
         {
            string: '',
            target_date: {
               hours: 15,
               isFixed: true
            }
         }
      ]
   },
   {
      in: '1тест завтра в 2ч, 2тест завтра в 2ч',
      outs: [
         {
            string: '1тест',
            target_date: {
               dates: now.getUTCDate() + 1,
               hours: 2,
               months: now.getUTCMonth()
            }
         },
         {
            string: '2тест',
            target_date: {
               dates: now.getUTCDate() + 1,
               hours: 2,
               months: now.getUTCMonth()
            }
         }
      ]
   }
];

module.exports = tests;