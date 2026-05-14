import type { TuiPluginApi } from '@opencode-ai/plugin/tui';
export interface SessionStats {
    tokens: {
        input: number;
        output: number;
        reasoning: number;
        cacheRead: number;
        cacheWrite: number;
        total: number;
    };
    cost: number;
    messages: {
        total: number;
        assistant: number;
    };
    fileChanges: {
        additions: number;
        deletions: number;
        files: number;
    } | null;
    timing: {
        created: string;
        updated: string;
        durationMs: number;
    } | null;
    lastActivity: {
        summary: string;
        toolCalls: Array<{
            tool: string;
            title: string;
            status: string;
        }>;
    } | null;
}
export declare function fetchSessionStats(api: TuiPluginApi, sessionId: string, directory: string): Promise<SessionStats | null>;
//# sourceMappingURL=session-stats.d.ts.map