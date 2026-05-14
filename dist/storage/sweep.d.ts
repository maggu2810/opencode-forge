import type { Database } from 'bun:sqlite';
/**
 * Sweeps expired completed loops from the database.
 *
 * Deletes rows from `loops` where:
 * - status != 'running'
 * - completed_at + ttlMs < now()
 *
 * Cascade deletes propagate to:
 * - loop_large_fields (via FK)
 * - plans with loop_name matching deleted loops (explicit DELETE)
 *
 * Note: review_findings and graph_status are NOT tied to loops and are not swept.
 *
 * @param db - Database instance
 * @param ttlMs - TTL in milliseconds for completed loops
 * @returns Number of rows deleted from loops table
 */
export declare function sweepExpiredLoops(db: Database, ttlMs: number): number;
//# sourceMappingURL=sweep.d.ts.map