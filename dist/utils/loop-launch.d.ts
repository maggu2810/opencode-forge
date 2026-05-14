/**
 * Fresh loop launch helper for TUI and tool-side execution.
 *
 * This module provides functions to create fresh loop sessions
 * separate from the restartLoop() function which requires preexisting loop state.
 */
import type { TuiPluginApi } from '@opencode-ai/plugin/tui';
interface FreshLoopOptions {
    planText: string;
    title: string;
    directory: string;
    projectId: string;
    isWorktree: boolean;
    api: TuiPluginApi;
    dbPath?: string;
    executionModel?: string;
    auditorModel?: string;
    /** Optional override for sandbox enabled state (for testing) */
    sandboxEnabled?: boolean;
    /** Skip sandbox wait (for testing - sandbox reconciliation won't occur) */
    skipSandboxWait?: boolean;
    hostSessionId?: string;
}
interface LaunchResult {
    sessionId: string;
    loopName: string;
    executionName: string;
    isWorktree: boolean;
    worktreeDir?: string;
    worktreeBranch?: string;
    workspaceId?: string;
    hostSessionId?: string;
}
/**
 * Launches a fresh loop session (either in-place or in a worktree).
 * This is separate from restartLoop() which requires preexisting loop state.
 *
 * @returns LaunchResult with session ID, loop name, and worktree details if successful, null otherwise
 */
export declare function launchFreshLoop(options: FreshLoopOptions): Promise<LaunchResult | null>;
export {};
//# sourceMappingURL=loop-launch.d.ts.map