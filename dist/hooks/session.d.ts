import type { Logger, CompactionConfig } from '../types';
import type { PluginInput } from '@opencode-ai/plugin';
export interface SessionHooks {
    onMessage: (input: unknown, output: unknown) => Promise<void>;
    onEvent: (input: {
        event: {
            type: string;
            properties?: Record<string, unknown>;
        };
    }) => Promise<void>;
    onCompacting: (input: {
        sessionID: string;
    }, output: {
        context: string[];
        prompt?: string;
    }) => Promise<void>;
}
export declare function createSessionHooks(projectId: string, logger: Logger, _ctx: PluginInput, config?: CompactionConfig): SessionHooks;
//# sourceMappingURL=session.d.ts.map