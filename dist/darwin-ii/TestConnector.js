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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const crypto_1 = require("crypto");
class TestConnector {
    constructor() {
        this.initialised = false;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialised = true;
        });
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
    call(callPath, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return TestConnector.getStub(callPath, args);
        });
    }
}
TestConnector.getStub = (callPath, args) => {
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
exports.default = TestConnector;
