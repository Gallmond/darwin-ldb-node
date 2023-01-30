import { ConnectorInterface, HasConnector, PlainObj, StationBoardInput } from './ldb-types';
import type { ArrivalsAndDeparturesResponse, DarwinOptions } from './darwin-types';
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
    private unWrapCallingPoints;
    private formatTrainServiceCallingPoints;
    private formatTrainServices;
    serviceDetails(serviceID: string): Promise<PlainObj>;
    arrivalsAndDepartures(options: StationBoardInput): Promise<ArrivalsAndDeparturesResponse>;
}
export default Darwin;
//# sourceMappingURL=index.d.ts.map