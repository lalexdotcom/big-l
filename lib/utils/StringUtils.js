"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Case = void 0;
var Case;
(function (Case) {
    Case[Case["CAMEL"] = 0] = "CAMEL";
    Case[Case["SNAKE"] = 1] = "SNAKE";
    Case[Case["KEBAB"] = 2] = "KEBAB";
    Case[Case["PASCAL"] = 3] = "PASCAL";
})(Case = exports.Case || (exports.Case = {}));
var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.capitalize = function (str, separator) {
        if (separator === void 0) { separator = ' '; }
        return str
            .split(separator)
            .map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); })
            .join(separator);
    };
    StringUtils.toFilename = function (str) {
        var following = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            following[_i - 1] = arguments[_i];
        }
        var strings = __spreadArrays([str], following).map(function (s) {
            return s
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/([^\w^ ]*)/g, '')
                .replace(/([ ]+)/g, '-');
        });
        return strings.join('-');
    };
    StringUtils.normalize = function (str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    StringUtils.splitFromCase = function (str, sourceCase) {
        switch (sourceCase) {
            case Case.KEBAB:
                return str.split("-");
            case Case.SNAKE:
                return str.split("_");
            case Case.CAMEL:
                return str.match(/(([A-Z]?)[a-z]+)/g) || [];
            case Case.PASCAL:
                return str.match(/([A-Z][a-z]+)/g) || [];
        }
    };
    StringUtils.joinToCase = function (elements, targetCase) {
        var _this = this;
        var transform, join = '';
        switch (targetCase) {
            case Case.CAMEL:
                transform = function (element, index) { return (index ? element.toLowerCase() : _this.capitalize(element)); };
                break;
            case Case.SNAKE:
                transform = function (element) { return element.toLowerCase(); };
                join = '_';
                break;
            case Case.KEBAB:
                transform = function (element) { return element.toLowerCase(); };
                join = '-';
                break;
            case Case.PASCAL:
                transform = function (element, index) { return _this.capitalize(element); };
                break;
        }
        return transform ? elements.map(transform).join(join) : elements.join(join);
    };
    StringUtils.changeCase = function (str, fromCase, toCase) {
        return this.joinToCase(this.splitFromCase(str, fromCase), toCase);
    };
    StringUtils.camelToSnake = function (str) {
        return this.joinToCase(this.splitFromCase(str, Case.CAMEL), Case.SNAKE);
        // let matches = str.match(/(([A-Z]?)[a-z]+)/g);
        // return matches ? matches.map(s => s.toLowerCase()).join('_') : str;
    };
    StringUtils.snakeToCamel = function (str) {
        return str
            .split('_')
            .map(function (s, i) { return (i > 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s); })
            .join('');
    };
    return StringUtils;
}());
exports.default = StringUtils;
