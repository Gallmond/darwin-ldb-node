import * as soap from 'soap';
import { PlainObj, ConnectorInterface } from './ldb-types';
declare class SoapConnector implements ConnectorInterface {
    wsdlUrl: string;
    accessToken: string;
    soapClient: soap.Client | null;
    initialised: boolean;
    constructor(wsdlUrl: string, accessToken: string);
    getClient: () => soap.Client;
    get client(): soap.Client;
    init(): Promise<void>;
    private getServiceMethod;
    private callServiceMethod;
    call(callPath: string, args: PlainObj): Promise<PlainObj>;
}
export default SoapConnector;
//# sourceMappingURL=SoapConnector.d.ts.map