
import TestConnector from '../../src/darwin-ii/TestConnector'
import Darwin from '../../src/darwin-ii'
import { CallingPointLocation } from '../../src/darwin-ii/darwin-types'
import { Client } from 'soap'
import { readdirSync, writeFileSync } from 'fs'
import { hasUndefined } from '../../src/utils'

const clogTime = (start: Date, message: string) => {
    const now = new Date().valueOf()
    const diff = now - (start.valueOf())
    const seconds = diff / 1000

    console.log(`T ${seconds} - ${message}`)
}

describe('Darwin-II Implementation', () => {

    test.skip('Darwin describe', async () => {
        const realDarwin = await Darwin.make()
        await realDarwin.init()

        const inst = realDarwin.connector.getClient() as Client
        const service = inst.describe()

        const serviceJson = JSON.stringify(service, null, 2)
        const fileName = __dirname + '/describe.json'
        writeFileSync(fileName, serviceJson)

        console.log({service})
    })

    // 2 ms
    test('test debug one', async () => {
        expect(true).toBe(true)
    })

    // 
    test('test debug two', async () => {
        const files = readdirSync(__dirname, {encoding: 'utf-8'})
        console.log({files})
        expect(Array.isArray(files)).toBe(true)
        console.log('end of test!')
    })

    test('Darwin.arrivalsAndDepartures Service Calling Points', async () => {
        const start = new Date()

        const testConnector = new TestConnector()
        await testConnector.init()

        clogTime(start, 'test connector initialised')

        const darwin = new Darwin()
        darwin.connector = testConnector

        clogTime(start, 'darwin created')

        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        clogTime(start, 'got arrivals and departues result')

        const containsUndefined = hasUndefined(result)
        expect(containsUndefined).toBe(false)

        clogTime(start, 'asserted no undefined properties')

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

        clogTime(start, 'end of the test')
    })

    test('Darwin.arrivalsAndDepartures Service Origins and Destinations', async () => {
        const testConnector = new TestConnector()
        await testConnector.init()

        const darwin = new Darwin()
        darwin.connector = testConnector

        const result = await darwin.arrivalsAndDepartures({
            crs: 'NCL',
        })

        expect(hasUndefined(result)).toBe(false)

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

        expect(hasUndefined(result)).toBe(false)

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
        expect(hasUndefined(result)).toBe(false)

        // we got basic station data
        expect(new Date(result.generatedAt)).toBeInstanceOf(Date)
        expect(result.locationName).toBe('Newcastle')
        expect(result.crs).toBe('NCL')

        // we got services
        expect(Array.isArray(result.trainServices)).toBe(true)
        expect(result.trainServices.length > 0).toBe(true)

    })        

})
