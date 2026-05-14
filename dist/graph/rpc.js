/// <reference types="bun-types" />
import { EventEmitter } from 'events';
/**
 * Per-call RPC timeout in milliseconds.
 * This timeout applies to individual RPC method calls, not to multi-step operations like batch scans.
 * Configure via GRAPH_RPC_TIMEOUT_MS environment variable.
 * Default: 120000 (120 seconds)
 */
const RPC_TIMEOUT_MS = parseInt(process.env.GRAPH_RPC_TIMEOUT_MS ?? '120000', 10);
/**
 * Generic RPC client for worker communication
 * Simplified from SoulForge without Zustand store references
 */
export class RpcClient extends EventEmitter {
    logger;
    worker;
    pendingCalls = new Map();
    callId = 0;
    workerTerminated = false;
    workerError = null;
    constructor(worker, logger) {
        super();
        this.logger = logger;
        this.worker = worker;
        this.setupWorkerHandlers();
    }
    setupWorkerHandlers() {
        this.worker.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        this.worker.onerror = (error) => {
            this.workerError = error instanceof Error ? error : new Error(error.message || 'Worker error');
            this.logger?.error('Worker error occurred', this.workerError);
            this.rejectAllPending(new Error(`Worker error: ${this.workerError.message}`));
            this.emit('error', error);
        };
        // Handle worker termination
        this.worker.addEventListener('messageerror', () => {
            this.workerTerminated = true;
            this.logger?.error('Worker message error - worker may be terminated');
            this.rejectAllPending(new Error('Worker terminated'));
        });
    }
    rejectAllPending(error) {
        for (const [, pending] of this.pendingCalls.entries()) {
            clearTimeout(pending.timeout);
            pending.reject(error);
        }
        this.pendingCalls.clear();
    }
    handleMessage(data) {
        if (data && typeof data === 'object' && 'callId' in data) {
            const msg = data;
            if (msg.event) {
                // Handle events from worker
                this.emit(msg.event, msg.payload);
                return;
            }
            const pending = this.pendingCalls.get(msg.callId);
            if (pending) {
                clearTimeout(pending.timeout);
                this.pendingCalls.delete(msg.callId);
                if (msg.error) {
                    pending.reject(new Error(msg.error));
                }
                else {
                    pending.resolve(msg.result);
                }
            }
        }
    }
    async call(method, args) {
        if (this.workerTerminated) {
            throw new Error('Worker has been terminated');
        }
        if (this.workerError) {
            throw new Error(`Worker error: ${this.workerError.message}`);
        }
        const callId = ++this.callId;
        const message = { callId, method, args };
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingCalls.delete(callId);
                reject(new Error(`RPC call '${method}' timed out after ${RPC_TIMEOUT_MS}ms`));
            }, RPC_TIMEOUT_MS);
            this.pendingCalls.set(callId, { resolve: resolve, reject, timeout });
            try {
                this.worker.postMessage(message);
            }
            catch (error) {
                clearTimeout(timeout);
                this.pendingCalls.delete(callId);
                this.workerTerminated = true;
                const postError = error instanceof Error ? error : new Error(String(error));
                this.workerError = postError; // Set error for consistent state tracking
                this.logger?.error('Failed to post message to worker', postError);
                this.rejectAllPending(postError);
                reject(postError);
            }
        });
    }
    terminate() {
        this.workerTerminated = true;
        this.worker.terminate();
    }
    isHealthy() {
        return !this.workerTerminated && this.workerError === null;
    }
    markTerminated() {
        this.workerTerminated = true;
        this.rejectAllPending(new Error('Worker terminated'));
    }
}
/**
 * RPC server for worker side
 */
export class RpcServer {
    handlers = new Map();
    register(method, handler) {
        this.handlers.set(method, handler);
    }
    async handle(message, postResponse) {
        if (!message || typeof message !== 'object')
            return;
        const msg = message;
        const { callId, method, args } = msg;
        try {
            const handler = this.handlers.get(method);
            if (!handler) {
                throw new Error(`Unknown method: ${method}`);
            }
            const result = await handler(args);
            postResponse({ callId, result });
        }
        catch (error) {
            postResponse({
                callId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    emit(_event, _payload) {
        // Will be called from worker to emit events to client
    }
}
//# sourceMappingURL=rpc.js.map