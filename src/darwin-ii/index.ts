import { arrayWrap } from '../utils'
import { CallingPointResult, CallingPointWrapperResult, ConnectorInterface, HasConnector, PlainObj, ServiceLocationResult, StationBoardInput, StationBoardResult, TrainServiceResult } from './types'

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

interface CallingPointLocation{
    // The display name of this location.
    locationName: null | string 
    // The CRS code of this location. A CRS code of ??? indicates an error situation where no crs code is known for this location.
    crs: null | string 
    // The scheduled time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list.
    st: null | string 
    // The estimated time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an actual time (at) is not present.
    et?: null | string 
    // The actual time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an estimated time (et) is not present.
    at?: null | string 
    // A flag to indicate that this service is cancelled at this location.
    isCancelled?: null | boolean 
    // The train length (number of units) at this location. If not supplied, or zero, the length is unknown.
    length?: null | number
    // True if the service detaches units from the front at this location.
    detachFront?: null | boolean
    // A list of Adhoc Alerts (strings) for this CallingPoint.
    adhocAlerts?: null | string[] 
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
    callingPoints: {
        next: CallingPointLocation[][],
        prior: CallingPointLocation[][],
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

    private formatTrainServiceEndpoints(service: TrainServiceResult){

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

    private formatTrainServiceCallingPoints(service: TrainServiceResult){
        
        const formatPointsGeneric = (dataArray: CallingPointWrapperResult[]) => {
            return dataArray.map(element =>{
                const data = arrayWrap<CallingPointResult>( element.callingPoint )
                return data.map(datum => {
                    return {
                        locationName: datum.locationName ?? null,
                        crs: datum.crs ?? null,
                        st: datum.st ?? null,
                        et: datum.et ?? null,
                        at: datum.at ?? null,
                        isCancelled: datum.isCancelled ?? null,
                        length: datum.length ?? null,
                        detachFront: datum.detachFront ?? null,
                        adhocAlerts: datum.adhocAlerts ?? null,
                    } as CallingPointLocation
                })
            })
        }


        const prevPointsSet = arrayWrap<CallingPointWrapperResult>( service.previousCallingPoints?.callingPointList ) 
        const subsequentPointsSet = arrayWrap<CallingPointWrapperResult>( service.subsequentCallingPoints?.callingPointList ) 
        
        return {
            next: formatPointsGeneric( subsequentPointsSet ),
            prior: formatPointsGeneric( prevPointsSet )
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
            } = this.formatTrainServiceEndpoints(service)

            const { next, prior } = this.formatTrainServiceCallingPoints(service)

            return{
                serviceID: serviceID ?? null,
                eta: eta ?? null,
                etd: etd ?? null,
                sta: sta ?? null,
                std: std ?? null,
                platform: platform ?? null,
                operator: operator ?? null,
                operatorCode: operatorCode ?? null,
                origins, destinations,
                callingPoints: {next, prior}
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