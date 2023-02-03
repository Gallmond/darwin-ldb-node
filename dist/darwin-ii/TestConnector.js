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
const fs_1 = require("fs");
const crypto_1 = require("crypto");
class TestConnector {
    initialised = false;
    getClient = () => { return {}; };
    async init() {
        this.initialised = true;
    }
    static getStubFileName(callPath, args) {
        const argsHash = (0, crypto_1.createHash)('md5')
            .update(JSON.stringify(args))
            .digest('hex');
        const stubKey = `${callPath}.${argsHash}`;
        const path = `${__dirname}/../../tests/data/stubs/${stubKey}.json`;
        return path;
    }
    static createStub(callPath, args, result, overWriteExisting = false) {
        const fileData = JSON.stringify(result);
        const fileName = TestConnector.getStubFileName(callPath, args);
        // do not overwrite existing stubs by default
        if (overWriteExisting === false && (0, fs_1.existsSync)(fileName)) {
            return fileName;
        }
        try {
            (0, fs_1.writeFileSync)(fileName, fileData);
        }
        catch (error) {
            console.error(`failed writing ${fileName}`, { error, callPath, args });
            throw error;
        }
        return fileName;
    }
    static getStub = async (callPath, args) => {
        var _a;
        const fileName = TestConnector.getStubFileName(callPath, args);
        let data;
        try {
            data = await (_a = fileName, Promise.resolve().then(() => __importStar(require(_a))));
        }
        catch (error) {
            console.error(`Error reading ${fileName}`, { error, callPath, args });
            throw error;
        }
        return data;
    };
    async call(callPath, args) {
        return await TestConnector.getStub(callPath, args);
    }
}
exports.default = TestConnector;
