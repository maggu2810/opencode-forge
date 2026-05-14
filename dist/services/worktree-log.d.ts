import type { PluginConfig, Logger } from '../types';
/**
 * Context for resolving worktree log target paths.
 */
export interface WorktreeLogContext {
    /** The project directory (loop worktree dir or project root). */
    projectDir: string;
    /** Optional data directory for default path resolution. */
    dataDir?: string;
    /** Optional sandbox host directory for permission path mapping. */
    sandboxHostDir?: string;
    /** Whether the loop is running in sandbox mode. */
    sandbox?: boolean;
}
/**
 * Serializable payload containing all data needed for worktree completion logging.
 * This allows the host session to write logs without needing access to the worktree session.
 */
export interface WorktreeCompletionLogPayload {
    /** The configured log directory (host path). */
    logDirectory: string;
    /** The project directory (host path). */
    projectDir: string;
    /** The name of the completed loop. */
    loopName: string;
    /** ISO timestamp of completion. */
    completionTimestamp: string;
    /** The iteration count when the loop completed. */
    iteration: number;
    /** The worktree branch name, if applicable. */
    worktreeBranch?: string;
    /** The plan text to include in the log entry, if available. */
    planText?: string | null;
}
/**
 * Result of building a worktree completion log payload.
 */
export interface BuildWorktreeCompletionPayloadResult {
    /** The serializable payload for logging. */
    payload: WorktreeCompletionLogPayload;
    /** The permission path for sandbox rules (may be null if outside sandbox mount). */
    permissionPath: string | null;
    /** The resolved host path for the log directory. */
    hostPath: string;
}
/**
 * Result of resolving a worktree log target.
 * Contains both the host path and the permission path for sandbox-aware rules.
 */
export interface WorktreeLogTarget {
    /** The absolute path on the host filesystem. */
    hostPath: string;
    /** The path to use for permission rules (may be container-mapped or null if unreachable). */
    permissionPath: string | null;
}
/**
 * Pure resolver: derives the configured log directory from config + runtime context.
 * Does NOT create directories or verify writability.
 * Returns null if logging is disabled or directory cannot be resolved.
 */
export declare function resolveWorktreeLogTarget(config: PluginConfig, context: WorktreeLogContext, logger?: Logger): WorktreeLogTarget | null;
/**
 * Validator/initializer: creates the directory and verifies write access.
 * Should only be called when host-side logging is about to occur.
 * Returns true if the directory is writable, false otherwise.
 */
export declare function ensureWorktreeLogDirectory(hostPath: string, logger?: Logger): boolean;
/**
 * Formats a date as YYYY-MM-DD in local timezone.
 */
export declare function formatDateKey(date: Date): string;
/**
 * Formats a worktree completion entry with plan-based deterministic formatting.
 * This is a pure helper for tests and host logging prompts.
 */
export declare function formatWorktreeCompletionEntry(options: {
    projectDir: string;
    loopName: string;
    completionTimestamp: Date;
    iteration: number;
    worktreeBranch?: string;
}, planText: string | null): string;
/**
 * Appends a markdown entry to the dated log file.
 * Creates the file if it doesn't exist.
 * Returns true on success, false on failure.
 */
export declare function appendWorktreeLogEntry(directory: string, options: {
    projectDir: string;
    loopName: string;
    completionTimestamp: Date;
    iteration: number;
    worktreeBranch?: string;
}, planText?: string | null, logger?: Logger): boolean;
/**
 * Builds a serializable payload for worktree completion logging.
 * This payload contains all data needed to write a log entry from the host session.
 *
 * @returns The payload result with hostPath and permissionPath, or null if logging is disabled/misconfigured
 */
export declare function buildWorktreeCompletionPayload(config: PluginConfig, options: {
    projectDir: string;
    loopName: string;
    completionTimestamp: Date;
    iteration: number;
    worktreeBranch?: string;
    dataDir?: string;
}, logger?: Logger): BuildWorktreeCompletionPayloadResult | null;
/**
 * Writes a worktree completion log entry from a prepared payload.
 * This is the host-side writer that should be called from a host session context.
 *
 * @returns true on success, false on failure (fails closed)
 */
export declare function writeWorktreeCompletionLog(payload: WorktreeCompletionLogPayload, logger?: Logger): boolean;
//# sourceMappingURL=worktree-log.d.ts.map