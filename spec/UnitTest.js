const { TimeList } = require('../lib/date-parser');

class UnitTestResult {
    /**@type {TimeList} */
    max_date;
    /**@type {TimeList} */
    period_time;
    /**@type {String} */
    string;
    /**@type {TimeList} */
    target_date;
    /**@type {Boolean} */
    precisely;
}

class UnitTest {
    /**@type {String} */
    in;
    /**@type {Array.<UnitTestResult>} */
    outs;
}

module.exports = {
    UnitTest
};