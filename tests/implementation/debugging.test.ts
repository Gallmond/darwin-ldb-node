import { readdirSync } from 'fs'

describe('Why are the tests running slow', () => {

    /**
     * Runs fine
     */
    test('No file operations', async () => {
        expect(true).toBe(true)
    })

    /**
     * Runs fine
     */
    test('readdirSync', async () => {
        const files = readdirSync(__dirname, {encoding: 'utf-8'})
        expect(Array.isArray(files)).toBe(true)
        console.log('end of readdirSync')
    })

})