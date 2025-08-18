import { createClientAsync, type Client } from 'soap'
import { MethodNotFoundError } from '../errors.js'

type Plain = Record<string, unknown>

type ServiceMethodCallback = (err: unknown, results: Plain) => void
type ServiceMethod = (args: Plain, callback: ServiceMethodCallback) => unknown

const getClient = async (
  wsdlUrl: string,
  accessToken: string,
): Promise<Client> => {
  const client = await createClientAsync(wsdlUrl)
  client.addSoapHeader({AccessToken: {TokenValue: accessToken}})

  return client
}

const getServiceMethod = (client: Client, path: string) => {
  const method: unknown = path.split(".").reduce((carry, part) => {
    if (carry[part]) {
      return carry[part];
    }

    throw new Error(`Couldn't find ${part}`);
  }, client);

  if (typeof method !== "function") {
    throw new MethodNotFoundError(path);
  }

  return method as ServiceMethod;
};

const callServiceMethod = <T = Plain>(method: ServiceMethod, args: Plain): Promise<T> => {
  return new Promise((resolve,reject)=>{
    method(args, (err, result) => {
      err
        ? reject(err)
        : resolve(result as T)
    })   
  });
}

export {
  getClient, getServiceMethod, callServiceMethod
}