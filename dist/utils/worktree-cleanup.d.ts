import type { Logger } from '../types';
interface WorktreeCleanupInput {
    worktreeDir: string;
    projectId?: string;
    dataDir?: string;
    logPrefix: string;
    logger: Logger | Console;
}
interface WorktreeCleanupResult {
    removed: boolean;
    graphScopeDeleted: boolean;
    error?: string;
}
export declare function cleanupLoopWorktree(input: WorktreeCleanupInput): Promise<WorktreeCleanupResult>;
export {};
//# sourceMappingURL=worktree-cleanup.d.ts.map