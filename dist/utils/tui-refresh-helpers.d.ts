/**
 * TUI refresh helpers for reading loop states from KV.
 *
 * This module provides testable helpers for accessing loop state
 * from the shared project KV store.
 */
import type { GraphStatusPayload } from './graph-status-store';
export type LoopInfo = {
    name: string;
    phase: string;
    iteration: number;
    maxIterations: number;
    sessionId: string;
    active: boolean;
    startedAt?: string;
    completedAt?: string;
    terminationReason?: string;
    worktreeBranch?: string;
    worktree?: boolean;
    worktreeDir?: string;
    executionModel?: string;
    auditorModel?: string;
    workspaceId?: string;
    hostSessionId?: string;
};
/**
 * Reads loop states from the loops table.
 *
 * @param projectId - The project ID (git commit hash)
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns Array of loop states
 */
export declare function readLoopStates(projectId: string, dbPathOverride?: string): LoopInfo[];
/**
 * Reads a single loop's current state by name from KV.
 * Used by LoopDetailsDialog to avoid stale snapshots.
 *
 * @param projectId - The project ID (git commit hash)
 * @param loopName - The loop name to read
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns The loop state or null if not found
 */
export declare function readLoopByName(projectId: string, loopName: string, dbPathOverride?: string): LoopInfo | null;
/**
 * Computes whether the sidebar should poll for updates based on
 * active worktree loops and transient graph status.
 *
 * Polling continues when:
 * - There is at least one active worktree loop, OR
 * - The graph status is in a transient state (initializing or indexing)
 *
 * Polling stops when:
 * - No active worktree loops AND graph status is terminal (ready, error, unavailable)
 *
 * @param loops - Array of loop states
 * @param graphStatus - Current graph status payload
 * @returns true if polling should continue, false otherwise
 */
export declare function shouldPollSidebar(loops: LoopInfo[], graphStatus: GraphStatusPayload | null): boolean;
//# sourceMappingURL=tui-refresh-helpers.d.ts.map