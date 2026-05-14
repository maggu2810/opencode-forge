import type { Plugin } from '@opencode-ai/plugin';
import { createOpencodeClient as createV2Client } from '@opencode-ai/sdk/v2';
import { createLoopService } from './services/loop';
import { createLogger } from './utils/logger';
import type { PluginConfig } from './types';
export interface CreateParentSessionLookupOptions {
    v2: ReturnType<typeof createV2Client>;
    directory: string;
    loopService: ReturnType<typeof createLoopService>;
    logger: ReturnType<typeof createLogger>;
    negativeTtlMs?: number;
}
export declare function createParentSessionLookup({ v2, directory, loopService, logger, negativeTtlMs, }: CreateParentSessionLookupOptions): (sessionId: string) => Promise<string | null>;
export interface CreateSessionDirectoryLookupOptions {
    v2: ReturnType<typeof createV2Client>;
    directory: string;
    loopService: ReturnType<typeof createLoopService>;
}
export declare function createSessionDirectoryLookup({ v2, directory, loopService, }: CreateSessionDirectoryLookupOptions): (sessionId: string) => Promise<string | null>;
/**
 * Creates an OpenCode plugin instance with loop management, graph indexing, and sandboxing.
 *
 * @param config - Plugin configuration including loop, graph, sandbox, and logging settings
 * @returns OpenCode Plugin instance with hooks for tools, events, and session management
 */
export declare function createForgePlugin(config: PluginConfig): Plugin;
declare const pluginModule: {
    id: string;
    server: Plugin;
};
export default pluginModule;
export type { PluginConfig, CompactionConfig } from './types';
export { VERSION } from './version';
//# sourceMappingURL=index.d.ts.map