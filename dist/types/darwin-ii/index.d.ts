import { ConnectorInterface, HasConnector, PlainObj, StationBoardInput } from './ldb-types';
import type { ArrivalsAndDeparturesResponse, DarwinOptions, ServiceDetailsResponse } from './darwin-types';
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
    /**
     * Transforms the SOAP-response calling point wrapping into something more
     * usable
     */
    private unWrapCallingPoints;
    /**
     * Takes an array of calling point location arrays and returns an object like:
     * {
     *   'KGX': [{}, {}, {}],
     *   'NCL': [{},{},{},{}]
     * }
     *
     * Note:
     * - Here {} represents a CallingPointLocation
     * - If type is 'to' the key will be the last element of the array
     * - It type is 'from' the key will be the first element of the array
     */
    private formatToCallingPoints;
    private formatTrainServiceCallingPoints;
    private formatTrainServices;
    serviceDetails(serviceID: string): Promise<ServiceDetailsResponse>;
    arrivalsAndDepartures(options: StationBoardInput): Promise<ArrivalsAndDeparturesResponse>;
}
export default Darwin;
//# sourceMappingURL=index.d.ts.map