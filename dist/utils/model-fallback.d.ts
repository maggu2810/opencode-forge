export declare function parseModelString(modelStr?: string): {
    providerID: string;
    modelID: string;
} | undefined;
export declare function retryWithModelFallback<T>(callWithModel: () => Promise<{
    data?: T;
    error?: unknown;
}>, callWithoutModel: () => Promise<{
    data?: T;
    error?: unknown;
}>, model: {
    providerID: string;
    modelID: string;
} | undefined, logger: {
    error: (msg: string, err?: unknown) => void;
    log: (msg: string) => void;
}, maxRetries?: number): Promise<{
    result: {
        data?: T;
        error?: unknown;
    };
    usedModel: {
        providerID: string;
        modelID: string;
    } | undefined;
}>;
//# sourceMappingURL=model-fallback.d.ts.map