"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const soap = __importStar(require("soap"));
class SoapConnector {
    wsdlUrl;
    accessToken;
    soapClient = null;
    initialised = false;
    constructor(wsdlUrl, accessToken) {
        this.wsdlUrl = wsdlUrl;
        this.accessToken = accessToken;
    }
    getClient = () => this.client;
    get client() {
        if (this.soapClient === null)
            throw new Error('Client not initialised');
        return this.soapClient;
    }
    async init() {
        this.soapClient = await soap.createClientAsync(this.wsdlUrl);
        this.initialised = true;
    }
    getServiceMethod(callPath) {
        const parts = callPath.split('.');
        const method = parts.reduce((carry, part) => {
            if (carry[part]) {
                return carry[part];
            }
            throw new Error(`Couldn't find ${part}`);
        }, this.client);
        if (typeof method !== 'function') {
            throw new Error(`${callPath} did not resolve to a function`);
        }
        return method;
    }
    callServiceMethod = (method, args) => {
        return new Promise((resolve, reject) => {
            try {
                this.client.addSoapHeader({ AccessToken: { TokenValue: this.accessToken } });
                method(args, (err, result) => {
                    if (err)
                        reject(err);
                    resolve(result);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    };
    // this should take
    async call(callPath, args) {
        const method = this.getServiceMethod(callPath);
        const result = await this.callServiceMethod(method, args);
        return result;
    }
}
exports.default = SoapConnector;
