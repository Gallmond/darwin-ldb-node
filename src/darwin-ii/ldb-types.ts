/**
 * These types should be used for typing the responses from the SOAP service
 */

type CRS = string
export type Time = string // like '13:45' or 'On time'
type PlainObj = Record<string, unknown>

export type CallingPointResult = {
    // The display name of this location.
    locationName: string
    // The CRS code of this location. A CRS code of ??? indicates an error situation where no crs code is known for this location.
    crs: string
    // The scheduled time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list.
    st: Time
    // The estimated time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an actual time (at) is not present.
    et?: Time
    // The actual time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an estimated time (et) is not present.
    at?: Time
    // A flag to indicate that this service is cancelled at this location.
    isCancelled?: boolean
    // The train length (number of units) at this location. If not supplied, or zero, the length is unknown.
    length?: string
    // True if the service detaches units from the front at this location.
    detachFront?: boolean
    // A list of Adhoc Alerts (strings) for this CallingPoint.
    adhocAlerts?: string[]
}
export type CallingPointWrapperResult = {callingPoint: CallingPointResult | CallingPointResult[]}
export type CallingPointsListResult = CallingPointWrapperResult | CallingPointWrapperResult[]
    

export interface ServiceLocationResult{
    // The name of the location.
    locationName?: string  	
    // The CRS code of this location. A CRS code of ??? indicates an error situation where no crs code is known for this location.
    crs?: string  	
    // An optional via text that should be displayed after the location, to indicate further information about an ambiguous route. Note that vias are only present for ServiceLocation objects that appear in destination lists.
    via?: string  	
    // A text string contianing service type (Bus/Ferry/Train) to which will be changed in the future.
    futureChangeTo?: string  	
    // This origin or destination can no longer be reached because the association has been cancelled. 
    assocIsCancelled?: boolean  	
}

export interface CallingPointsContainerResult{
    callingPointList: CallingPointsListResult
}

export interface TrainServiceResult{
    serviceID: string,
    sta?: Time,
    eta?: Time,
    std?: Time,
    etd?: Time,
    platform?: string,
    operator?: string,
    operatorCode?: string,
    isCancelled?: boolean,
    origin?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    destination?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    currentOrigins?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    currentDestinations?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    previousCallingPoints?: CallingPointsContainerResult
    subsequentCallingPoints?: CallingPointsContainerResult
}

interface StationBoardResult{
    generatedAt: Date
    locationName: string
    crs: CRS
    platformAvailable: string
    trainServices: { service: Array<unknown> | PlainObj }
}

interface CoachDataResult{
    coachClass: string                                  // 	The class of coach, where known. First, Mixed or Standard. Other classes may be introduced in the future.
    loading: number                                     // 	The loading value (0-100) for the coach.
    loadingSpecified: string                            // 	Whether loading has been specified or not.
    number: string                                      // 	The number/identifier for this coach, e.g. "A" or "12". Maximum of two characters.
    toilet: {                                           // 	A ToiletAvailabilityType object representing toilet data. (2017-10-01 schema onwards)
        status: 'Unknown'|'InService'|'NotInService'    // 	ToiletStatus enumeration (Unknown, InService, NotInService), indicating service status
        value: 'Unknown'|'None'|'Standard'|'Accessible' // 	Type of toilet (Unknown, None, Standard, Accessible)
    }
}

export interface ServiceDetailsResult{
    diversionReason?: string // 	The reason for a diversion.
    divertedVia?: string // 	The location of the diversion.
    overdueMessage?: string // 	If an expected movement report has been missed, this will contain a message describing the missed movement.
    detachFront?: boolean // 	True if the service detaches units from the front at this location.
    isReverseFormation?: boolean// 	True if the service is operating in the reverse of its normal formation.
    adhocAlerts?: string[] // 	A list of Adhoc Alerts (strings) for this ServiceDetail.
    formation?: {
        loadingCategory: {
            code: string,   //The train loading category code.
            colour: string, //The colour to be used when displaying this category.
            image: string,  //Name of an image file to be used as an icon for this category
        }
        coaches: CoachDataResult[]        
    }
    generatedAt: Date
    serviceType: string
    locationName: string
    crs: CRS
    operator: string
    operatorCode: string
    length: string
    platform: string
    sta: Time
    eta?: Time
    ata?: Time
    std: Time
    etd?: Time
    atd?: Time
    isCancelled?: boolean
    cancelReason?: string
    delayReason?: string
    rsid?: string
    previousCallingPoints?: {
        callingPointList: CallingPointsListResult
    }
    subsequentCallingPoints?: {
        callingPointList: CallingPointsListResult
    }
}

export interface ServiceDetailsInput{
    serviceID: string
}

interface StationBoardInput{
    // string, 3 characters, alphabetic
    // The CRS code (see above) of the location for which the request is being made.
    crs: CRS,
    // integer, between 0 and 10 exclusive
    // The number of services to return in the resulting station board.
    numRows?: number,
    // string, 3 characters, alphabetic
    // The CRS code of either an origin or destination location to filter in. Optional.
    filterCrs?: CRS,
    // string, either "from" or "to"
    // The type of filter to apply. Filters services to include only those originating or terminating at the filterCrs location. Defaults to "to". Optional.
    filterType?: 'from' | 'to',
    // integer, between -120 and 120 exclusive
    // An offset in minutes against the current time to provide the station board for. Defaults to 0. Optional.
    timeOffset?: number,
    // integer, between -120 and 120 exclusive
    // How far into the future in minutes, relative to timeOffset, to return services for.
    timeWindow?: number,
}

interface HasConnector{
    connectorInstance: ConnectorInterface | null
    get connector(): ConnectorInterface
    set connector(connector: ConnectorInterface)
}

interface ConnectorInterface{
    getClient: () => unknown
    call: (callPath: string, args: PlainObj) => Promise<unknown>
    init: () => Promise<void>
    initialised: boolean
}

export{
    CRS,
    PlainObj,
    ConnectorInterface,
    HasConnector,
    StationBoardInput,
    StationBoardResult
}
