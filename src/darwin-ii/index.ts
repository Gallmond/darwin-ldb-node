import { arrayWrap } from '../utils'
import { ConnectorInterface, HasConnector, PlainObj, ServiceLocationResult, StationBoardInput, StationBoardResult, TrainServiceResult } from './types'

/**
 * These types define what we WANT.
 * See ./types.ts for what we get from SOAP service
 */

interface OriginOrDestinationLocation{
    locationName: null | string
    crs: null | string
    via: null | string
    unreachable: null | boolean
}

interface TrainService{
    serviceID: null | string
    eta: null | string
    etd: null | string
    sta: null | string
    std: null | string
    platform: null | string
    operator: null | string
    operatorCode: null | string
    origins: {scheduled: OriginOrDestinationLocation[], current: OriginOrDestinationLocation[]}
    destinations: {scheduled: OriginOrDestinationLocation[], current: OriginOrDestinationLocation[]}

    //TODO diagram for this
    callingPoints: {
        main: {
            next: [],
            prior: []
        },
        //TODO how to suss this out?
        other: {}
    }
}

interface ArrivalsAndDeparturesResponse{
    generatedAt: Date
    locationName: string
    crs: string,
    trainServices: TrainService[]
}
 
class Darwin implements HasConnector{
    
    connectorInstance: ConnectorInterface | null = null
    get connector(): ConnectorInterface {
        if(this.connectorInstance === null){
            throw new Error('missing connector')
        }

        return this.connectorInstance
    }
    set connector(connector: ConnectorInterface) {
        this.connectorInstance = connector
    }

    async init(){
        if(!this.connector.initialised){
            await this.connector.init()
        }
    }

    failedParse(callPath: string, results: PlainObj){
        console.error('failed to parse response', {
            callPath, results
        })
        throw new Error('Failed to parse response')
    }

    private formatTrainServiceOriginAndDestination(service: TrainServiceResult){

        const originArray = arrayWrap<ServiceLocationResult>( service.origin?.location )
        const destinationArray = arrayWrap<ServiceLocationResult>( service.destination?.location )
        const changedOriginArray = arrayWrap<ServiceLocationResult>( service.currentOrigins?.location )
        const changedDestinationArray = arrayWrap<ServiceLocationResult>( service.currentDestinations?.location )

        const formatLocations = (location: ServiceLocationResult): OriginOrDestinationLocation => {
            return {
                locationName: location.locationName ?? null,
                crs: location.crs ?? null,
                via: location.via ?? null,
                unreachable: location.assocIsCancelled ?? null,
            }
        }

        const scheduledOrigins = originArray.map( formatLocations )
        const scheduledDestinations = destinationArray.map( formatLocations )

        const changedOrigins = changedOriginArray.map( formatLocations )
        const changedDestinations = changedDestinationArray.map( formatLocations )
        
        return {
            origins: {
                scheduled: scheduledOrigins, current: changedOrigins
            },
            destinations: {
                scheduled: scheduledDestinations, current: changedDestinations
            },
        }
    }

    private formatTrainServices(trainServices: TrainServiceResult[]): TrainService[]
    {
        return trainServices.map((service): TrainService => {
            const {
                sta,
                eta,
                std,
                etd,
                platform,
                operator,
                operatorCode,
                serviceID,
            } = service
            
            const {
                origins, destinations 
            } = this.formatTrainServiceOriginAndDestination(service)

            return{
                serviceID: serviceID ?? null,
                eta: eta ?? null,
                etd: etd ?? null,
                sta: sta ?? null,
                std: std ?? null,
                platform: platform ?? null,
                operator: operator ?? null,
                operatorCode: operatorCode ?? null,
                origins, destinations
            }
        })
    }

    async arrivalsAndDepartures(options: StationBoardInput): Promise<ArrivalsAndDeparturesResponse>{
        const callPath = 'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails'
        const args = {
            ...options
        }

        const results = await this.connector.call(callPath, args) as PlainObj

        const result = (results.GetStationBoardResult
            ? results.GetStationBoardResult
            : this.failedParse(callPath, results)) as StationBoardResult

        // basic station data
        const {
            generatedAt,
            locationName,
            crs
        } = result

        // train services array
        const resultTrainServices = (Array.isArray(result.trainServices.service)
            ? result.trainServices.service
            : [result.trainServices.service]) as TrainServiceResult[]

        const trainServices = this.formatTrainServices(resultTrainServices)

        return {
            // basic station data
            generatedAt,
            locationName,
            crs,
            // train services
            trainServices,
        }

    }


}

export default Darwin