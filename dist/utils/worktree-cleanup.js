import { execSync, spawnSync } from 'child_process';
import { resolve } from 'path';
export async function cleanupLoopWorktree(input) {
    const result = {
        removed: false,
        graphScopeDeleted: false,
    };
    try {
        const gitCommonDir = execSync('git rev-parse --git-common-dir', { cwd: input.worktreeDir, encoding: 'utf-8' }).trim();
        const gitRoot = resolve(input.worktreeDir, gitCommonDir, '..');
        const removeResult = spawnSync('git', ['worktree', 'remove', '-f', input.worktreeDir], { cwd: gitRoot, encoding: 'utf-8' });
        if (removeResult.status !== 0) {
            throw new Error(removeResult.stderr || 'git worktree remove failed');
        }
        result.removed = true;
        input.logger.log(`${input.logPrefix}: removed worktree ${input.worktreeDir}`);
        if (input.projectId && input.dataDir) {
            const { deleteGraphCacheScope } = await import('../storage/graph-projects');
            result.graphScopeDeleted = deleteGraphCacheScope(input.projectId, input.worktreeDir, input.dataDir);
            if (result.graphScopeDeleted) {
                input.logger.log(`${input.logPrefix}: deleted graph cache for worktree ${input.worktreeDir}`);
            }
        }
    }
    catch (err) {
        result.error = err instanceof Error ? err.message : String(err);
        input.logger.error(`${input.logPrefix}: failed to cleanup worktree`, err);
    }
    return result;
}
//# sourceMappingURL=worktree-cleanup.js.map