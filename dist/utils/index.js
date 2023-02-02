"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObject = exports.arrayWrap = exports.objectOnly = exports.boolify = void 0;
/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
const boolify = (variable) => {
    const type = typeof variable;
    if (type === 'boolean')
        return variable;
    if (type === 'string') {
        const str = variable.toLowerCase();
        if (str === 'true')
            return true;
        if (str === 'false')
            return false;
    }
    return null;
};
exports.boolify = boolify;
const objectOnly = (obj, ...only) => {
    const type = typeof obj;
    if (type !== 'object')
        throw new Error(`cannot iterate on ${type}`);
    return Object.entries(obj).reduce((carry, keyVal) => {
        const [key, val] = keyVal;
        if (only.includes(key)) {
            carry[key] = val;
        }
        return carry;
    }, {});
};
exports.objectOnly = objectOnly;
/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
const arrayWrap = (value) => {
    if (typeof value === 'undefined'
        || value === null) {
        return [];
    }
    return (Array.isArray(value)
        ? value
        : [value]);
};
exports.arrayWrap = arrayWrap;
const flattenObject = (object, prefix = '') => {
    return Object.keys(object).reduce((prev, key) => {
        const value = object[key];
        const layerPrefix = `${prefix}${key}`;
        if (value
            && typeof value === 'object'
            && !Array.isArray(value)) {
            return { ...prev, ...(0, exports.flattenObject)(value, `${layerPrefix}.`) };
        }
        else {
            return { ...prev, ...{ [layerPrefix]: value } };
        }
    }, {});
};
exports.flattenObject = flattenObject;
