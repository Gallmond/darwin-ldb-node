import dotenv from 'dotenv'
dotenv.config({path: __dirname + '/.env.test'})

describe('Test that jest is working', () => {
    test('jest has loaded', () => {
        expect(true).toBe(true)
    })

    test('test env was loaded', () => {
        const {
            LDB_DARWIN_ACCESS_TOKEN,
            LDB_DARWIN_WSDL_URL,
        } = process.env

        expect(LDB_DARWIN_ACCESS_TOKEN).not.toBeUndefined()
        expect(LDB_DARWIN_WSDL_URL).not.toBeUndefined()
    })
})