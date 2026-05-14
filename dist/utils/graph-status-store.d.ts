/**
 * Graph status store for persisting and reading graph service state.
 *
 * This module provides helpers for persisting graph service lifecycle state
 * to the graph_status table, allowing the TUI to display real-time
 * graph readiness without direct backend coupling.
 */
import type { GraphStatusRepo } from '../storage/repos/graph-status-repo';
/**
 * Graph service state enumeration
 */
export type GraphState = 'unavailable' | 'initializing' | 'indexing' | 'ready' | 'error';
/**
 * Graph statistics payload
 */
export interface GraphStatsPayload {
    files: number;
    symbols: number;
    edges: number;
    calls: number;
}
/**
 * Persisted graph status payload
 */
export interface GraphStatusPayload {
    /** Current state of the graph service */
    state: GraphState;
    /** Whether the graph is ready for queries */
    ready: boolean;
    /** Optional statistics about the graph */
    stats?: GraphStatsPayload;
    /** Optional human-readable status or error message */
    message?: string;
    /** Timestamp of the last status update */
    updatedAt: number;
}
/**
 * Default unavailable status used when graph is disabled or not yet initialized
 */
export declare const UNAVAILABLE_STATUS: GraphStatusPayload;
/**
 * Writes graph status to the graph_status table.
 *
 * @param repo - The graph status repo instance
 * @param projectId - The project ID
 * @param status - The status payload to persist
 * @param cwd - Optional working directory scope for worktree sessions
 */
export declare function writeGraphStatus(repo: GraphStatusRepo, projectId: string, status: GraphStatusPayload, cwd?: string): void;
/**
 * Reads graph status from the graph_status table.
 *
 * @param repo - The graph status repo instance
 * @param projectId - The project ID
 * @param cwd - Optional working directory scope for worktree sessions
 * @returns The status payload or null if not found
 */
export declare function readGraphStatus(repo: GraphStatusRepo, projectId: string, cwd?: string): GraphStatusPayload | null;
/**
 * Creates a status callback function that persists graph state changes.
 *
 * This factory function returns a callback that can be passed to the graph
 * service to automatically persist state transitions to the graph_status table.
 *
 * @param repo - The graph status repo instance
 * @param projectId - The project ID
 * @param cwd - Optional working directory scope for worktree sessions
 * @returns A callback function for status updates
 */
export declare function createGraphStatusCallback(repo: GraphStatusRepo, projectId: string, cwd?: string): (state: GraphState, stats?: GraphStatsPayload, message?: string) => void;
/**
 * Determines if a graph status is transient (still being built).
 * Transient states indicate the graph is still being built and should
 * trigger continued waiting or polling.
 *
 * @param status - The graph status payload or null
 * @returns true if status is initializing or indexing, false otherwise
 */
export declare function isGraphTransient(status: GraphStatusPayload | null): boolean;
/**
 * Determines if a graph status is ready for queries.
 *
 * @param status - The graph status payload or null
 * @returns true if status is ready, false otherwise
 */
export declare function isGraphReady(status: GraphStatusPayload | null): boolean;
//# sourceMappingURL=graph-status-store.d.ts.map