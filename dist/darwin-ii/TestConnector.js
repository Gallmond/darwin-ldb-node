"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const crypto_1 = require("crypto");
class TestConnector {
    initialised = false;
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
            return;
        }
        try {
            (0, fs_1.writeFileSync)(fileName, fileData);
        }
        catch (error) {
            console.error(`failed writing ${fileName}`, { error, callPath, args });
            throw error;
        }
    }
    static getStub = (callPath, args) => {
        const fileName = TestConnector.getStubFileName(callPath, args);
        let data;
        try {
            data = (0, fs_1.readFileSync)(fileName, { encoding: 'utf-8' });
        }
        catch (error) {
            console.error(`Error reading ${fileName}`, { error, callPath, args });
            throw error;
        }
        return JSON.parse(data);
    };
    async call(callPath, args) {
        return TestConnector.getStub(callPath, args);
    }
}
exports.default = TestConnector;
