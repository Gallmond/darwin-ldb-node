import { PlainObj, ConnectorInterface } from './types';
declare class TestConnector implements ConnectorInterface {
    initialised: boolean;
    init(): Promise<void>;
    private static getStubFileName;
    static createStub(callPath: string, args: PlainObj, result: PlainObj, overWriteExisting?: boolean): void;
    static getStub: (callPath: string, args: PlainObj) => PlainObj;
    call(callPath: string, args: PlainObj): Promise<unknown>;
}
export default TestConnector;
//# sourceMappingURL=TestConnector.d.ts.map