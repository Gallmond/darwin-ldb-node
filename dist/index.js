"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoapConnector = exports.Darwin = void 0;
const darwin_ii_1 = __importDefault(require("./darwin-ii"));
exports.Darwin = darwin_ii_1.default;
const SoapConnector_1 = __importDefault(require("./darwin-ii/SoapConnector"));
exports.SoapConnector = SoapConnector_1.default;
