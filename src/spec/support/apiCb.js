"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const jet_logger_1 = __importDefault(require("jet-logger"));
/**
 * API callback function.
 */
function apiCb(cb, dateParam = 'created', printErr) {
    return (err, res) => {
        if (printErr) {
            jet_logger_1.default.err(err);
        }
        _strToDate(res.body, dateParam);
        return cb(res);
    };
}
/**
 * When date objects get sent through supertest they are converted to
 * iso-strings. This will cause "toEqual()"" tests to fail, so we need to
 * convert them back to Date objects.
 */
function _strToDate(param, prop) {
    return _iterate(param, prop);
}
/**
 * Interate object recursively and convert string-dates to "Date" objects.
 */
function _iterate(param, prop) {
    if (!param || typeof param !== 'object') {
        return;
    }
    const paramF = param;
    // For Arrays
    if (Array.isArray(paramF)) {
        for (const item of paramF) {
            _iterate(item, prop);
        }
        return;
    }
    // Check valid string or Date object. If undefined just skip
    const val = paramF[prop];
    if ((typeof val !== 'undefined') &&
        !((typeof val === 'string') || (val instanceof Date)) &&
        !(0, moment_1.default)(val).isValid()) {
        throw new Error('Property must be a valid date-string or Date() object');
    }
    // Convert and iterate
    if (typeof val !== 'undefined') {
        paramF[prop] = new Date(val);
    }
    for (const key in paramF) {
        const oval = paramF[key];
        if (typeof oval === 'object' && key !== prop) {
            _iterate(oval, prop);
        }
    }
}
// **** Export default **** //
exports.default = apiCb;
