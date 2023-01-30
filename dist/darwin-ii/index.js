"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const SoapConnector_1 = __importDefault(require("./SoapConnector"));
const TestConnector_1 = __importDefault(require("./TestConnector"));
class Darwin {
    initialised = false;
    connectorInstance = null;
    options = {
        debug: false
    };
    constructor(options) {
        if (options) {
            this.options = {
                ...this.options,
                ...options
            };
        }
    }
    get connector() {
        if (this.connectorInstance === null) {
            throw new Error('missing connector');
        }
        return this.connectorInstance;
    }
    set connector(connector) {
        this.connectorInstance = connector;
    }
    static async make(wsdlUrl, accessToken) {
        const _wsdlUrl = wsdlUrl ?? process.env.LDB_DARWIN_WSDL_URL;
        const _accessToken = accessToken ?? process.env.LDB_DARWIN_ACCESS_TOKEN;
        if (!_wsdlUrl || !_accessToken) {
            throw new Error('Cannot instantiate SOAP Connector without WSDL and Access Token');
        }
        const connector = new SoapConnector_1.default(_wsdlUrl, _accessToken);
        const darwin = new Darwin();
        darwin.connector = connector;
        await darwin.init();
        return darwin;
    }
    async init() {
        if (!this.connector.initialised) {
            await this.connector.init();
        }
        this.initialised = this.connector.initialised;
    }
    failedParse(callPath, results) {
        console.error('failed to parse response', {
            callPath, results
        });
        throw new Error('Failed to parse response');
    }
    formatTrainServiceEndpoints(service) {
        const originArray = (0, utils_1.arrayWrap)(service.origin?.location);
        const destinationArray = (0, utils_1.arrayWrap)(service.destination?.location);
        const changedOriginArray = (0, utils_1.arrayWrap)(service.currentOrigins?.location);
        const changedDestinationArray = (0, utils_1.arrayWrap)(service.currentDestinations?.location);
        const formatLocations = (location) => {
            return {
                locationName: location.locationName ?? null,
                crs: location.crs ?? null,
                via: location.via ?? null,
                unreachable: location.assocIsCancelled ?? null,
            };
        };
        const scheduledOrigins = originArray.map(formatLocations);
        const changedOrigins = changedOriginArray.map(formatLocations);
        const scheduledDestinations = destinationArray.map(formatLocations);
        const changedDestinations = changedDestinationArray.map(formatLocations);
        const buildObject = (obj, location) => {
            const { crs } = location;
            if (!crs) {
                throw new Error('Location without CRS');
            }
            if (typeof obj[crs] !== 'undefined') {
                throw new Error('Duplicate origin or destination');
            }
            obj[crs] = location;
            return obj;
        };
        const fromScheduled = scheduledOrigins.reduce(buildObject, {});
        const fromCurrent = changedOrigins.reduce(buildObject, {});
        const toScheduled = scheduledDestinations.reduce(buildObject, {});
        const toCurrent = changedDestinations.reduce(buildObject, {});
        return {
            from: {
                scheduled: fromScheduled,
                current: fromCurrent
            },
            to: {
                scheduled: toScheduled,
                current: toCurrent,
            }
        };
    }
    unWrapCallingPoints; //TODO write this
    formatTrainServiceCallingPoints(service) {
        /**
         * if this service has multiple origins/destinations this will be an
         * array. But if it only has one it won't be. So we'll make sure we're
         * always dealing with an array
         */
        const prevPointsSet = (0, utils_1.arrayWrap)(service.previousCallingPoints?.callingPointList);
        const subsequentPointsSet = (0, utils_1.arrayWrap)(service.subsequentCallingPoints?.callingPointList);
        /**
         * Now lets loop through them and remove the 'callingPoint' wrapper as
         * we format them. As above this too can be an array or an object
         */
        const formatPointsGeneric = (dataArray) => {
            return dataArray.map(element => {
                const data = (0, utils_1.arrayWrap)(element.callingPoint);
                return data.map(datum => {
                    return {
                        locationName: datum.locationName ?? null,
                        crs: datum.crs ?? null,
                        st: datum.st ?? null,
                        et: datum.et ?? null,
                        at: datum.at ?? null,
                        isCancelled: datum.isCancelled ?? null,
                        length: datum.length ?? null,
                        detachFront: datum.detachFront ?? null,
                        adhocAlerts: datum.adhocAlerts ?? null,
                    };
                });
            });
        };
        /**
         * These are now simple arrays of arrays of points. For example:
         * [
         *   [{}, {}, {}],         // points to destinationA
         *   [{}, {}, {}, {}, {}], // points to destinationB
         * ]
         */
        const basicPreviousArray = formatPointsGeneric(prevPointsSet);
        const basicNextArray = formatPointsGeneric(subsequentPointsSet);
        /**
         * We can use the last/first element of the arrays to wrap them in an
         * object indicating which origin / destination they are from / to.
         * for example:
         *
         * {
         *    KGX: [{}, {}, {}],         // points to King's Cross
         *    NCL: [{}, {}, {}, {}, {}], // points to Newcastle
         * }
         */
        const reducePoints = (carry, set, type) => {
            if (set.length === 0)
                return carry;
            const isOrigin = type === 'from';
            const crs = (isOrigin
                ? set[0].crs
                : set[set.length - 1].crs) ?? '???';
            if (typeof carry[crs] !== 'undefined') {
                const msg = `Duplicate ${(isOrigin ? 'origin' : 'destination')} encountered`;
                console.error(msg, service);
                throw new Error(msg);
            }
            carry[crs] = set;
            return carry;
        };
        const from = basicPreviousArray.reduce((carry, set) => {
            return reducePoints(carry, set, 'from');
        }, {});
        const to = basicNextArray.reduce((carry, set) => {
            return reducePoints(carry, set, 'to');
        }, {});
        return {
            to, from
        };
    }
    formatTrainServices(trainServices) {
        return trainServices.map((service) => {
            const { serviceID, sta, eta, std, etd, isCancelled, platform, operator, operatorCode, } = service;
            const endpoints = this.formatTrainServiceEndpoints(service);
            const { to, from } = this.formatTrainServiceCallingPoints(service);
            return {
                serviceID: serviceID ?? null,
                eta: eta ?? null,
                etd: etd ?? null,
                sta: sta ?? null,
                std: std ?? null,
                cancelled: isCancelled ?? null,
                platform: platform ?? null,
                operator: operator ?? null,
                operatorCode: operatorCode ?? null,
                to: endpoints.to,
                from: endpoints.from,
                callingPoints: { to, from },
            };
        });
    }
    async serviceDetails(serviceID) {
        const callPath = 'ldb.LDBServiceSoap12.GetServiceDetails';
        const results = await this.connector.call(callPath, { serviceID });
        const result = (results.GetServiceDetailsResult
            ? results.GetServiceDetailsResult
            : this.failedParse(callPath, results));
        TestConnector_1.default.createStub(callPath, { serviceID }, results);
        return results;
    }
    async arrivalsAndDepartures(options) {
        const callPath = 'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails';
        const args = {
            ...options
        };
        const results = await this.connector.call(callPath, args);
        const result = (results.GetStationBoardResult
            ? results.GetStationBoardResult
            : this.failedParse(callPath, results));
        // basic station data
        const { generatedAt, locationName, crs } = result;
        // train services array
        const resultTrainServices = (Array.isArray(result.trainServices.service)
            ? result.trainServices.service
            : [result.trainServices.service]);
        const trainServices = this.formatTrainServices(resultTrainServices);
        return {
            // basic station data
            generatedAt,
            locationName,
            crs,
            // train services
            trainServices,
        };
    }
}
exports.default = Darwin;
