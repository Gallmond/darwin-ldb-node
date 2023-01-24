/**
 * These types should be used for typing the responses from the SOAP service
 */

type CRS = string
export type Time = string // like '13:45' or 'On time'
type PlainObj = Record<string, unknown>

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

export interface TrainServiceResult{
    serviceID: string,
    sta?: Time,
    eta?: Time,
    std?: Time,
    etd?: Time,
    platform?: string,
    operator?: string,
    operatorCode?: string,
    origin?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    destination?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    currentOrigins?: { location?: ServiceLocationResult | ServiceLocationResult[] }
    currentDestinations?: { location?: ServiceLocationResult | ServiceLocationResult[] }
}

interface StationBoardResult{
    generatedAt: Date
    locationName: string
    crs: CRS
    platformAvailable: string
    trainServices: { service: Array<unknown> | PlainObj }
}

interface StationBoardInput{
    // string, 3 characters, alphabetic
    // The CRS code (see above) of the location for which the request is being made.
    crs: string,
    // integer, between 0 and 10 exclusive
    // The number of services to return in the resulting station board.
    numRows?: number,
    // string, 3 characters, alphabetic
    // The CRS code of either an origin or destination location to filter in. Optional.
    filterCrs?: string,
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
