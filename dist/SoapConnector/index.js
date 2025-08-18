import { createClientAsync } from 'soap';
import { MethodNotFoundError } from '../errors.js';
const getClient = async (wsdlUrl, accessToken) => {
    const client = await createClientAsync(wsdlUrl);
    client.addSoapHeader({ AccessToken: { TokenValue: accessToken } });
    return client;
};
const getServiceMethod = (client, path) => {
    const method = path.split(".").reduce((carry, part) => {
        if (carry[part]) {
            return carry[part];
        }
        throw new Error(`Couldn't find ${part}`);
    }, client);
    if (typeof method !== "function") {
        throw new MethodNotFoundError(path);
    }
    return method;
};
const callServiceMethod = (method, args) => {
    return new Promise((resolve, reject) => {
        method(args, (err, result) => {
            err
                ? reject(err)
                : resolve(result);
        });
    });
};
export { getClient, getServiceMethod, callServiceMethod };
//# sourceMappingURL=index.js.map