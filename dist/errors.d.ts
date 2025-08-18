declare class MethodNotFoundError extends Error {
    constructor(path: string);
}
declare class MethodCallError extends Error {
}
declare class ResponseParseError extends Error {
    constructor(data: unknown);
}
export { MethodNotFoundError, MethodCallError, ResponseParseError };
//# sourceMappingURL=errors.d.ts.map