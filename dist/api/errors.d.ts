export declare class ApiError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string);
}
export declare const badRequest: (msg: string) => ApiError;
export declare const unauthorized: () => ApiError;
export declare const forbidden: (msg?: string) => ApiError;
export declare const notFound: (msg?: string) => ApiError;
export declare const conflict: (msg: string) => ApiError;
//# sourceMappingURL=errors.d.ts.map