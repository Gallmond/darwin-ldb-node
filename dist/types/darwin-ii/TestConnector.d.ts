import { PlainObj, ConnectorInterface } from './ldb-types';
declare class TestConnector implements ConnectorInterface {
    initialised: boolean;
    getClient: () => {};
    init(): Promise<void>;
    private static getStubFileName;
    static createStub(callPath: string, args: PlainObj, result: PlainObj, overWriteExisting?: boolean): string;
    static getStub: (callPath: string, args: PlainObj) => Promise<PlainObj>;
    call(callPath: string, args: PlainObj): Promise<unknown>;
}
export default TestConnector;
//# sourceMappingURL=TestConnector.d.ts.map