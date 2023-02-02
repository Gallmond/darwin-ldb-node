/**
 * These types define what we WANT from our module. 
 * 
 * Not what the LDB service gives us
 */

/** "Computer Reservation System" The three character station codes */
export type CRS = string

/** eg "10:30" "22:00" "On time" */
export type Time = string

export interface OriginOrDestinationLocation{
    locationName: null | string
    crs: null | CRS
    via: null | string
    unreachable: null | boolean
}

/**
 * whe
 * 
 * {
 *  NCL: [CallingPointLocation, CallingPointLocation, CallingPointLocation],
 *  EDN: [CallingPointLocation]
 * }
 */
export interface CallingPointsHolder{
    [key: CRS]: CallingPointLocation[]
}

export interface CallingPointLocation{
    // The display name of this location.
    locationName: null | string 
    // The CRS code of this location. A CRS code of ??? indicates an error situation where no crs code is known for this location.
    crs: null | CRS 
    // The scheduled time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list.
    st: null | Time 
    // The estimated time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an actual time (at) is not present.
    et: null | Time 
    // The actual time of the service at this location. The time will be either an arrival or departure time, depending on whether it is in the subsequent or previous calling point list. Will only be present if an estimated time (et) is not present.
    at: null | Time 
    // A flag to indicate that this service is cancelled at this location.
    isCancelled: null | boolean 
    // The train length (number of units) at this location. If not supplied, or zero, the length is unknown.
    length: null | number
    // True if the service detaches units from the front at this location.
    detachFront: null | boolean
    // A list of Adhoc Alerts (strings) for this CallingPoint.
    adhocAlerts: null | string[] 
}

export interface TrainService{
    serviceID: null | string
    // note that services without a departure don't depart, ie it terminates here
    // similarly services with no arrival originate here
    sta: null | Time // scheduled time of arrival
    eta: null | Time // expected time of arrival
    std: null | Time
    etd: null | Time
    cancelled: null | boolean
    platform: null | string
    operator: null | string
    operatorCode: null | string

    from: {
        scheduled: {[key: string]: OriginOrDestinationLocation},
        current: {[key: string]: OriginOrDestinationLocation},
    }
    to: {
        scheduled: {[key: string]: OriginOrDestinationLocation},
        current: {[key: string]: OriginOrDestinationLocation},
    }

    // origins: {scheduled: OriginOrDestinationLocation[], current: OriginOrDestinationLocation[]}
    // destinations: {scheduled: OriginOrDestinationLocation[], current: OriginOrDestinationLocation[]}
    callingPoints: {
        // the first entry is the 'through' train
        from: CallingPointsHolder,
        to: CallingPointsHolder,
    }
}

export interface DarwinOptions{
    debug?: boolean
} 

export interface ArrivalsAndDeparturesResponse{
    generatedAt: Date
    locationName: string
    crs: CRS,
    trainServices: TrainService[]
}

type CoachClass = 'First' | 'Mixed' | 'Standard' | string
interface CoachToilet{
    type: 'Unknown'|'None'|'Standard'|'Accessible'
    status: 'Unknown'|'InService'|'NotInService'
}

export interface CoachData{
    class: CoachClass
    loading: number
    loadingSpecified: boolean
    number: string
    toilet: CoachToilet
}

export interface ServiceDetailsResponse{
    generatedAt: Date
    locationName: string
    crs: CRS,
    operator: string
    operatorCode: string
    length: number | null
    platform: string | null
    
    sta: null | Time
    eta: null | Time
    ata: null | Time

    std: null | Time
    etd: null | Time
    atd: null | Time

    callingPoints: {
        // the first entry is the 'through' train
        from: CallingPointsHolder,
        to: CallingPointsHolder,
    }

    delayReason: null | string
    isCancelled: null | boolean
    cancelledReason: null | string
    isDiverted: null | boolean
    divertedVia: null | string
    diversionReason: null | string
    
    alerts: string[]

    splits: null | boolean

    formation: {
        isReverse: null | boolean,
        category: {
            loadingCode: string | null,
            colour: string | null,
            image: string | null,
        }
        coaches: CoachData[]
    }
}

