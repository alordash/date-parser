const { UT, UTResult } = require('./UnitTest');

const now = new Date();
const day = now.getUTCDay();

/**@type {Array.<UnitTest>} */
const tests = [
   new UT('завтра 31 декабря в без 1 минут 9 вечера напомни позвонить послезавтра в центр', [
      new UTResult({
         string: '31 декабря напомни позвонить послезавтра в центр',
         target_date: {
            dates: now.getUTCDate() + 1,
            hours: 20,
            minutes: 59,
            months: now.getUTCMonth(),
            isFixed: true
         },
         precisely: false
      }),
      new UTResult({
         string: 'завтра в без 1 минут 9 вечера напомни позвонить послезавтра в центр',
         target_date: {
            dates: 31,
            months: 11
         }
      }),
      new UTResult({
         string: 'завтра 31 декабря в без 1 минут 9 вечера напомни позвонить в центр',
         target_date: {
            dates: now.getUTCDate() + 2,
            months: now.getUTCMonth()
         },
         precisely: false
      })
   ]),
   new UT('6 апреля в 15:59, 9 марта за водой в 40 секунд и за хлебом, 20 минут 6 часов 50 июля 45 года и 2010 года но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей. Это новый контекст в 15:00, а то другой, и рядом с ним еще один на 10:00 января.', [
      new UTResult({
         string: 'за водой и за хлебом',
         target_date: {
            dates: 6,
            hours: 15,
            minutes: 59,
            months: 3,
            isFixed: true
         }
      }),
      new UTResult({
         string: 'за водой и за хлебом',
         target_date: {
            dates: 9,
            months: 2,
            seconds: 40
         }
      }),
      new UTResult({
         string: '50 июля',
         target_date: {
            hours: 6,
            minutes: 20,
            years: 45
         }
      }),
      new UTResult({
         string: 'но и что-нибудь еще возможно, а также проверю разделение на контексты и использование разделителей',
         target_date: {
            years: 2010
         }
      }),
      new UTResult({
         string: 'Это новый контекст а то другой',
         target_date: {
            hours: 15,
            minutes: 0,
            isFixed: true
         }
      }),
      new UTResult({
         string: 'рядом с ним еще один января',
         target_date: {
            hours: 10,
            minutes: 0,
            isFixed: true
         }
      })
   ]),
   new UT('а 20.12.2020 и 5.05 что-то. то что в 10:20', [
      new UTResult({
         string: 'а',
         target_date: {
            dates: 20,
            months: 11,
            years: 2020
         }
      }),
      new UTResult({
         string: 'что-то',
         target_date: {
            dates: 5,
            months: 4
         }
      }),
      new UTResult({
         string: 'то что',
         target_date: {
            hours: 10,
            minutes: 20,
            isFixed: true
         }
      })
   ]),
   new UT('Сходить на улицу в среду без 59 20 утра', [
      new UTResult({
         string: 'Сходить на улицу',
         target_date: {
            dates: now.getDate() + (day > 3 ? 7 + 3 - day : 3 - day),
            hours: 7,
            minutes: 1,
            isFixed: true
         },
         precisely: false
      })
   ]),
   new UT('Полить цветы в 10 часов 40 минут 30 секунд утра 13 ноября 2022 года', [
      new UTResult({
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
      })
   ]),
   new UT('Полить цветы вечером в 10 часов 40 минут 30 секунд 13 ноября 2022 года', [
      new UTResult({
         string: 'Полить цветы',
         target_date: {
            dates: 13,
            hours: 22,
            minutes: 40,
            months: 10,
            seconds: 30,
            years: 2022
         }
      })
   ]),
   new UT('6 апреля в 15.00 Посылка', [
      new UTResult({
         string: 'Посылка',
         target_date: {
            dates: 6,
            hours: 15,
            minutes: 0,
            months: 3,
            isFixed: true
         }
      })
   ]),
   new UT('17 декабря в 15.30 к врачу', [
      new UTResult({
         string: 'к врачу',
         target_date: {
            dates: 17,
            hours: 15,
            minutes: 30,
            months: 11,
            isFixed: true
         }
      })
   ]),
   new UT('купить в без 20 10 вечера 13 декабря 2030 года', [
      new UTResult({
         string: 'купить',
         target_date: {
            dates: 13,
            hours: 21,
            minutes: 40,
            months: 11,
            years: 2030,
            isFixed: true
         }
      })
   ]),
   new UT('пусто', []
   ),
   new UT('запустить пк послезавтра 30 августа в 5:06 в 2037 году', [
      new UTResult({
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
      }),
      new UTResult({
         string: 'запустить пк послезавтра в 5:06 в 2037 году',
         target_date: {
            dates: 30,
            months: 7
         }
      })
   ]),
   new UT('Полить цветы через 34 года 2 месяца 10 часов 40 минут 30 секунд 13 ноября 2022 года', [
      new UTResult({
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
      }),
      new UTResult({
         string: 'Полить цветы через 34 года 2 месяца 10 часов 40 минут 30 секунд',
         target_date: {
            dates: 13,
            months: 10,
            years: 2022,
            isOffset: false
         }
      })
   ]),
   new UT('Через 10 минут купить цветы, С 10 часов 40 минут 30 секунд вечера 13 ноября 2021 года до 15 января 2023 года Поливать цветы ', [
      new UTResult({
         string: 'купить цветы',
         target_date: {
            minutes: now.getUTCMinutes() + 10,
            isOffset: true
         },
         precisely: false
      }),
      new UTResult({
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
      })
   ]),
   new UT('что-то каждый понедельник', [
      new UTResult({
         period_time: {
            dates: 7
         },
         string: 'что-то',
         target_date: {
            dates: now.getUTCDate() + (day > 1 ? 7 + 1 - day : 1 - day),
         },
         precisely: false
      })
   ]),
   new UT('не что-то каждый день', [
      new UTResult({
         period_time: {
            dates: 1
         },
         string: 'не что-то'
      })
   ]),
   new UT('то, что каждые 5 секунд 10 минут 23 часов с 5 часов до 7 часов, 123 в 25 году', [
      new UTResult({
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
      }),
      new UTResult({
         string: '123',
         target_date: {
            years: 25
         }
      })
   ]),
   new UT('что-то до 10 числа 5 часов 20 минут', [
      new UTResult({
         max_date: {
            dates: 10,
            hours: 5,
            minutes: 20
         },
         string: 'что-то',
      })
   ]),
   new UT('прогулка через полчаса', [
      new UTResult({
         string: 'прогулка',
         target_date: {
            minutes: now.getUTCMinutes() + 30,
            isOffset: true
         },
         precisely: false
      })
   ]),
   new UT('тест на без 15 10 вечера', [
      new UTResult({
         string: 'тест',
         target_date: {
            hours: 21,
            minutes: 45
         }
      })
   ]),
   new UT('кратко через 20С 2ч 5м 5д 20г и в 6М что-то', [
      new UTResult({
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
      }),
      new UTResult({
         string: 'что-то',
         target_date: {
            months: 5
         }
      })
   ]),
   new UT('а тут ты 20 минут утром русский написал и всн', [
      new UTResult({
         string: 'а тут ты утром русский написал и всн',
         target_date: {
            isFixed: false,
            isOffset: false,
            minutes: 20
         }
      })
   ]),
   new UT('тест в foo. тест 18:30', [
      new UTResult({
         string: 'тест в foo. тест',
         target_date: {
            isFixed: true,
            isOffset: false,
            hours: 18,
            minutes: 30
         }
      })
   ]),
   new UT('что-т каждые 3 час 2 дней 5 минут по 5 раз', [
      new UTResult({
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
      })
   ]),
   new UT('тест 5 минут по 20 раз и еще текст, и еще тест через 4 минуты', [
      new UTResult({
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
      }),
      new UTResult({
         string: 'еще тест',
         target_date: {
            minutes: now.getUTCMinutes() + 4,
            isOffset: true
         },
         precisely: false
      })
   ]),
   new UT('выпить таблетки 5 раз каждые 30 минут', [
      new UTResult({
         max_date: {
            minutes: 150,
            isOffset: true
         },
         period_time: {
            minutes: 30,
         },
         string: 'выпить таблетки'
      })
   ]),
   new UT('тест каждые полчаса до 10 часов вечера', [
      new UTResult({
         max_date: {
            hours: 22,
            isFixed: true
         },
         period_time: {
            minutes: 30
         },
         string: "тест"
      })
   ]),
   new UT('ч-т-о-т-о в следующий час', [
      new UTResult({
         string: 'ч-т-о-т-о',
         target_date: {
            hours: now.getUTCHours() + 1,
            isOffset: true
         },
         precisely: false
      })
   ]),
   new UT('отложить через день', [
      new UTResult({
         string: 'отложить',
         target_date: {
            dates: now.getUTCDate() + 1,
            isOffset: true,
         },
         precisely: false
      })
   ]),
   new UT('Сегодня в 21:00 будет вечер', [
      new UTResult({
         string: 'будет вечер',
         target_date: {
            dates: now.getUTCDate(),
            hours: 21,
            minutes: 0,
            months: now.getUTCMonth()
         },
      })
   ]),
   new UT('каждые 10 дней в 23.30 текст', [
      new UTResult({
         period_time: {
            dates: 10
         },
         string: 'текст',
         target_date: {
            hours: 23,
            isFixed: true,
            minutes: 30
         }
      })
   ]),
   new UT('тест каждые 3 месяца 4 часа 10 минут 5 секунд', [
      new UTResult({
         period_time: {
            dates: 90,
            hours: 4,
            minutes: 10,
            seconds: 5
         },
         string: 'тест'
      })
   ]),
   new UT('тест каждые 3 месяца 4 часа 10 минут 5 секунд до 8 утра', [
      new UTResult({
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
      })
   ]),
   new UT('15 часов', [
      new UTResult({
         string: '',
         target_date: {
            hours: 15,
            isFixed: true
         }
      })
   ]),
   new UT('1тест завтра в 2ч, 2тест завтра в 2ч', [
      new UTResult({
         string: '1тест',
         target_date: {
            dates: now.getUTCDate() + 1,
            hours: 2,
            months: now.getUTCMonth()
         }
      }),
      new UTResult({
         string: '2тест',
         target_date: {
            dates: now.getUTCDate() + 1,
            hours: 2,
            months: now.getUTCMonth()
         }
      })
   ]),
   new UT('тест через 1.5 часа', [
      new UTResult({
         string: 'тест',
         target_date: {
            hours: now.getUTCHours() + 1.5,
            isOffset: true
         }
      })
   ]),
   new UT('test 1.5 для', []),
   new UT('тест 30 мая и что-то 5 июл', [
      new UTResult({
         string: 'тест',
         target_date: {
            dates: 30,
            months: 4
         }
      }),
      new UTResult({
         string: 'что-то',
         target_date: {
            dates: 5,
            months: 6
         }
      })
   ]),
   new UT('Авг 10 что-то', [
      new UTResult({
         string: 'что-то',
         target_date: {
            dates: 10,
            months: 7
         }
      })
   ]),
   new UT('тест в 9 0 5', [
      new UTResult({
         string: 'тест',
         target_date: {
            hours: 9,
            minutes: 5
         }
      })
   ], 20),
   new UT('есть в 9 0 5', []),
   new UT('не тест в 9 0', [
      new UTResult({
         string: 'не тест',
         target_date: {
            hours: 9,
            minutes: 0
         }
      })
   ], 20),
   new UT('есть в 9 5 5', [], 20),
   new UT('что-то сегодня в 5ч и завтра', [
      new UTResult({
         string: 'что-то',
         target_date: {
            dates: now.getUTCDate(),
            months: now.getUTCMonth(),
            hours: 5
         }
      }),
      new UTResult({
         string: 'что-то',
         target_date: {
            dates: now.getUTCDate() + 1,
            months: now.getUTCMonth()
         }
      })
   ]),
   new UT('тест 48 мая и что-то 5 июл', [
      new UTResult({
         string: 'тест 48 мая и что-то',
         target_date: {
            dates: 5,
            months: 6
         }
      })
   ]),
   new UT('тест через 2 дня', [
      new UTResult({
         string: 'тест',
         target_date: {
            dates: now.getUTCDate() + 2,
            isOffset: true
         }
      })
   ]),
   new UT('•◘♠♣♦♥☻☺ каждый день до после завтра', [
      new UTResult({
         string: '•◘♠♣♦♥☻☺',
         period_time: {
            dates: 1
         },
         max_date: {
            dates: now.getUTCDate() + 2
         }
      })
   ]),
   new UT(
      `Янв 18 15:49:04 номер 1
Фев 19 15:48:04 номер 2
Мар 20 15:47:04 номер 3
Апр 21 15:46:04 номер 4
Май 22 15:45:04 номер 5
Июн 23 15:44:04 номер 6
Июл 24 15:43:04 номер 7
Сен 25 15:42:04 номер 8
Ноя 26 15:41:03 номер 9`, [
      new UTResult({
         string: 'номер 1',
         target_date: {
            dates: 18,
            hours: 15,
            minutes: 49,
            seconds: 4,
            months: 0
         }
      }),
      new UTResult({
         string: 'номер 2',
         target_date: {
            dates: 19,
            hours: 15,
            minutes: 48,
            seconds: 4,
            months: 1
         }
      }),
      new UTResult({
         string: 'номер 3',
         target_date: {
            dates: 20,
            hours: 15,
            minutes: 47,
            seconds: 4,
            months: 2
         }
      }),
      new UTResult({
         string: 'номер 4',
         target_date: {
            dates: 21,
            hours: 15,
            minutes: 46,
            seconds: 4,
            months: 3
         }
      }),
      new UTResult({
         string: 'номер 5',
         target_date: {
            dates: 22,
            hours: 15,
            minutes: 45,
            seconds: 4,
            months: 4
         }
      }),
      new UTResult({
         string: 'номер 6',
         target_date: {
            dates: 23,
            hours: 15,
            minutes: 44,
            seconds: 4,
            months: 5
         }
      }),
      new UTResult({
         string: 'номер 7',
         target_date: {
            dates: 24,
            hours: 15,
            minutes: 43,
            seconds: 4,
            months: 6
         }
      }),
      new UTResult({
         string: 'номер 8',
         target_date: {
            dates: 25,
            hours: 15,
            minutes: 42,
            seconds: 4,
            months: 8
         }
      }),
      new UTResult({
         string: 'номер 9',
         target_date: {
            dates: 26,
            hours: 15,
            minutes: 41,
            seconds: 3,
            months: 10
         }
      })
   ])
];

module.exports = tests;