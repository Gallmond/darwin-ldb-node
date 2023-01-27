/**
 * These types define what we WANT from our module.
 *
 * Not what the LDB service gives us
 */
/** "Computer Reservation System" The three character station codes */
export type CRS = string;
/** eg "10:30" "22:00" "On time" */
export type Time = string;
export interface OriginOrDestinationLocation {
    locationName: null | string;
    crs: null | CRS;
    via: null | string;
    unreachable: null | boolean;
}
/**
 * whe
 *
 * {
 *  NCL: [CallingPointLocation, CallingPointLocation, CallingPointLocation],
 *  EDN: [CallingPointLocation]
 * }
 */
export interface CallingPointsHolder {
    [key: CRS]: CallingPointLocation[];
}
export interface CallingPointLocation {
    locationName: null | string;
    crs: null | CRS;
    st: null | Time;
    et: null | Time;
    at: null | Time;
    isCancelled: null | boolean;
    length: null | number;
    detachFront: null | boolean;
    adhocAlerts: null | string[];
}
export interface TrainService {
    serviceID: null | string;
    sta: null | Time;
    eta: null | Time;
    std: null | Time;
    etd: null | Time;
    cancelled: null | boolean;
    platform: null | string;
    operator: null | string;
    operatorCode: null | string;
    from: {
        scheduled: {
            [key: string]: OriginOrDestinationLocation;
        };
        current: {
            [key: string]: OriginOrDestinationLocation;
        };
    };
    to: {
        scheduled: {
            [key: string]: OriginOrDestinationLocation;
        };
        current: {
            [key: string]: OriginOrDestinationLocation;
        };
    };
    callingPoints: {
        from: CallingPointsHolder;
        to: CallingPointsHolder;
    };
}
export interface DarwinOptions {
    debug?: boolean;
}
export interface ArrivalsAndDeparturesResponse {
    generatedAt: Date;
    locationName: string;
    crs: CRS;
    trainServices: TrainService[];
}
//# sourceMappingURL=darwin-types.d.ts.map