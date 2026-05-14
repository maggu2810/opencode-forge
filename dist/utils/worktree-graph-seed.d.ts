/**
 * Worktree graph seeding helper.
 *
 * This module provides a shared helper for seeding a worktree-scoped graph cache
 * from an existing source repo graph cache. This reduces loop startup latency by
 * reusing the graph cache when the target worktree matches the source fingerprint.
 */
import type { Logger } from '../types';
import type { GraphStatusRepo } from '../storage/repos/graph-status-repo';
/**
 * Options for seeding a worktree graph scope
 */
export interface SeedWorktreeGraphScopeOptions {
    /** Project ID for the graph cache */
    projectId: string;
    /** Source working directory (original repo) */
    sourceCwd: string;
    /** Target working directory (worktree) */
    targetCwd: string;
    /** Data directory for graph cache storage */
    dataDir: string;
    /** Graph status repo for status copy (optional, for tool-side path) */
    graphStatusRepo?: GraphStatusRepo;
    /** Optional logger for logging seed operations */
    logger?: Logger;
}
/**
 * Result of a graph seeding attempt
 */
export interface SeedResult {
    /** Whether the graph was successfully seeded */
    seeded: boolean;
    /** Reason for the result (success or skip reason) */
    reason: string;
}
/**
 * Seeds a worktree graph scope from an existing source graph cache.
 *
 * This function:
 * 1. Resolves source and target cache directories
 * 2. Validates source metadata exists with fingerprint fields
 * 3. Computes target fingerprint and compares to source
 * 4. Copies graph cache (DB, WAL/SHM, metadata) if fingerprints match
 * 5. Rewrites target metadata with new cwd
 * 6. Copies ready graph status if source status is ready
 *
 * @param options - Seeding options
 * @returns SeedResult indicating success or skip reason
 */
export declare function seedWorktreeGraphScope(options: SeedWorktreeGraphScopeOptions): Promise<SeedResult>;
//# sourceMappingURL=worktree-graph-seed.d.ts.map