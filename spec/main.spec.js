const { UT, UTResult } = require('./UnitTest');
const { parseDate } = require('../lib/date-parser');
const { isTimeType, isDateType } = require('../lib/date-cases/date-cases');
const RUtests = require('./RU');
const ENtests = require('./EN');

function formatText(string) {
    return string.replace(/  +/g, ' ');
}

/**@param {Array.<UT>} tests */
function RunTests(tests) {
    for (const test of tests) {
        const results = parseDate(test._in, undefined, test._prevalence);
        it(test._in, function () {
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const out = test._outs[i];
                let precise = true;
                if (typeof (out.precisely) != 'undefined') {
                    precise = out.precisely;
                }
                for (const key in result) {
                    if (!isDateType(key) && key != 'string') {
                        continue;
                    }
                    const res_property = result[key];
                    let out_property = out[key];
                    if (typeof (out_property) == 'undefined') {
                        out_property = {};
                    }
                    if (!isDateType(key)) {
                        expect(res_property).toBe(formatText(out_property));
                    } else {
                        for (const time_property in res_property) {
                            if (!res_property.hasOwnProperty(time_property)) {
                                continue;
                            }
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
        });
    }
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

describe('[RU]', function () {
    beforeEach(function () {
        jasmine.addMatchers(matchers);
    });

    RunTests(RUtests);
});

describe('[EN]', function () {
    beforeEach(function () {
        jasmine.addMatchers(matchers);
    });

    RunTests(ENtests);
});

module.exports = {
    RunTests
};