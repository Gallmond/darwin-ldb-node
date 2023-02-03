type GenericObject = {
    [s: string]: unknown;
};
/**
 * returns true if val is undefined, or if any nested element of an array or
 * object contains an undefined element or property value
 */
export declare const hasUndefined: (val: unknown) => boolean;
/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
export declare const boolify: (variable: unknown) => boolean | null;
export declare const objectOnly: <Type extends GenericObject>(obj: Type, ...only: string[]) => GenericObject;
/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
export declare const arrayWrap: <Type>(value: unknown) => Type[];
export declare const flattenObject: (object: Record<string, unknown>, prefix?: string) => Record<string, unknown>;
export {};
//# sourceMappingURL=index.d.ts.map