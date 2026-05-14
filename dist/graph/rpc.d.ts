import { EventEmitter } from 'events';
/**
 * Generic RPC client for worker communication
 * Simplified from SoulForge without Zustand store references
 */
export declare class RpcClient extends EventEmitter {
    private logger?;
    private worker;
    private pendingCalls;
    private callId;
    private workerTerminated;
    private workerError;
    constructor(worker: Worker, logger?: {
        error: (msg: string, error?: unknown) => void;
        debug?: (msg: string) => void;
    } | undefined);
    private setupWorkerHandlers;
    private rejectAllPending;
    private handleMessage;
    call<T>(method: string, args: unknown[]): Promise<T>;
    terminate(): void;
    isHealthy(): boolean;
    markTerminated(): void;
}
/**
 * RPC server for worker side
 */
export declare class RpcServer {
    private handlers;
    register(method: string, handler: (args: unknown[]) => Promise<unknown> | unknown): void;
    handle(message: unknown, postResponse: (response: unknown) => void): Promise<void>;
    emit(_event: string, _payload?: unknown): void;
}
//# sourceMappingURL=rpc.d.ts.map