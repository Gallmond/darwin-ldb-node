"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const SoapConnector_1 = __importDefault(require("./SoapConnector"));
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
                const msg = 'Duplicate origin or destination';
                console.error(msg, { crs, obj, location });
                throw new Error();
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
    /**
     * Transforms the SOAP-response calling point wrapping into something more
     * usable
     */
    unWrapCallingPoints(serviceCallingPoints) {
        /**
         * This is now
         * {callingPoint: CallingPointResult | CallingPointResult[] }[]
         */
        const callingPointsList = (0, utils_1.arrayWrap)(serviceCallingPoints.callingPointList);
        /**
         * This is now
         * CallingPointResult[][]
         */
        const callingPointsSets = callingPointsList.map(datum => {
            return (0, utils_1.arrayWrap)(datum.callingPoint);
        });
        /**
         * This is now
         * CallingPointLocation[][]
         */
        const formattedPointsSets = callingPointsSets.map(datum => {
            return datum.map(data => {
                const length = parseInt(data.length ?? '');
                return {
                    locationName: data.locationName ?? null,
                    crs: data.crs ?? null,
                    st: data.st ?? null,
                    et: data.et ?? null,
                    at: data.at ?? null,
                    isCancelled: data.isCancelled ?? null,
                    length: !isNaN(length) ? length : null,
                    detachFront: data.detachFront ?? null,
                    adhocAlerts: data.adhocAlerts ?? null,
                };
            });
        });
        return formattedPointsSets;
    }
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
    formatToCallingPoints(callingPointLocationsArray, type) {
        return callingPointLocationsArray.reduce((carry, callingPointLocations) => {
            if (callingPointLocations.length === 0)
                return carry;
            const isOrigin = type === 'from';
            const crs = (isOrigin
                ? callingPointLocations[0].crs
                : callingPointLocations[callingPointLocations.length - 1].crs) ?? '???';
            if (typeof carry[crs] !== 'undefined') {
                const msg = `Duplicate ${(isOrigin ? 'origin' : 'destination')} encountered`;
                console.error(msg, { callingPointLocationsArray, type, crs });
                throw new Error(msg);
            }
            carry[crs] = callingPointLocations;
            return carry;
        }, {});
    }
    formatTrainServiceCallingPoints(service) {
        const basicPreviousArray = this.unWrapCallingPoints(service.previousCallingPoints ?? { callingPointList: [] });
        const basicNextArray = this.unWrapCallingPoints(service.subsequentCallingPoints ?? { callingPointList: [] });
        const from = this.formatToCallingPoints(basicPreviousArray, 'from');
        const to = this.formatToCallingPoints(basicNextArray, 'to');
        return {
            from, to
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
        const stationData = {
            generatedAt: result.generatedAt,
            locationName: result.locationName,
            crs: result.crs,
            operator: result.operator,
            operatorCode: result.operatorCode,
            length: Number.isNaN(parseInt(result.length)) ? null : parseInt(result.length),
            platform: result.platform ?? null,
            alerts: result.adhocAlerts ?? []
        };
        const serviceTimeData = {
            sta: result.sta ?? null,
            eta: result.eta ?? null,
            ata: result.ata ?? null,
            std: result.std ?? null,
            etd: result.etd ?? null,
            atd: result.atd ?? null,
        };
        const changeData = {
            delayReason: result.delayReason ?? null,
            isCancelled: result.isCancelled ?? null,
            cancelledReason: result.cancelReason ?? null,
            isDiverted: result.divertedVia ? true : false,
            divertedVia: result.divertedVia ?? null,
            diversionReason: result.diversionReason ?? null,
        };
        const prevCallingPoints = this.unWrapCallingPoints(result.previousCallingPoints ?? { callingPointList: [] });
        const nextCallingPoints = this.unWrapCallingPoints(result.subsequentCallingPoints ?? { callingPointList: [] });
        const to = this.formatToCallingPoints(nextCallingPoints, 'to');
        const from = this.formatToCallingPoints(prevCallingPoints, 'from');
        const formation = {
            isReverse: result.isReverseFormation ?? null,
            category: {
                loadingCode: result.formation?.loadingCategory.code ?? null,
                colour: result.formation?.loadingCategory.colour ?? null,
                image: result.formation?.loadingCategory.image ?? null
            },
            coaches: (result.formation?.coaches ?? []).reduce((carry, current) => {
                const thisCoach = {
                    class: current.coachClass,
                    loading: current.loading,
                    loadingSpecified: (0, utils_1.boolify)(current.loadingSpecified) ?? false,
                    number: current.number,
                    toilet: {
                        status: current.toilet.status,
                        type: current.toilet.value,
                    }
                };
                carry.push(thisCoach);
                return carry;
            }, [])
        };
        return {
            ...stationData,
            ...serviceTimeData,
            ...changeData,
            splits: result.detachFront ?? null,
            callingPoints: { to, from },
            formation: formation
        };
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
