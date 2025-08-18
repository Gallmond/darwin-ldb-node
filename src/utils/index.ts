type GenericObject = { [s: string]: unknown };

/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
export const boolify = (value: unknown): boolean | null => {
  if(typeof value === 'boolean') return value as boolean

  if (typeof value === "string") {
    const str = (value as string).toLowerCase();
    if (str === "true") return true;
    if (str === "false") return false;
  }

  return null;
};

export const objectOnly = <T extends GenericObject>(
  obj: T,
  ...only: string[]
): GenericObject => {
  const type = typeof obj;
  if (type !== "object") throw new Error(`cannot iterate on ${type}`);

  return Object.entries(obj).reduce((carry, keyVal) => {
    const [key, val] = keyVal;
    if (only.includes(key)) {
      carry[key] = val;
    }

    return carry;
  }, {} as GenericObject);
};

/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
export const arrayWrap = <T>(value: unknown) => {
  if (typeof value === "undefined" || value === null) {
    return [] as T[];
  }

  return (Array.isArray(value) ? value : [value]) as T[];
};
