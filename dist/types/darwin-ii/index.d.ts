import { ConnectorInterface, HasConnector, PlainObj, StationBoardInput } from './types';
/**
 * These types define what we WANT.
 * See ./types.ts for what we get from SOAP service
 */
interface OriginOrDestinationLocation {
    locationName: null | string;
    crs: null | string;
    via: null | string;
    unreachable: null | boolean;
}
/**
 * like {
 *  NCL: [CallingPointLocation, CallingPointLocation, CallingPointLocation],
 *  EDN: [CallingPointLocation]
 * }
 */
type CallingPointsHolder = {
    [key: string]: CallingPointLocation[];
};
export interface CallingPointLocation {
    locationName: null | string;
    crs: null | string;
    st: null | string;
    et: null | string;
    at: null | string;
    isCancelled: null | boolean;
    length: null | number;
    detachFront: null | boolean;
    adhocAlerts: null | string[];
}
interface TrainService {
    serviceID: null | string;
    sta: null | string;
    eta: null | string;
    std: null | string;
    etd: null | string;
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
interface ArrivalsAndDeparturesResponse {
    generatedAt: Date;
    locationName: string;
    crs: string;
    trainServices: TrainService[];
}
interface DarwinOptions {
    debug?: boolean;
}
declare class Darwin implements HasConnector {
    initialised: boolean;
    connectorInstance: ConnectorInterface | null;
    options: {
        debug: boolean;
    };
    constructor(options?: DarwinOptions);
    get connector(): ConnectorInterface;
    set connector(connector: ConnectorInterface);
    static make(wsdlUrl?: string, accessToken?: string): Promise<Darwin>;
    init(): Promise<void>;
    failedParse(callPath: string, results: PlainObj): void;
    private formatTrainServiceEndpoints;
    private formatTrainServiceCallingPoints;
    private formatTrainServices;
    arrivalsAndDepartures(options: StationBoardInput): Promise<ArrivalsAndDeparturesResponse>;
}
export default Darwin;
//# sourceMappingURL=index.d.ts.map