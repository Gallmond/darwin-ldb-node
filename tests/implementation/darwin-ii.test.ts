import SoapConnector from '../../src/darwin-ii/SoapConnector'
import dotenv from 'dotenv'
import TestConnector from '../../src/darwin-ii/TestConnector'
import Darwin from '../../src/darwin-ii'
import { CallingPointLocation } from '../../src/darwin-ii/darwin-types'
import { PlainObj } from '../../src/darwin-ii/ldb-types'

/**
 * fails if an object has a single undefined value
 */
const noUndefinedProperties = (object: object) => {
    Object.entries(object).forEach(keyVal => {
        const [, val] = keyVal

        // if this property is an object do the same
        if(val !== null && typeof val === 'object'){
            noUndefinedProperties(val)
        }

        // if this property is an array, do the same to each element
        if(Array.isArray(val)){
            val.forEach(element => {
                expect(typeof element).not.toBe('undefined')
            })
        }

        expect(typeof val).not.toBe('undefined')
    })
}

describe('Darwin-II Initialization', () => {

    test('Darwin can be statically instantiated', async () => {
        const d = await Darwin.make()
        expect(d).toBeInstanceOf(Darwin)
        expect(d.initialised).toBe(true)
    })

})

describe('Darwin-II Implementation', () => {

    test('Darwin.serviceDetails as expected', async () => {

        const existingStubs = [
            {serviceId: '374388GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.1de2118f911d4f90785fdccd64481f23.json'},
            {serviceId: '391386GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.e51778988e4e5a0ffe84bfeeed5ee725.json'},
            {serviceId: '388651GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.ba21466dbfb729b6576c0618eb2a86d9.json'},
            {serviceId: '391787GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.bac621c259a580ccd27ce8029b0de77f.json'},
            {serviceId: '387312GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.c0314d2b7603b3a57c4dfc63d8b83293.json'},
            {serviceId: '392513GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.9ec84ef750ab528950e46b2450765da7.json'},
            {serviceId: '374154GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.3d1dbbf773a2ed53ef2a1e706389c994.json'},
            {serviceId: '396884GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.de5d7c17153001014c8918770492b70e.json'},
            {serviceId: '392412GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.8f25283e16e8690dc2fcb7b11190d1b1.json'},
            {serviceId: '387320GTWK____', file: 'ldb.LDBServiceSoap12.GetServiceDetails.da22bbc7b6afc1ad84fd21e99b86a2a6.json'},
        ]

        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        const stubbedResponse = await darwin.serviceDetails( '374388GTWK____' )
        console.log(stubbedResponse)

    })

    test('Darwin.arrivalsAndDepartures Service Calling Points', async () => {
        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        noUndefinedProperties(result)

        // those services have basic service data
        result.trainServices.forEach(trainService => {

            // skip if this service is cancelled
            if(trainService.cancelled === true){
                return
            }

            // check that we got calling points for this service
            expect(trainService).toHaveProperty('callingPoints')

            

            const destCsr = Object.keys(trainService.to.scheduled)[0] ?? 'FOOBAR'
            const originCsr = Object.keys(trainService.from.scheduled)[0] ?? 'FOOBAR'

            // every service should have a 'to' and 'from' array
            const {to, from} = trainService.callingPoints
            
            // if we're already at our destination, the callingPoints.to object will be empty
            if(destCsr === result.crs){
                expect(to).toEqual({})
            }
            
            if(destCsr !== result.crs){
                // 'to' should have a key that matches the CSR of this service destination
                expect(to).toHaveProperty(destCsr)
                // its value should be an array
                expect(Array.isArray(to[destCsr])).toBe(true)
                // the last element of that array should be the CSR of this service destination
                expect(to[destCsr][ to[destCsr].length - 1 ].crs).toBe(destCsr)
            }
            
            // if we're currently at our origin callingPoints.from will be empty
            if(originCsr === result.crs){
                expect(from).toEqual({})
            }            

            if(originCsr !== result.crs){
                // 'from' should have a key that matches the CSR of this service origin
                expect(from).toHaveProperty(originCsr)
                // its value should be an array
                expect(Array.isArray(from[originCsr])).toBe(true)
                // the first element of that array should be the CSR of this service origin
                expect(from[originCsr][ 0 ].crs).toBe(originCsr)
            }

            // they should all have the same format, so lets squash them together
            const allPoints: CallingPointLocation[] = []
            Object.entries(to).forEach(keyVal => {
                const [, pointsArr] = keyVal
                allPoints.push( ...pointsArr )
            })
            Object.entries(from).forEach(keyVal => {
                const [, pointsArr] = keyVal
                allPoints.push( ...pointsArr )
            })

            expect(allPoints.length > 0).toBe(true)

            /**
             * each of these elements is also an array as a service can have
             * multiple origins or destinations due to train joins and splits
             * each element is itself an array of points to/from that origin/destination
             */
            allPoints.forEach(point => {
                expect(point).toHaveProperty('locationName')
                expect(point).toHaveProperty('crs')
                expect(point).toHaveProperty('st')
                expect(point).toHaveProperty('et')
                expect(point).toHaveProperty('at')
                expect(point).toHaveProperty('isCancelled')
                expect(point).toHaveProperty('length')
                expect(point).toHaveProperty('detachFront')
                expect(point).toHaveProperty('adhocAlerts')
            })
        })
    })

    test('Darwin.arrivalsAndDepartures Service Origins and Destinations', async () => {
        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        noUndefinedProperties(result)

        // those services have basic service data
        result.trainServices.forEach(trainService => {
            //check origin and destinations
            expect(trainService).toHaveProperty('from')
            expect(trainService).toHaveProperty('to')

            // origins format
            expect(trainService.from).toHaveProperty('scheduled')
            expect(trainService.to).toHaveProperty('current')
            expect(typeof trainService.from.scheduled).toBe('object')
            expect(typeof trainService.from.current).toBe('object')

            Object.entries(trainService.from.scheduled).forEach(keyVal => {
                const [, location] = keyVal
                expect(location).toHaveProperty('locationName')
                expect(location).toHaveProperty('crs')
                expect(location).toHaveProperty('via')
                expect(location).toHaveProperty('unreachable')
            })
            Object.entries(trainService.from.current).forEach(keyVal => {
                const [, location] = keyVal
                expect(location).toHaveProperty('locationName')
                expect(location).toHaveProperty('crs')
                expect(location).toHaveProperty('via')
                expect(location).toHaveProperty('unreachable')
            })

            Object.entries(trainService.to.scheduled).forEach(keyVal => {
                const [, location] = keyVal
                expect(location).toHaveProperty('locationName')
                expect(location).toHaveProperty('crs')
                expect(location).toHaveProperty('via')
                expect(location).toHaveProperty('unreachable')
            })
            Object.entries(trainService.to.current).forEach(keyVal => {
                const [, location] = keyVal
                expect(location).toHaveProperty('locationName')
                expect(location).toHaveProperty('crs')
                expect(location).toHaveProperty('via')
                expect(location).toHaveProperty('unreachable')
            })

        })
    })

    test('Darwin.arrivalsAndDepartures Service Details', async () => {
        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        noUndefinedProperties(result)

        // those services have basic service data
        result.trainServices.forEach(trainService => {
            expect(trainService).toHaveProperty('sta')
            expect(trainService).toHaveProperty('eta')
            expect(trainService).toHaveProperty('std')
            expect(trainService).toHaveProperty('etd')
            expect(trainService).toHaveProperty('platform')
            expect(trainService).toHaveProperty('operator')
            expect(trainService).toHaveProperty('operatorCode')
            expect(trainService).toHaveProperty('serviceID')
        })

    })

    test('Darwin.arrivalsAndDepartures Station Details', async () => {

        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        // we can get basic station data
        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        // check there are no undefined properties, only allow null
        noUndefinedProperties(result)

        // we got basic station data
        expect(new Date(result.generatedAt)).toBeInstanceOf(Date)
        expect(result.locationName).toBe('Newcastle')
        expect(result.crs).toBe('NCL')

        // we got services
        expect(Array.isArray(result.trainServices)).toBe(true)
        expect(result.trainServices.length > 0).toBe(true)

    })        

})

describe('Darwin-II Connectors', () => {

    dotenv.config({path: __dirname + '/../.env.test'})

    const {
        LDB_DARWIN_ACCESS_TOKEN, LDB_DARWIN_WSDL_URL
    } = process.env

    const getSoapConnector = async (): Promise<SoapConnector> => {
        const wsdlUrl = LDB_DARWIN_WSDL_URL as string
        const accessToken = LDB_DARWIN_ACCESS_TOKEN as string
    
        // able to connect and describe
        const soapConnector = new SoapConnector(wsdlUrl, accessToken)
        await soapConnector.init()
    
        return soapConnector
    }

    /**
     * some specific services to test for
     */
    const expectedLDB12Services = [
        'GetArrDepBoardWithDetails',
        'GetDepBoardWithDetails',
        'GetDepartureBoard',
    ]

    test('Env variables', () => {
        expect(LDB_DARWIN_ACCESS_TOKEN).not.toBeUndefined()
        expect(LDB_DARWIN_WSDL_URL).not.toBeUndefined()
    })

    test('SOAP Connector', async () => {
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
    test('BUILD STUBS', async () => {
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