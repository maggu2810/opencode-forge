/**
 * TUI plan store helper for resolving plan keys with loop-session awareness.
 *
 * This module provides plan reading/writing with session → loop resolution.
 * Reads prefer loop_large_fields.prompt (execution store), then fall back to
 * the plans table. Writes update both stores to stay in sync.
 */
/**
 * Reads plan content from the plans table for a session.
 *
 * @param projectId - The project ID (git commit hash)
 * @param sessionID - The session ID to read plan for
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns The plan content or null if not found
 */
export declare function readPlan(projectId: string, sessionID: string, dbPathOverride?: string): string | null;
/**
 * Writes plan content to the plans table for a session.
 *
 * @param projectId - The project ID (git commit hash)
 * @param sessionID - The session ID to write plan for
 * @param content - The plan content to write
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns true if successful, false otherwise
 */
export declare function writePlan(projectId: string, sessionID: string, content: string, dbPathOverride?: string): boolean;
/**
 * Deletes plan content from the plans table for a session.
 *
 * @param projectId - The project ID (git commit hash)
 * @param sessionID - The session ID to delete plan for
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns true if a row was deleted, false otherwise
 */
export declare function deletePlan(projectId: string, sessionID: string, dbPathOverride?: string): boolean;
//# sourceMappingURL=tui-plan-store.d.ts.map