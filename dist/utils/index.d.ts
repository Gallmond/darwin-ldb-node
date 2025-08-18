type GenericObject = {
    [s: string]: unknown;
};
/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
export declare const boolify: (value: unknown) => boolean | null;
export declare const objectOnly: <T extends GenericObject>(obj: T, ...only: string[]) => GenericObject;
/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
export declare const arrayWrap: <T>(value: unknown) => T[];
export {};
//# sourceMappingURL=index.d.ts.map