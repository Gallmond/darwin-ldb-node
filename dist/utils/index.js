"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObject = exports.arrayWrap = exports.objectOnly = exports.boolify = exports.hasUndefined = void 0;
/**
 * returns true if val is undefined, or if any nested element of an array or
 * object contains an undefined element or property value
 */
const hasUndefined = (val) => {
    if (val === undefined)
        return true;
    /**
     * Check each element of an array
     */
    if (Array.isArray(val)) {
        val.forEach(element => {
            if ((0, exports.hasUndefined)(element)) {
                return true;
            }
        });
    }
    /**
     * check each element of an object.
     * Note: in JS null is an object for some reason
     */
    if (val !== null && typeof val === 'object') {
        const keyValues = Object.entries(val);
        for (const keyValue of keyValues) {
            const [, value] = keyValue;
            if ((0, exports.hasUndefined)(value)) {
                return true;
            }
        }
    }
    return false;
};
exports.hasUndefined = hasUndefined;
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
