/**
 * These types should be used for typing the responses from the SOAP service
 */
type CRS = string;
export type Time = string;
type PlainObj = Record<string, unknown>;
export type CallingPointResult = {
    locationName: string;
    crs: string;
    st: Time;
    et?: Time;
    at?: Time;
    isCancelled?: boolean;
    length?: string;
    detachFront?: boolean;
    adhocAlerts?: string[];
};
export type CallingPointWrapperResult = {
    callingPoint: CallingPointResult | CallingPointResult[];
};
export type CallingPointsListResult = CallingPointWrapperResult | CallingPointWrapperResult[];
export interface ServiceLocationResult {
    locationName?: string;
    crs?: string;
    via?: string;
    futureChangeTo?: string;
    assocIsCancelled?: boolean;
}
export interface CallingPointsContainerResult {
    callingPointList: CallingPointsListResult;
}
export interface TrainServiceResult {
    serviceID: string;
    sta?: Time;
    eta?: Time;
    std?: Time;
    etd?: Time;
    platform?: string;
    operator?: string;
    operatorCode?: string;
    isCancelled?: boolean;
    origin?: {
        location?: ServiceLocationResult | ServiceLocationResult[];
    };
    destination?: {
        location?: ServiceLocationResult | ServiceLocationResult[];
    };
    currentOrigins?: {
        location?: ServiceLocationResult | ServiceLocationResult[];
    };
    currentDestinations?: {
        location?: ServiceLocationResult | ServiceLocationResult[];
    };
    previousCallingPoints?: CallingPointsContainerResult;
    subsequentCallingPoints?: CallingPointsContainerResult;
}
interface StationBoardResult {
    generatedAt: Date;
    locationName: string;
    crs: CRS;
    platformAvailable: string;
    trainServices: {
        service: Array<unknown> | PlainObj;
    };
}
interface CoachDataResult {
    coachClass: string;
    loading: number;
    loadingSpecified: string;
    number: string;
    toilet: {
        status: 'Unknown' | 'InService' | 'NotInService';
        value: 'Unknown' | 'None' | 'Standard' | 'Accessible';
    };
}
export interface ServiceDetailsResult {
    diversionReason?: string;
    divertedVia?: string;
    overdueMessage?: string;
    detachFront?: boolean;
    isReverseFormation?: boolean;
    adhocAlerts?: string[];
    formation?: {
        loadingCategory: {
            code: string;
            colour: string;
            image: string;
        };
        coaches: CoachDataResult[];
    };
    generatedAt: Date;
    serviceType: string;
    locationName: string;
    crs: CRS;
    operator: string;
    operatorCode: string;
    length: string;
    platform: string;
    sta: Time;
    eta?: Time;
    ata?: Time;
    std: Time;
    etd?: Time;
    atd?: Time;
    isCancelled?: boolean;
    cancelReason?: string;
    delayReason?: string;
    rsid?: string;
    previousCallingPoints?: {
        callingPointList: CallingPointsListResult;
    };
    subsequentCallingPoints?: {
        callingPointList: CallingPointsListResult;
    };
}
export interface ServiceDetailsInput {
    serviceID: string;
}
interface StationBoardInput {
    crs: CRS;
    numRows?: number;
    filterCrs?: CRS;
    filterType?: 'from' | 'to';
    timeOffset?: number;
    timeWindow?: number;
}
interface HasConnector {
    connectorInstance: ConnectorInterface | null;
    get connector(): ConnectorInterface;
    set connector(connector: ConnectorInterface);
}
interface ConnectorInterface {
    getClient: () => unknown;
    call: (callPath: string, args: PlainObj) => Promise<unknown>;
    init: () => Promise<void>;
    initialised: boolean;
}
export { CRS, PlainObj, ConnectorInterface, HasConnector, StationBoardInput, StationBoardResult };
//# sourceMappingURL=ldb-types.d.ts.map