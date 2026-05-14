/**
 * TUI graph status helper for reading persisted graph state.
 *
 * This module provides read helpers for accessing graph service status
 * from the graph_status table via GraphStatusRepo.
 */
import type { GraphStatusPayload } from './graph-status-store';
/**
 * Gets the database path used by the memory plugin.
 * Exported for testing purposes.
 */
export declare function getDbPath(): string;
/**
 * Gets the database path for a specific data directory.
 * Exported for testing purposes.
 */
export declare function getDbPathForDataDir(dataDir: string): string;
/**
 * Reads graph status from the graph_status table.
 *
 * @param projectId - The project ID (git commit hash)
 * @param dbPathOverride - Optional database path override (for testing)
 * @param cwd - Optional working directory scope for worktree sessions
 * @returns The graph status payload or null if not found
 */
export declare function readGraphStatus(projectId: string, dbPathOverride?: string, cwd?: string): GraphStatusPayload | null;
/**
 * Determines if the current graph status is still in-flight (transient).
 * Transient states indicate the graph is still being built and should
 * trigger continued sidebar refresh polling.
 *
 * Terminal states (ready, error, unavailable, null) do not require
 * continued polling unless there are active worktree loops.
 *
 * @param status - The graph status payload or null
 * @returns true if status is initializing or indexing, false otherwise
 */
export declare function isTransient(status: GraphStatusPayload | null): boolean;
/**
 * Waits for graph readiness with a bounded timeout.
 *
 * This function polls the graph status for a specific scope (projectId + cwd)
 * and resolves when the graph becomes ready or times out. It handles transient
 * states (initializing/indexing) by continuing to poll, but will not block
 * forever on missing/error/unavailable status.
 *
 * @param projectId - The project ID
 * @param options - Wait options including db path, cwd scope, and timing
 * @returns Promise resolving to the final status or 'timeout'
 */
export declare function waitForGraphReady(projectId: string, options?: {
    dbPathOverride?: string;
    cwd?: string;
    pollMs?: number;
    timeoutMs?: number;
}): Promise<GraphStatusPayload | 'timeout' | null>;
/**
 * Formats graph status for display in the TUI sidebar.
 * Returns the state text and color based solely on the persisted graph state.
 *
 * @param status - The graph status payload
 * @returns Formatted display with state text and color
 */
export declare function formatGraphStatus(status: GraphStatusPayload | null): {
    text: string;
    color: 'success' | 'info' | 'warning' | 'error' | 'textMuted';
};
//# sourceMappingURL=tui-graph-status.d.ts.map