const { parseDate } = require('../lib/date-parser');

const now = new Date();
const date = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const month = now.getMonth();
const seconds = now.getSeconds();
const year = now.getFullYear();
const day = now.getDay();
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
   }
];

describe('[RU]', function () {
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