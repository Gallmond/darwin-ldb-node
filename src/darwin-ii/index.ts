import { arrayWrap } from '../utils'
import SoapConnector from './SoapConnector'

import { CallingPointResult,
    CallingPointWrapperResult,
    ConnectorInterface,
    HasConnector,
    PlainObj,
    ServiceLocationResult,
    StationBoardInput,
    StationBoardResult,
    TrainServiceResult
} from './ldb-types'

import type {
    TrainService,
    OriginOrDestinationLocation,
    CallingPointLocation,
    ArrivalsAndDeparturesResponse,
    DarwinOptions
} from './darwin-types'

class Darwin implements HasConnector{
    initialised = false
    connectorInstance: ConnectorInterface | null = null
    
    options = {
        debug: false
    }

    constructor(options?: DarwinOptions){
        if(options){
            this.options = {
                ...this.options,
                ...options
            }
        }
    }
    
    get connector(): ConnectorInterface {
        if(this.connectorInstance === null){
            throw new Error('missing connector')
        }

        return this.connectorInstance
    }
    set connector(connector: ConnectorInterface) {
        this.connectorInstance = connector
    }

    static async make(wsdlUrl?: string, accessToken?: string){
        const _wsdlUrl = wsdlUrl ?? process.env.LDB_DARWIN_WSDL_URL
        const _accessToken = accessToken ?? process.env.LDB_DARWIN_ACCESS_TOKEN

        if(!_wsdlUrl || !_accessToken){
            throw new Error('Cannot instantiate SOAP Connector without WSDL and Access Token')
        }

        const connector = new SoapConnector(_wsdlUrl, _accessToken)

        const darwin = new Darwin()
        darwin.connector = connector
        await darwin.init()
        return darwin
    }

    async init(){
        if(!this.connector.initialised){
            await this.connector.init()
        }

        this.initialised = this.connector.initialised
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
        const changedOrigins = changedOriginArray.map( formatLocations )

        const scheduledDestinations = destinationArray.map( formatLocations )
        const changedDestinations = changedDestinationArray.map( formatLocations )

        const buildObject = (obj: Record<string, OriginOrDestinationLocation>, location: OriginOrDestinationLocation) => {
            const {crs} = location

            if(!crs){
                throw new Error('Location without CRS')
            }

            if(typeof obj[crs] !== 'undefined'){
                throw new Error('Duplicate origin or destination')
            }

            obj[crs] = location

            return obj
        }

        const fromScheduled = scheduledOrigins.reduce(buildObject, {}) 
        const fromCurrent = changedOrigins.reduce(buildObject, {}) 

        const toScheduled = scheduledDestinations.reduce(buildObject, {})
        const toCurrent = changedDestinations.reduce(buildObject, {})

        return {
            from: {
                scheduled: fromScheduled,
                current: fromCurrent
            },
            to: {
                scheduled: toScheduled,
                current: toCurrent,
            }
        }
    }

    private formatTrainServiceCallingPoints(service: TrainServiceResult){
        
        /**
         * these points all have annoying wrapping. Lets transform them to a 
         * simple array where each entry is an array of calling points.
         * 
         * Both origin and destination use the same format so we can use this
         * helper function 
         */
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
        
        const basicPreviousArray = formatPointsGeneric( prevPointsSet )
        const basicNextArray = formatPointsGeneric( subsequentPointsSet )

        /**
         * A note on the order of the calling points
         * - they are in chronological order in both arrays
         * - eg an Edinburgh -> London KGX services listed at newcastle will have
         * - Aberdeen as first and Bewrick as last elements of the previous array
         * - Darlington as first and KGX as last elements of the next array
         */

        const from: Record<string, CallingPointLocation[]> = basicPreviousArray.reduce((carry, set) => {
            // no entries in this set, do nothing
            if(set.length === 0) carry

            // get the first CRS as this is the 'from set
            const firstCrs = set[ 0 ].crs ?? '???'

            if(typeof carry[ firstCrs ] !== 'undefined'){
                const msg = 'Duplicate origin encountered'
                console.error(msg, service)
                throw new Error(msg)
            }

            carry[ firstCrs ] = set  

            return carry
        }, {} as Record<string, CallingPointLocation[]>)

        const to: Record<string, CallingPointLocation[]> = basicNextArray.reduce((carry, set) => {
            // no entries in this set, do nothing
            if(set.length === 0) carry

            // get the last crs, as this is the 'to' set
            const lastCrs = set[ set.length - 1 ].crs ?? '???'

            if(typeof carry[ lastCrs ] !== 'undefined'){
                const msg = 'Duplicate destination encountered'
                console.error(msg, service)
                throw new Error(msg)
            }

            carry[ lastCrs ] = set  

            return carry
        }, {} as Record<string, CallingPointLocation[]>)


        return {
            to, from
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
                isCancelled,
            } = service
            
            const endpoints = this.formatTrainServiceEndpoints(service)

            const { to, from } = this.formatTrainServiceCallingPoints(service)

            return{
                serviceID: serviceID ?? null,
                eta: eta ?? null,
                etd: etd ?? null,
                sta: sta ?? null,
                std: std ?? null,
                cancelled: isCancelled ?? null,
                platform: platform ?? null,
                operator: operator ?? null,
                operatorCode: operatorCode ?? null,
                to: endpoints.to,
                from: endpoints.from,
                callingPoints: {to, from},
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