import { type Client } from 'soap';
type Plain = Record<string, unknown>;
type ServiceMethodCallback = (err: unknown, results: Plain) => void;
type ServiceMethod = (args: Plain, callback: ServiceMethodCallback) => unknown;
declare const getClient: (wsdlUrl: string, accessToken: string) => Promise<Client>;
declare const getServiceMethod: (client: Client, path: string) => ServiceMethod;
declare const callServiceMethod: <T = Plain>(method: ServiceMethod, args: Plain) => Promise<T>;
export { getClient, getServiceMethod, callServiceMethod };
//# sourceMappingURL=index.d.ts.map