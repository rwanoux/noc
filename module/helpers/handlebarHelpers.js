export function registerHelpers() {

    Handlebars.registerHelper('repeat', function (n, block) {
        var accum = '';
        for (var i = 0; i < n; ++i) {
            block.data.index = i;
            block.data.first = i === 0;
            block.data.last = i === (n - 1);
            accum += block.fn(this);
        }
        return accum;
    });
    Handlebars.registerHelper('ifArrayContains', function (array, item, block) {
        if (array.indexOf(item) != -1) {
            return block.fn(this);
        }
        return block.inverse(this);
    });
    Handlebars.registerHelper('ifequal', function (a, b, options) {
        if (a == b) { return options.fn(this); }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifnotequal', function (a, b, options) {
        if (a != b) { return options.fn(this); }
        return options.inverse(this);
    })
    Handlebars.registerHelper('ifgt', function (a, b, options) {
        if (a > b) { return options.fn(this); }
        return options.inverse(this);
    });
    Handlebars.registerHelper('iflt', function (a, b, options) {
        if (a < b) { return options.fn(this); }
        return options.inverse(this);
    });
    Handlebars.registerHelper('ifgteq', function (a, b, options) {
        if (a >= b) { return options.fn(this); }
        return options.inverse(this);
    });
    Handlebars.registerHelper('iflteq', function (a, b, options) {
        if (a <= b) { return options.fn(this); }
        return options.inverse(this);
    });


    Handlebars.registerHelper('isNull', function (val) {
        return val == null;
    });

    Handlebars.registerHelper('isEmpty', function (list) {
        if (list) return list.length == 0;
        else return 0;
    });

    Handlebars.registerHelper('notEmpty', function (list) {
        return list.length > 0;
    });

    Handlebars.registerHelper('isNegativeOrNull', function (val) {
        return val <= 0;
    });

    Handlebars.registerHelper('isNegative', function (val) {
        return val < 0;
    });

    Handlebars.registerHelper('isPositive', function (val) {
        return val > 0;
    });

    Handlebars.registerHelper('equals', function (val1, val2) {
        return val1 == val2;
    });

    Handlebars.registerHelper('neq', function (val1, val2) {
        return val1 !== val2;
    });

    Handlebars.registerHelper('gt', function (val1, val2) {
        return val1 > val2;
    });

    Handlebars.registerHelper('lt', function (val1, val2) {
        return val1 < val2;
    });

    Handlebars.registerHelper('gte', function (val1, val2) {
        return val1 >= val2;
    });

    Handlebars.registerHelper('lte', function (val1, val2) {
        return val1 <= val2;
    });
    Handlebars.registerHelper('and', function (val1, val2) {
        return val1 && val2;
    });

    Handlebars.registerHelper('or', function (val1, val2) {
        return val1 || val2;
    });

    Handlebars.registerHelper('not', function (cond) {
        return !cond;
    });

    Handlebars.registerHelper('count', function (list) {
        return list.length;
    });



    Handlebars.registerHelper('split', function (str, separator, keep) {
        return str.split(separator)[keep];
    });

    Handlebars.registerHelper('concat', function () {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('add', function (a, b) {
        return parseInt(a) + parseInt(b);
    });

    Handlebars.registerHelper('valueAtIndex', function (arr, idx) {
        return arr[idx];
    });


    Handlebars.registerHelper("log", function (message) {
        console.log(message);
    })
}