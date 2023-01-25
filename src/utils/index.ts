
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