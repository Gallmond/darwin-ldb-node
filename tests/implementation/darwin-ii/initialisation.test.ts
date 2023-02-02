import Darwin from '../../../src/darwin-ii'
import * as dotenv from 'dotenv'
dotenv.config({path: __dirname + '/../../.env.test'}) // load env file

describe('Darwin-II Initialization', () => {

    test('broken tests?', async () => {
        expect(true).toBe(true)
    })

    test('can reach config', () => {
        expect(process.env.LDB_DARWIN_WSDL_URL).not.toBeUndefined()
        expect(process.env.LDB_DARWIN_ACCESS_TOKEN).not.toBeUndefined()
    })

    test('Darwin can be statically instantiated', async () => {
        const d = await Darwin.make()
        expect(d).toBeInstanceOf(Darwin)
        expect(d.initialised).toBe(true)
    })

})