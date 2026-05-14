import { tool } from '@opencode-ai/plugin';
import type { ToolContext } from './types';
interface LoopSetupOptions {
    prompt: string;
    sessionTitle: string;
    loopName: string;
    sourcePlanSessionID?: string;
    maxIterations: number;
    audit: boolean;
    agent?: string;
    model?: {
        providerID: string;
        modelID: string;
    };
    worktree?: boolean;
    executionModel?: string;
    auditorModel?: string;
    onLoopStarted?: (loopName: string) => void;
    hostSessionId?: string;
}
export declare function setupLoop(ctx: ToolContext, options: LoopSetupOptions): Promise<string>;
export declare function createLoopTools(ctx: ToolContext): Record<string, ReturnType<typeof tool>>;
export {};
//# sourceMappingURL=loop.d.ts.map