import type { PluginInput } from '@opencode-ai/plugin';
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { LoopService } from '../services/loop';
import type { Logger, PluginConfig } from '../types';
import type { createSandboxManager } from '../sandbox/manager';
export interface LoopEventHandler {
    onEvent(input: {
        event: {
            type: string;
            properties?: Record<string, unknown>;
        };
    }): Promise<void>;
    terminateAll(): void;
    clearAllRetryTimeouts(): void;
    startWatchdog(loopName: string): void;
    getStallInfo(loopName: string): {
        consecutiveStalls: number;
        lastActivityTime: number;
    } | null;
    cancelBySessionId(sessionId: string): Promise<boolean>;
    runExclusive<T>(loopName: string, fn: () => Promise<T>): Promise<T>;
    clearLoopTimers(loopName: string): void;
}
export declare function createLoopEventHandler(loopService: LoopService, _client: PluginInput['client'], v2Client: OpencodeClient, logger: Logger, getConfig: () => PluginConfig, sandboxManager?: ReturnType<typeof createSandboxManager>, projectId?: string, dataDir?: string): LoopEventHandler;
//# sourceMappingURL=loop.d.ts.map