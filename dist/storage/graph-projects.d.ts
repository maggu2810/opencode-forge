/**
 * Graph cache project inventory helpers.
 *
 * This module provides canonical helpers for enumerating and managing
 * graph cache directories stored under <dataDir>/graph/<projectId::cwd-hash>/graph.db
 */
export { hashProjectId, hashGraphCacheScope } from '../graph/scope-hash';
/**
 * Result of graph cache directory enumeration
 */
export interface GraphCacheEntry {
    /** Hash directory name (16-character SHA256 prefix) */
    hashDir: string;
    /** Absolute path to graph.db file */
    graphDbPath: string;
    /** Project ID if successfully resolved, null if unknown */
    projectId: string | null;
    /** Cwd scope if successfully resolved, null if unknown */
    cwdScope: string | null;
    /** Friendly project name if available (from opencode.db), null otherwise */
    projectName: string | null;
    /** Resolution status: 'known' if projectId resolved, 'unknown' otherwise */
    resolutionStatus: 'known' | 'unknown';
    /** File size in bytes */
    sizeBytes: number;
    /** Last modification time as Unix timestamp (ms) */
    mtimeMs: number;
    /** Display name combining project and worktree info */
    displayName: string;
}
/**
 * Hashes a project ID using SHA256 and returns the first 16 hex characters.
 * This matches the hashing logic used in src/graph/database.ts
 *
 * @param projectId - The project ID to hash
 * @returns 16-character hex string
 */
/**
 * Resolves the graph cache directory path for a given project ID and cwd.
 * The cache identity is derived from both projectId and normalized cwd to ensure
 * worktree sessions with the same logical project ID use separate caches.
 *
 * @param projectId - The project ID
 * @param cwd - The working directory scope
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns Absolute path to the graph cache directory
 */
export declare function resolveGraphCacheDir(projectId: string, cwd: string, dataDir?: string): string;
/**
 * Legacy overload for backward compatibility when only project ID and dataDir are provided.
 * Falls back to project-only hashing for non-worktree scenarios.
 */
export declare function resolveGraphCacheDirLegacy(projectId: string, dataDir?: string): string;
/**
 * Checks if a graph cache directory exists for a given project ID.
 * Note: This is a legacy function that doesn't account for worktree scopes.
 * Use with caution in worktree scenarios.
 *
 * @param projectId - The project ID
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns true if the graph cache directory exists
 */
export declare function hasGraphCache(projectId: string, dataDir?: string): boolean;
/**
 * Enumerates all graph cache directories under the data directory.
 *
 * This function scans the <dataDir>/graph/ directory and returns information
 * about each discovered graph cache entry. It attempts to resolve project
 * identity by matching against known project IDs from opencode.db.
 *
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns Array of graph cache entries
 */
export declare function enumerateGraphCache(dataDir?: string): GraphCacheEntry[];
/**
 * Finds a graph cache entry by project ID or hash directory.
 *
 * @param identifier - Either a project ID or hash directory name
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns The matching graph cache entry or null if not found
 */
export declare function findGraphCacheEntry(identifier: string, dataDir?: string): GraphCacheEntry | null;
/**
 * Deletes a graph cache directory.
 *
 * This function removes the entire graph cache directory for a given
 * hash directory name. It does NOT delete any KV store data.
 *
 * @param hashDir - The 16-character hash directory name to delete
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns true if deletion was successful, false otherwise
 */
export declare function deleteGraphCacheDir(hashDir: string, dataDir?: string): boolean;
/**
 * Deletes a graph cache directory by project ID and cwd scope.
 * This is a convenience wrapper that computes the hash from projectId + cwd
 * and delegates to deleteGraphCacheDir.
 *
 * @param projectId - The project ID
 * @param cwd - The working directory scope
 * @param dataDir - Optional data directory (defaults to resolved data dir)
 * @returns true if deletion was successful, false otherwise
 */
export declare function deleteGraphCacheScope(projectId: string, cwd: string, dataDir?: string): boolean;
//# sourceMappingURL=graph-projects.d.ts.map