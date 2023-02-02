import Darwin from '../../src/darwin-ii'
import TestConnector from '../../src/darwin-ii/TestConnector'

type JSTypes = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | null
const assertTypeOrNull = (variable: unknown, type: JSTypes) => {
    if(variable === null){
        expect(variable).toBeNull()
        return
    }

    expect(typeof variable).toBe(type)
}

const assertStringOrNull = (variable: unknown) => {
    assertTypeOrNull(variable, 'string')
}

test('Darwin.serviceDetails use case', async () => {

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

    const testForServiceId = async (serviceId: string) => {
        // given an existing service
        const serviceDetails = await darwin.serviceDetails(serviceId)

        // ===== I should be able to get service details relative to 'this' station
        // location, platform length
        const { locationName, platform, length } = serviceDetails
        expect(typeof locationName).toBe('string')
        assertTypeOrNull(platform, 'string')
        assertTypeOrNull(length, 'number')

        // arrival times
        const { eta, ata, sta } = serviceDetails
        assertStringOrNull(eta)
        assertStringOrNull(ata)
        assertStringOrNull(sta)

        // departure times
        const { etd, atd, std } = serviceDetails
        assertStringOrNull(etd)
        assertStringOrNull(atd)
        assertStringOrNull(std)

        // ===== and the previous and next calling points 
        const next = serviceDetails.callingPoints.to
        expect(typeof next).toBe('object')

        Object.keys(next).forEach(crs => {
            const points = next[crs]
            points.forEach(point => {
                expect(typeof point.locationName).toBe('string')
                expect(typeof point.crs).toBe('string')
                expect(typeof point.st).toBe('string')
                assertStringOrNull(point.et)
                assertStringOrNull(point.at)
                assertTypeOrNull(point.isCancelled, 'boolean')
                assertTypeOrNull(point.detachFront, 'boolean')
                assertTypeOrNull(point.length, 'number')
                expect(Array.isArray(point.adhocAlerts) || point.adhocAlerts === null).toBe(true)
            })
        })

        return true
    }

    const serviceIds = existingStubs.reduce((carry, current) => {
        carry.push(current.serviceId)
        return carry
    }, [] as string[])

    serviceIds.forEach(async serviceId => {
        const success = await testForServiceId(serviceId)
        expect(success).toBe(true)
    })
    
})