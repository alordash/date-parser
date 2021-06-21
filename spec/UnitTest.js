const { TimeList } = require('../lib/date-parser');

class UTResult {
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

    /**
     * @param {TimeList} max_date 
     * @param {TimeList} period_time 
     * @param {String} string 
     * @param {TimeList} target_date 
     * @param {Boolean} precisely 
     */
    constructor(obj) {
        if (typeof (obj) != 'undefined') {
            let propNames = Object.getOwnPropertyNames(new UTResult());
            for(const propName of propNames) {
                this[propName] = obj[propName];
            }
        }
    }
}

class UT {
    /**@type {String} */
    _in;
    /**@type {Array.<UTResult>} */
    _outs;
    /**@type {Number} */
    _prevalence;

    /**
     * @param {String} _in 
     * @param {Array.<UTResult>} _outs 
     * @param {Number} _prevalence 
     */
    constructor(_in, _outs, _prevalence = undefined) {
        this._in = _in;
        this._outs = _outs;
        this._prevalence = _prevalence;
    }
}

module.exports = {
    UTResult,
    UT
};