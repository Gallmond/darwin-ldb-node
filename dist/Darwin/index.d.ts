import type { Client } from "soap";
import type { StationBoardInput } from "./ldb-types.js";
import type { ArrivalsAndDeparturesResponse, ServiceDetailsResponse } from "./custom-types.js";
declare class Darwin {
    private soapClient;
    constructor(soapClient: Client);
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
    private callMethod;
    static make(wsdlUrl: string, accessToken: string): Promise<Darwin>;
    serviceDetails(serviceID: string): Promise<ServiceDetailsResponse>;
    arrivalsAndDepartures(options: StationBoardInput): Promise<ArrivalsAndDeparturesResponse>;
}
export { Darwin };
//# sourceMappingURL=index.d.ts.map