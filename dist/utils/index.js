"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObject = exports.arrayWrap = void 0;
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
            return Object.assign(Object.assign({}, prev), (0, exports.flattenObject)(value, `${layerPrefix}.`));
        }
        else {
            return Object.assign(Object.assign({}, prev), { [layerPrefix]: value });
        }
    }, {});
};
exports.flattenObject = flattenObject;
