class ParsedTime {
    /**@type {Number} */
    value;
    /**@type {Number} */
    index;
    constructor(value, index) {
        this.value = value;
        this.index = index;
    }
}

class TimeList {
    /**@type {Array.<ParsedTime>} */
    seconds = [];
    /**@type {Array.<ParsedTime>} */
    minutes = [];
    /**@type {Array.<ParsedTime>} */
    hours = [];
    /**@type {Array.<ParsedTime>} */
    dates = [];
    /**@type {Array.<ParsedTime>} */
    months = [];
    /**@type {Array.<ParsedTime>} */
    years = [];
    constructor() {
    }
}

let parseCases = [
    function (a) {

    }
];

function extractDates(words) {
    let timeList = new TimeList();

    for(let parseCase of parseCases) {
        parseCase(words, timeList);
    }
}

module.exports = {
    extractDates
}