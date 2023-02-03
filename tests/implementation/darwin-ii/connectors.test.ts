import dotenv from 'dotenv'
import SoapConnector from '../../../src/darwin-ii/SoapConnector'
import TestConnector from '../../../src/darwin-ii/TestConnector'
import type { PlainObj } from '../../../src/darwin-ii/ldb-types'
dotenv.config({path: __dirname + '/../../.env.test'})

const {
    LDB_DARWIN_ACCESS_TOKEN, LDB_DARWIN_WSDL_URL
} = process.env

/**
 * some specific services to test for
 */
const expectedLDB12Services = [
    'GetArrDepBoardWithDetails',
    'GetDepBoardWithDetails',
    'GetDepartureBoard',
]

const getSoapConnector = async (): Promise<SoapConnector> => {
    const wsdlUrl = LDB_DARWIN_WSDL_URL as string
    const accessToken = LDB_DARWIN_ACCESS_TOKEN as string

    // able to connect and describe
    const soapConnector = new SoapConnector(wsdlUrl, accessToken)
    await soapConnector.init()

    return soapConnector
}

describe('Darwin-II Connectors', () => {

    let consoleSpy: jest.SpyInstance | undefined

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(()=>{
            // do nothing
        })
    })

    afterAll(() => {
        // re-enable console.error
        if(consoleSpy) consoleSpy.mockRestore()
    })


    test('Env variables', () => {
        expect(LDB_DARWIN_ACCESS_TOKEN).not.toBeUndefined()
        expect(LDB_DARWIN_WSDL_URL).not.toBeUndefined()
    })

    test('SOAP Connector can describe', async () => {
        const soapConnector = await getSoapConnector()

        // check we got an object and some services
        const result = soapConnector.client.describe()
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('ldb')
        const { LDBServiceSoap, LDBServiceSoap12 } = result.ldb
        expect(typeof LDBServiceSoap).toBe('object')
        expect(typeof LDBServiceSoap12).toBe('object')
        expectedLDB12Services.forEach(methodName => {
            expect(LDBServiceSoap12).toHaveProperty( methodName )
        })
    })

    /**
     * Run this test if you need to build some stubs for paths / args
     * 
     * This makes a real request
     */
    test.skip('BUILD STUBS', async () => {
        const callPaths = {
            'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails': {crs: 'NCL'},
            'ldb.LDBServiceSoap12.GetDepBoardWithDetails': {crs: 'KGX'},
            'ldb.LDBServiceSoap12.GetDepartureBoard': {crs: 'GTW'},
        }
        const testConnector = new TestConnector()
        await testConnector.init()
        const soapConnector = await getSoapConnector()
        Object.entries(callPaths).forEach(async (keyVal: [string, PlainObj]) => {
            const [callPath, args] = keyVal
            const result = await soapConnector.call(callPath, args)
            TestConnector.createStub(callPath, args, result)
        })

    })

    test('Test Connector no stub', async () => {
        const testConnector = new TestConnector()
        await testConnector.init()

        // we have a stub for this path but not the args, this should fail
        const callPath = 'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails'
        const args = {crs: 'FOO'}

        expect(async () => {
            await testConnector.call(callPath, args)
            expect(consoleSpy).toHaveBeenCalledTimes(1)
        }).rejects.toThrow()

    })

    test('Test Connector existing stub', async () => {

        const testConnector = new TestConnector()
        await testConnector.init()

        // these should be stubbed out
        const resultOne = await (testConnector.call(
            'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails', {crs: 'NCL'},
        )) as PlainObj
        
        // should have a station board result
        expect(resultOne).toHaveProperty('GetStationBoardResult')
        const stationBoardResultOne = resultOne.GetStationBoardResult as PlainObj

        // should have some details of the station
        expect(stationBoardResultOne).toHaveProperty('generatedAt')
        expect(stationBoardResultOne).toHaveProperty('locationName')
        expect(stationBoardResultOne).toHaveProperty('crs')
        expect(stationBoardResultOne).toHaveProperty('platformAvailable')
        expect(stationBoardResultOne).toHaveProperty('trainServices')

        // should have some train services
        const trainServicesOne = stationBoardResultOne.trainServices as PlainObj 
        expect(Array.isArray(trainServicesOne.service))
            .toBe(true)

        // those services should have the basic info
        const serviceArrayOne = trainServicesOne.service as Array<PlainObj>
        expect(serviceArrayOne.length > 0).toBe(true)
        serviceArrayOne.forEach(service => {
            // we can't check for eta and so on as not all services have them 
            // for like destinations etc
            expect(service).toHaveProperty('origin')
            expect(service).toHaveProperty('destination')
            expect(service).toHaveProperty('serviceID')

            expect(typeof service.origin).toBe('object')
            expect(typeof service.destination).toBe('object')
            expect(typeof service.serviceID).toBe('string')
        })

    })

})