/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
export const boolify = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === "string") {
        const str = value.toLowerCase();
        if (str === "true")
            return true;
        if (str === "false")
            return false;
    }
    return null;
};
export const objectOnly = (obj, ...only) => {
    const type = typeof obj;
    if (type !== "object")
        throw new Error(`cannot iterate on ${type}`);
    return Object.entries(obj).reduce((carry, keyVal) => {
        const [key, val] = keyVal;
        if (only.includes(key)) {
            carry[key] = val;
        }
        return carry;
    }, {});
};
/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
export const arrayWrap = (value) => {
    if (typeof value === "undefined" || value === null) {
        return [];
    }
    return (Array.isArray(value) ? value : [value]);
};
//# sourceMappingURL=index.js.map