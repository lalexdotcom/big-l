"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var StringUtils_1 = __importDefault(require("./StringUtils"));
var UID_KEY = '__$$uid';
var UID_INDEX = 0;
var ObjectUtils = /** @class */ (function () {
    function ObjectUtils() {
    }
    ObjectUtils.uid = function (o) {
        if (typeof o == 'object') {
            if (!o[UID_KEY]) {
                var uid = "" + ++UID_INDEX + new Date().getTime();
                Object.defineProperty(o, UID_KEY, { value: uid, enumerable: false });
            }
            else {
                return o[UID_KEY];
            }
        }
        return null;
    };
    ObjectUtils.clearUid = function (o) {
        if (o[UID_KEY])
            delete o[UID_KEY];
    };
    ObjectUtils.mapKeys = function (o, fct, deep) {
        if (deep === void 0) { deep = false; }
        if (typeof o != 'object')
            return o;
        var r = {};
        for (var k in o) {
            var v = o[k];
            r[fct(k)] = deep && v.constructor == Object ? ObjectUtils.mapKeys(o[k], fct, true) : o[k];
        }
        return r;
    };
    ObjectUtils.camelToSnake = function (o, recursive) {
        if (recursive === void 0) { recursive = false; }
        return ObjectUtils.mapKeys(o, StringUtils_1.default.camelToSnake, recursive);
    };
    ObjectUtils.snakeToCamel = function (o, recursive) {
        if (recursive === void 0) { recursive = false; }
        return ObjectUtils.mapKeys(o, StringUtils_1.default.snakeToCamel, recursive);
    };
    ObjectUtils.map = function (o, fct) {
        var r = {};
        for (var k in o) {
            r[k] = fct(o[k], k);
        }
        return r;
    };
    ObjectUtils.toRegistry = function (a, key) {
        return a.reduce(function (red, v) {
            var _a;
            return (__assign(__assign({}, red), (_a = {}, _a[typeof key == 'string' ? key : key(v)] = v, _a)));
        }, {});
    };
    ObjectUtils.isEmpty = function (o) {
        for (var k in o)
            if (o[k] !== undefined)
                return false;
        return true;
    };
    ObjectUtils.pick = function (source, fields) {
        var newObject = {};
        ObjectUtils.assign(newObject, source, fields);
        return newObject;
    };
    ObjectUtils.exclude = function (source, fields) {
        var actualKeys = Object.keys(source);
        var keepKeys = [];
        for (var _i = 0, actualKeys_1 = actualKeys; _i < actualKeys_1.length; _i++) {
            var k = actualKeys_1[_i];
            if (fields.indexOf(k) < 0)
                keepKeys.push(k);
        }
        return this.pick(source, keepKeys);
    };
    ObjectUtils.assign = function (target, source, fields) {
        fields = fields || Object.keys(source);
        var valueObject = {};
        var assignProperty = function (tgt, key, value) {
            if (value !== undefined)
                tgt[key] = value;
        };
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var k = fields_1[_i];
            if (!k)
                continue;
            if (typeof k == 'string') {
                assignProperty(valueObject, k, source[k]);
            }
            else {
                var ck = k;
                for (var fk in ck) {
                    var src = ck[fk];
                    if (typeof src == 'string') {
                        var sourceKey = ck[fk];
                        assignProperty(valueObject, fk, source[sourceKey]);
                    }
                    else if (typeof src == 'function') {
                        assignProperty(valueObject, fk, src(source));
                    }
                }
            }
        }
        Object.assign(target, valueObject);
    };
    ObjectUtils.isDifferent = function (o1, o2, fields, strict) {
        if (strict === void 0) { strict = true; }
        for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
            var k = fields_2[_i];
            if (strict && o1[k] !== o2[k])
                return true;
            if (!strict && o1[k] != o2[k])
                return true;
        }
        return false;
    };
    ObjectUtils.isDefined = function (o) {
        return o !== null && o !== undefined;
    };
    return ObjectUtils;
}());
exports.default = ObjectUtils;
