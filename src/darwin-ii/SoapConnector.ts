import * as soap from 'soap'
import { PlainObj, ConnectorInterface } from './types'

type ServiceMethodCallback = (err: unknown, results: PlainObj) => void
type ServiceMethod = (args: PlainObj, callback: ServiceMethodCallback) => unknown

class SoapConnector implements ConnectorInterface{

    wsdlUrl: string
    accessToken: string
    soapClient: soap.Client | null = null
    initialised = false

    constructor(wsdlUrl: string, accessToken: string){
        this.wsdlUrl = wsdlUrl
        this.accessToken = accessToken
    }

    get client(): soap.Client
    {
        if(this.soapClient === null) throw new Error('Client not initialised')

        return this.soapClient
    }

    async init(){
        this.soapClient = await soap.createClientAsync(this.wsdlUrl)
        this.initialised = true
    }

    private getServiceMethod(callPath: string): ServiceMethod
    {
        const parts = callPath.split('.')
    
        const method: unknown = parts.reduce((carry, part) => {
            if(carry[part]){
                return carry[part]
            }

            throw new Error(`Couldn't find ${part}`)
        }, this.client)

        if(typeof method !== 'function'){
            throw new Error(`${callPath} did not resolve to a function`)
        }

        return method as ServiceMethod
    }

    private callServiceMethod = (method: ServiceMethod, args: PlainObj): Promise<PlainObj> => 
    {
        return new Promise((resolve,reject)=>{
            try {
                this.client.addSoapHeader({AccessToken: {TokenValue: this.accessToken}})
                method(args, (err, result) => {
                    if(err) reject(err)
                    
                    resolve(result)
                })    
            } catch (e) {
                reject(e)
            }
        })
    }

    // this should take
    async call(callPath: string, args: PlainObj): Promise<PlainObj>
    {
        const method = this.getServiceMethod(callPath)
        const result = await this.callServiceMethod(method, args)

        return result
    }

}

export default SoapConnector

