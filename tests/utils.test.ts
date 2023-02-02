import { objectOnly, boolify } from '../src/utils'

describe('Util functions work as expected', () => {

    test('boolify', () => {
        expect(boolify('True')).toBe(true)
        expect(boolify('true')).toBe(true)
        expect(boolify(true)).toBe(true)
        expect(boolify('False')).toBe(false)
        expect(boolify('false')).toBe(false)
        expect(boolify(false)).toBe(false)

        // unclear ones should be null
        expect(boolify('aaa')).toBe(null)
        expect(boolify('')).toBe(null)
        expect(boolify(null)).toBe(null)
    })

    test('objectOnly', () => {

        const subObject = {sub: 'object'}

        const someObject = {
            foo: 'bar',
            fizz: 123,
            buzz: subObject,
            hello: null,
            do: 'not',
            include: 'these'
        }

        const getProps = [
            'foo', 'fizz', 'buzz', 'hello'
        ]

        const filtered = objectOnly(someObject, ...getProps)

        getProps.forEach(propName => {
            expect(filtered).toHaveProperty(propName)

            if(propName === 'buzz'){
                expect(filtered[propName]).toBe( subObject )
            }
        })
    })

})