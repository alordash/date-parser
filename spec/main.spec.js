const { parseDate } = require('../lib/date-parser');
const { isTimeType, isDateType } = require('../lib/date-cases/date-cases');
const RUtests = require('./RU');
const ENtests = require('./EN');

function formatText(string) {
    return string.replace(/  +/g, ' ');
}

function RunTests(tests) {
    for (const test of tests) {
        const results = parseDate(test.in);
        it(test.in, function () {
            expect(results.length).toBeGreaterThanOrEqual(test.outs.length);
            for (let i = 0; i < results.length / 2; i++) {
                const result = results[i];
                const out = test.outs[i];
                let precise = true;
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