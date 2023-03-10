type GenericObject = {[s: string]: unknown}

/**
 * returns true if val is undefined, or if any nested element of an array or 
 * object contains an undefined element or property value
 */
export const hasUndefined = (val: unknown) => {
    if(val === undefined) return true

    /**
     * Check each element of an array
     */
    if(Array.isArray(val)){
        val.forEach(element => {
            if(hasUndefined(element)){
                return true
            }
        })
    }

    /**
     * check each element of an object.
     * Note: in JS null is an object for some reason
     */
    if(val !== null && typeof val === 'object'){
        const keyValues = Object.entries(val)
        for(const keyValue of keyValues){
            const [, value] = keyValue
            if(hasUndefined(value)){
                return true
            }
        }
    }

    return false
}

/**
 * It's not clear what format the SOAP service returns maybe boolean values as
 * so we can do some best-guesses here
 */
export const boolify = (variable: unknown): boolean | null => {
    const type = typeof variable
    
    if(type === 'boolean' ) return variable as boolean

    if(type === 'string'){
        const str = (variable as string).toLowerCase()
        if(str === 'true') return true
        if(str === 'false') return false
    }

    return null
}

export const objectOnly = <Type extends GenericObject>(obj: Type, ...only: string[]): GenericObject => {
    const type = typeof obj
    if(type !== 'object') throw new Error(`cannot iterate on ${type}`)
    
    return Object.entries(obj).reduce((carry, keyVal) => {
        const [key, val] = keyVal
        if(only.includes(key)){
            carry[key] = val
        }

        return carry
    }, {} as GenericObject)
}

/**
 * takes any value and returns it array-wrapped.
 * - note: null and undefined will return [] rather than [null]
 */
export const arrayWrap = <Type>(value: unknown) => {
    if(
        typeof value === 'undefined'
        || value === null    
    ){
        return [] as Type[]
    }

    return (Array.isArray(value)
        ? value
        : [value]) as Type[]
}

export const flattenObject = (object: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
    return Object.keys(object).reduce((prev, key) => {

        const value = object[key] as unknown
        const layerPrefix = `${prefix}${key}`

        if(
            value
            && typeof value === 'object'
            && !Array.isArray(value)
        ){
            return {...prev, ...flattenObject((value as Record<string, unknown>), `${layerPrefix}.`)}
        }else{
            return {...prev, ...{ [layerPrefix]: value }}
        }

    }, {})
}