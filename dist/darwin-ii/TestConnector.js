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
        const hasher = (0, crypto_1.createHash)('md5');
        hasher.update(JSON.stringify(args));
        const argsHash = hasher.digest('hex');
        const stubKey = `${callPath}.${argsHash}`;
        const path = `${__dirname}/../../tests/data/stubs/${stubKey}.json`;
        console.log({ path });
        return path;
    }
    static createStub(callPath, args, result, overWriteExisting = false) {
        const fileData = JSON.stringify(result);
        const fileName = TestConnector.getStubFileName(callPath, args);
        console.log({ fileName });
        // do not overwrite existing stubs by default
        if (overWriteExisting === false && (0, fs_1.existsSync)(fileName)) {
            return;
        }
        try {
            (0, fs_1.writeFileSync)(fileName, fileData);
            console.log(`wrote stub ${fileName}`);
        }
        catch (e) {
            console.error(`failed writing ${fileName}`, e);
            throw e;
        }
    }
    static getStub = (callPath, args) => {
        const fileName = TestConnector.getStubFileName(callPath, args);
        let data;
        try {
            data = (0, fs_1.readFileSync)(fileName, { encoding: 'utf-8' });
        }
        catch (e) {
            console.error(`Error reading ${fileName}`, e);
            throw e;
        }
        return JSON.parse(data);
    };
    async call(callPath, args) {
        return TestConnector.getStub(callPath, args);
    }
}
exports.default = TestConnector;
