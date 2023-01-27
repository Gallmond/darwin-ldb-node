"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const SoapConnector_1 = __importDefault(require("./SoapConnector"));
class Darwin {
    constructor(options) {
        this.initialised = false;
        this.connectorInstance = null;
        this.options = {
            debug: false
        };
        if (options) {
            this.options = Object.assign(Object.assign({}, this.options), options);
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
    static make(wsdlUrl, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const _wsdlUrl = wsdlUrl !== null && wsdlUrl !== void 0 ? wsdlUrl : process.env.LDB_DARWIN_WSDL_URL;
            const _accessToken = accessToken !== null && accessToken !== void 0 ? accessToken : process.env.LDB_DARWIN_ACCESS_TOKEN;
            if (!_wsdlUrl || !_accessToken) {
                throw new Error('Cannot instantiate SOAP Connector without WSDL and Access Token');
            }
            const connector = new SoapConnector_1.default(_wsdlUrl, _accessToken);
            const darwin = new Darwin();
            darwin.connector = connector;
            yield darwin.init();
            return darwin;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connector.initialised) {
                yield this.connector.init();
            }
            this.initialised = this.connector.initialised;
        });
    }
    failedParse(callPath, results) {
        console.error('failed to parse response', {
            callPath, results
        });
        throw new Error('Failed to parse response');
    }
    formatTrainServiceEndpoints(service) {
        var _a, _b, _c, _d;
        const originArray = (0, utils_1.arrayWrap)((_a = service.origin) === null || _a === void 0 ? void 0 : _a.location);
        const destinationArray = (0, utils_1.arrayWrap)((_b = service.destination) === null || _b === void 0 ? void 0 : _b.location);
        const changedOriginArray = (0, utils_1.arrayWrap)((_c = service.currentOrigins) === null || _c === void 0 ? void 0 : _c.location);
        const changedDestinationArray = (0, utils_1.arrayWrap)((_d = service.currentDestinations) === null || _d === void 0 ? void 0 : _d.location);
        const formatLocations = (location) => {
            var _a, _b, _c, _d;
            return {
                locationName: (_a = location.locationName) !== null && _a !== void 0 ? _a : null,
                crs: (_b = location.crs) !== null && _b !== void 0 ? _b : null,
                via: (_c = location.via) !== null && _c !== void 0 ? _c : null,
                unreachable: (_d = location.assocIsCancelled) !== null && _d !== void 0 ? _d : null,
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
    formatTrainServiceCallingPoints(service) {
        var _a, _b;
        /**
         * these points all have annoying wrapping. Lets transform them to a
         * simple array where each entry is an array of calling points.
         *
         * Both origin and destination use the same format so we can use this
         * helper function
         */
        const formatPointsGeneric = (dataArray) => {
            return dataArray.map(element => {
                const data = (0, utils_1.arrayWrap)(element.callingPoint);
                return data.map(datum => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return {
                        locationName: (_a = datum.locationName) !== null && _a !== void 0 ? _a : null,
                        crs: (_b = datum.crs) !== null && _b !== void 0 ? _b : null,
                        st: (_c = datum.st) !== null && _c !== void 0 ? _c : null,
                        et: (_d = datum.et) !== null && _d !== void 0 ? _d : null,
                        at: (_e = datum.at) !== null && _e !== void 0 ? _e : null,
                        isCancelled: (_f = datum.isCancelled) !== null && _f !== void 0 ? _f : null,
                        length: (_g = datum.length) !== null && _g !== void 0 ? _g : null,
                        detachFront: (_h = datum.detachFront) !== null && _h !== void 0 ? _h : null,
                        adhocAlerts: (_j = datum.adhocAlerts) !== null && _j !== void 0 ? _j : null,
                    };
                });
            });
        };
        const prevPointsSet = (0, utils_1.arrayWrap)((_a = service.previousCallingPoints) === null || _a === void 0 ? void 0 : _a.callingPointList);
        const subsequentPointsSet = (0, utils_1.arrayWrap)((_b = service.subsequentCallingPoints) === null || _b === void 0 ? void 0 : _b.callingPointList);
        const basicPreviousArray = formatPointsGeneric(prevPointsSet);
        const basicNextArray = formatPointsGeneric(subsequentPointsSet);
        /**
         * A note on the order of the calling points
         * - they are in chronological order in both arrays
         * - eg an Edinburgh -> London KGX services listed at newcastle will have
         * - Aberdeen as first and Bewrick as last elements of the previous array
         * - Darlington as first and KGX as last elements of the next array
         */
        const from = basicPreviousArray.reduce((carry, set) => {
            var _a;
            // no entries in this set, do nothing
            if (set.length === 0)
                carry;
            // get the first CRS as this is the 'from set
            const firstCrs = (_a = set[0].crs) !== null && _a !== void 0 ? _a : '???';
            if (typeof carry[firstCrs] !== 'undefined') {
                const msg = 'Duplicate origin encountered';
                console.error(msg, service);
                throw new Error(msg);
            }
            carry[firstCrs] = set;
            return carry;
        }, {});
        const to = basicNextArray.reduce((carry, set) => {
            var _a;
            // no entries in this set, do nothing
            if (set.length === 0)
                carry;
            // get the last crs, as this is the 'to' set
            const lastCrs = (_a = set[set.length - 1].crs) !== null && _a !== void 0 ? _a : '???';
            if (typeof carry[lastCrs] !== 'undefined') {
                const msg = 'Duplicate destination encountered';
                console.error(msg, service);
                throw new Error(msg);
            }
            carry[lastCrs] = set;
            return carry;
        }, {});
        return {
            to, from
        };
    }
    formatTrainServices(trainServices) {
        return trainServices.map((service) => {
            const { sta, eta, std, etd, platform, operator, operatorCode, serviceID, isCancelled, } = service;
            const endpoints = this.formatTrainServiceEndpoints(service);
            const { to, from } = this.formatTrainServiceCallingPoints(service);
            return {
                serviceID: serviceID !== null && serviceID !== void 0 ? serviceID : null,
                eta: eta !== null && eta !== void 0 ? eta : null,
                etd: etd !== null && etd !== void 0 ? etd : null,
                sta: sta !== null && sta !== void 0 ? sta : null,
                std: std !== null && std !== void 0 ? std : null,
                cancelled: isCancelled !== null && isCancelled !== void 0 ? isCancelled : null,
                platform: platform !== null && platform !== void 0 ? platform : null,
                operator: operator !== null && operator !== void 0 ? operator : null,
                operatorCode: operatorCode !== null && operatorCode !== void 0 ? operatorCode : null,
                to: endpoints.to,
                from: endpoints.from,
                callingPoints: { to, from },
            };
        });
    }
    arrivalsAndDepartures(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const callPath = 'ldb.LDBServiceSoap12.GetArrDepBoardWithDetails';
            const args = Object.assign({}, options);
            const results = yield this.connector.call(callPath, args);
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
        });
    }
}
exports.default = Darwin;
